import consoleStamp from "console-stamp";
import express from "express";
import logger from "morgan";
import * as path from "path";
import "dotenv/config";
import Replicate from "replicate";
import { sdSchema } from "./api";

export const app = express();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

app.use(logger("dev"));

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("channel open");
});

app.post("/api/generate-sd-image", async (req, res) => {
  try {
    console.log(req.body);
    const input = sdSchema.parse(req.body);

    const { prompt } = input;

    const output = await replicate.run(
      "stability-ai/sdxl:d830ba5dabf8090ec0db6c10fc862c6eb1c929e1a194a5411852d25fd954ac82",
      {
        input: {
          prompt,
        },
      },
    );

    // const output = ["https://pbxt.replicate.delivery/91Qf4lojj1zeV02RS26j9zZDIew3kVPfDaHyGdK3VdcHMOEGB/out-0.png"];

    console.log("Generated output", output);

    res.status(200).json(output);
  } catch (e: any) {
    return res.status(400).json({ error: e.toString() });
  }
});

app.listen({
  port: process.env.PORT || 3001,
  host: process.env.HOST || "0.0.0.0",
});

console.log(`Listening on port`, process.env.PORT || 3001);

consoleStamp(console);
