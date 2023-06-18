import express from "express";
import _ from "lodash";
import morgan from "morgan";

import { InteractionResponseType, InteractionType } from "discord-interactions";
import idGenerator from "stripe-id-generator";
import { VerifyDiscordRequest } from "./discord";

import {
  APIChannel,
  APIMessage,
  Client as DiscordClient,
  GatewayDispatchEvents,
  GatewayIntentBits,
  WithIntrinsicProps,
} from "@discordjs/core";
import { WebSocketManager } from "@discordjs/ws";

import { REST } from "@discordjs/rest";
import { Client as PGClient } from "pg";
import config from "../config.json";
import {
  getChannelImages,
  getChannels,
  getImageUpscales,
  upsertChannel,
  upsertImage,
  upsertUpscaledImage,
} from "./queries.queries";

const uuidGen = new idGenerator();

const withDBClient = async <T>(fn: (dbCli: PGClient) => T): Promise<void> => {
  const client = new PGClient({
    host: config.database.host,
    port: config.database.port,
    password: config.database.password,
    user: config.database.user,
    database: config.database.database,
  });

  await client.connect();
  await fn(client);
  await client.end();
};

const app = express();

app.set("view engine", "ejs");

app.use("/public", express.static("public"));

app.use(morgan("combined"));

app.use(express.json({ verify: VerifyDiscordRequest(config.discordPublicKey) }));

app.get("/", (req, res) => {
  res.render("index.ejs", {});
});

app.get("/snippets/channels", async (req, res) => {
  await withDBClient(async (dbClient) => {
    const channels = await getChannels.run(undefined, dbClient);

    res.render("snippets/channels", { channels });
  });
});

app.get("/channels/:channelName/images", async (req, res) => {
  await withDBClient(async (dbClient) => {
    const images = await getChannelImages.run({ channelName: req.params.channelName }, dbClient);
    const upscales = await getImageUpscales.run({ messageIds: images.map(i => i.message_id) }, dbClient);

    const upscalesByMessageId = _.groupBy(upscales, u => u.image_message_id);

    const imagesWithUpscales = images.map(i => {
      return {
        ...i,
        upscales: upscalesByMessageId[i.message_id] || [],
      };
    });

    res.render("snippets/images", { images: imagesWithUpscales });
  });
});

app.get("/channels/:channelName", async (req, res) => {
  res.render("channel", { channelName: req.params.channelName });
});

