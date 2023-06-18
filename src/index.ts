import express from "express";
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
import { getChannelImages, getChannels, upsertChannel, upsertImage } from "./queries.queries";

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
    res.render("snippets/images", { images });
  });
});

app.get("/channels/:channelName", async (req, res) => {
  res.render("channel", { channelName: req.params.channelName });
});

app.post("/interactions", async (req, res) => {
  console.log("body", req.body);
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({
      type: InteractionResponseType.PONG,
    });
  }

  console.log(type, data);
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

    console.log(workbookChannels.map(c => c.name));
  });

  console.log(workbookChannels.map(c => c.name));

  for (const c of workbookChannels) {
    await client.api.channels.getMessages(c.id, { limit: 100 }).then(async (messages) => {
      for (const m of messages) {
        handleImageGenMessage(m);
      }
    });
  }
});

const promptRegex = /\*\*(.*?)\*\*/g;

const handleImageGenMessage = async (message: APIMessage) => {
  const { author, content, attachments, components } = message;
  // Check for MidJourney bot
  if (!author) return;
  if (author.username !== "Midjourney Bot") return;

  // Ignore waiting to start messages
  if (content.includes("Waiting to start")) return;

  if (content.includes("Image #")) {
    console.log("Image upscale message, ignoring");
  }

  withDBClient(async (dbClient) => {
    console.log(content);
    const promptMatch = content.matchAll(promptRegex);

    if (!promptMatch) {
      console.error(`Could not extract prompt from "${content}"`);
      return;
    }

    const prompt = promptMatch.next().value[1];

    if (attachments.length !== 1) {
      console.error(`Expected 1 attachment, got ${attachments.length}`);
      return;
    }

    const [attachment] = attachments;

    const image = {
      messageId: message.id,
      channelId: message.channel_id,
      imageUrl: attachment.url,
      prompt,
    };

    console.log(image);

    // now extract attachments into array
    await upsertImage.run(image, dbClient);
  });
};

client.on(GatewayDispatchEvents.MessageCreate, (event) => {
  const { data } = event;
  const { author } = data;

  handleImageGenMessage(event.data);
});

gateway.connect();

console.log(`Opened Discord gateway`);
