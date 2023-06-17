import express from "express";
import morgan from "morgan";

import { InteractionResponseType, InteractionType } from "discord-interactions";
import { VerifyDiscordRequest } from "./discord";

import { Client as DiscordClient, GatewayDispatchEvents, GatewayIntentBits } from "@discordjs/core";
import { WebSocketManager } from "@discordjs/ws";

import { REST } from "@discordjs/rest";
import { Client as PGClient } from "pg";
import config from "../config.json";

const dbClient = new PGClient({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  database: "mjworkbook",
});

const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", {});
});

app.use(morgan("combined"));

app.use(express.json({ verify: VerifyDiscordRequest(config.discordPublicKey) }));

app.post("/mj-workbook/interactions", async (req, res) => {
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

client.on(GatewayDispatchEvents.MessageCreate, (message) => {
  // OK so.
  console.log(message);
});

client.on(GatewayDispatchEvents.MessageUpdate, (message) => {
  const { data } = message;
  const { author } = data;

  // Check for MidJourney bot
  if (!author) return;
  if (author.id !== "936929561302675456") return;

  // Attachments
  // Components
  data.components?.forEach(c => {
    console.log("component", c);
  });
});

gateway.connect();

console.log(`Opened Discord gateway`);
