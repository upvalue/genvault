import express from "express";
import morgan from "morgan";

import { InteractionResponseType, InteractionType } from "discord-interactions";
import idGenerator from "stripe-id-generator";
import { VerifyDiscordRequest } from "./discord";

import { Client as DiscordClient, GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import { WebSocketManager } from "@discordjs/ws";

import { REST } from "@discordjs/rest";
import { Client as PGClient } from "pg";
import config from "../config.json";
import { getChannelImages, getChannels, insertImage, upsertChannel } from "./queries.queries";

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

client.on(GatewayDispatchEvents.Ready, (msg) => {
  msg.data.guilds.forEach(g => {
    client.api.guilds.getChannels(g.id).then(async channels => {
      const workbookCategory = channels.find(c => c.name === "mj-workbook");
      if (!workbookCategory) {
        console.error("Could not find #mj-workbook category");
        return;
      }

      // @ts-expect-error
      const workbookChannels = channels.filter(c => c.parent_id === workbookCategory.id);

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
  });
});

const promptRegex = /\*\*(.*?)\*\*/g;
client.on(GatewayDispatchEvents.MessageCreate, (message) => {
  const { data } = message;
  const { author } = data;

  // Check for MidJourney bot
  if (!author) return;
  if (author.username !== "Midjourney Bot") return;

  // Ignore waiting to start messages
  if (data.content.includes("Waiting to start")) return;

  withDBClient(async (dbClient) => {
    const promptMatch = promptRegex.exec(data.content);

    if (!promptMatch) {
      console.error(`Could not extract prompt from ${data.content}`);
      return;
    }

    const prompt = promptMatch[1];

    if (data.attachments.length !== 1) {
      console.error(`Expected 1 attachment, got ${data.attachments.length}`);
      return;
    }

    const [attachment] = data.attachments;

    // now extract attachments into array
    await insertImage.run({
      messageId: data.id,
      channel: data.channel_id,
      imageUrl: attachment.url,
      prompt,
    }, dbClient);
  });

  console.log(message);

  // Attachments
  // Components
  /*data.components?.forEach(c => {
    console.log("component", c);
  });*/

  console.log(data.components);
});

gateway.connect();

console.log(`Opened Discord gateway`);
