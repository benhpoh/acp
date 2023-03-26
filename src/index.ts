import express, { Request, Response } from "express";
import { incrementCounter, readCounterFromFile } from "./lib/apiCounter";

const app = express();
const PORT = process.env.NODE_ENV === "PROD" ? process.env.PORT : 3000;

let currentApiCount = readCounterFromFile();

app.get("/hello", (req: Request, res: Response) => {
  currentApiCount = incrementCounter(currentApiCount);

  const currentTime = new Date().toLocaleTimeString();
  res.send(`Hello world, the time is currently ${currentTime}.`);
});

app.get("/health", (req: Request, res: Response) => {
  res.status(204).send();
});

app.get("/metadata", (req: Request, res: Response) => {
  currentApiCount = incrementCounter(currentApiCount);

  const commitHash = process.env.COMMIT_HASH || "DEV";
  const payload = {
    commitHash,
    currentApiCount,
  };

  res.json(payload);
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