app.post("/interactions", async (req, res) => {
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    console.log("Discord API Ping");
    return res.send({
      type: InteractionResponseType.PONG,
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  if (listener) {
    const addr = listener.address();
    if (addr && typeof addr !== "string") {
      console.log(`API listening on port ${addr.port}`);
    }
  }
});

const rest = new REST({ version: "10" }).setToken(config.discordBotToken);

const gateway = new WebSocketManager({
  token: config.discordBotToken,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

const client = new DiscordClient({
  rest,
  gateway,
});

client.on(GatewayDispatchEvents.Ready, async (msg) => {
  if (msg.data.guilds.length !== 1) {
    console.error("Expected to be in exactly one guild, got", msg.data.guilds.length);
    process.exit(1);
  }

  let workbookChannels: APIChannel[] = [];

  await client.api.guilds.getChannels(msg.data.guilds[0].id).then(async channels => {
    const workbookCategory = channels.find(c => c.name === "mj-workbook");
    if (!workbookCategory) {
      console.error("Could not find #mj-workbook category");
      return;
    }

    // @ts-expect-error
    workbookChannels = channels.filter(c => c.parent_id === workbookCategory.id);

    console.log(
      `Found ${workbookChannels.length} workbook channels: ${workbookChannels.map(c => `#${c.name}`).join(", ")}`,
    );

    await withDBClient(async (dbClient) => {
      await dbClient.query("BEGIN");
      await Promise.all(workbookChannels.map(async (c) => {
        return upsertChannel.run({
          name: c.name,
          channel_id: c.id,
        }, dbClient);
      }));

      await dbClient.query("COMMIT");
    });
  });

  for (const c of workbookChannels) {
    await client.api.channels.getMessages(c.id, { limit: 100 }).then(async (messages) => {
      // handle generated before upscaled when booting because we assume they exist in db
      const [generated, upscaled] = _.partition(messages, m => midjourneyImageDetails(m).type === "ImageGenerated");
      for (const m of generated) {
        await handleImageMessage(m);
      }
      for (const m of upscaled) {
        await handleImageMessage(m);
      }
    });
  }
});

const promptRegex = /\*\*(.*?)\*\*/g;

type MidjourneyImageMessageWithPrompt = {
  type: "ImageGenerated" | "ImageUpscaled";
  prompt: string;
};

type NotMidjourneyImageMessage = {
  type: "NotMidjourney";
};

type IgnoreMessage = {
  type: "Ignore";
};

type ImageGeneratedMessage = {
  type: "ImageGenerated";
  prompt: string;
};

type ImageUpscaledMessage = {
  type: "ImageUpscaled";
  prompt: string;
};

type UnknownMessage = {
  type: "Unknown";
};

type MidjourneyImageMessage =
  | ImageGeneratedMessage
  | ImageUpscaledMessage
  | NotMidjourneyImageMessage
  | IgnoreMessage
  | UnknownMessage;

const midjourneyImageDetails = (message: APIMessage): MidjourneyImageMessage => {
  const { author, content } = message;
  if (!author || author.username !== "Midjourney Bot") {
    return {
      type: "NotMidjourney",
    };
  }

  if (content.includes("Waiting to start")) {
    return {
      type: "Ignore",
    };
  }

  let upscaled = false;

  if (content.includes("Image #")) {
    upscaled = true;
  }

  const promptMatch = content.matchAll(promptRegex);

  if (!promptMatch) {
    throw new Error(`Could not extract prompt from "${content}"`);
  }

  const prompt = promptMatch.next().value[1];

  return {
    type: upscaled ? "ImageUpscaled" : "ImageGenerated",
    prompt,
  };
};

const handleImageMessage = async (message: APIMessage) => {
  const { author, content, attachments, components } = message;

  const imageDetails = midjourneyImageDetails(message);

  if (imageDetails.type === "NotMidjourney") {
    console.log(`Ignoring message ${message.id} ${message.content} as it is not from midjourney bot`);
    return;
  } else if (imageDetails.type === "ImageUpscaled") {
    withDBClient(async (dbClient) => {
      if (attachments.length !== 1) {
        console.error(`Expected 1 attachment, got ${attachments.length}`);
        return;
      }

      const [attachment] = attachments;

      const { referenced_message } = message;

      if (!referenced_message) {
        console.error(`Expected upscaled image message to be a reply, got ${message.id} ${message.content}`);
        return;
      }

      const image = {
        upscaleMessageId: message.id,
        imageMessageId: referenced_message.id,
        imageUrl: attachment.url,
      };

      await upsertUpscaledImage.run(image, dbClient);

      console.log("Upserted upscaled image", image.upscaleMessageId);
    });
  } else if (imageDetails.type === "ImageGenerated") {
    withDBClient(async (dbClient) => {
      if (attachments.length !== 1) {
        console.error(`Expected 1 attachment, got ${attachments.length}`);
        return;
      }

      const [attachment] = attachments;

      const image = {
        messageId: message.id,
        channelId: message.channel_id,
        imageUrl: attachment.url,
        prompt: imageDetails.prompt,
      };

      // now extract attachments into array
      await upsertImage.run(image, dbClient);

      console.log("Upserted image", image.messageId, image.prompt);
    });
  } else if (imageDetails.type === "Unknown") {
    console.error(`Unknown midjourney image type ${message.id} ${message.content}`);
  }
};

client.on(GatewayDispatchEvents.MessageCreate, (event) => {
  const { data } = event;

  handleImageMessage(event.data);
});

gateway.connect();

console.log(`Opened Discord gateway`);
