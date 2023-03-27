import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { incrementCounter, readCounterFromFile } from "./lib/apiCounter";
import { calculateResources, UsageMetrics } from "./lib/resourceCalculator";

let currentApiCount = readCounterFromFile();

const PORT = process.env.NODE_ENV === "PROD" ? process.env.PORT : 3000;
const app = express();
app.use(bodyParser.json())

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

app.get("/calculate", (req: Request, res: Response) => res.status(405).send({error: "Method not allowed."}))

app.post("/calculate", (req: Request, res: Response) => {
  currentApiCount = incrementCounter(currentApiCount);
  const metrics: UsageMetrics = req.body
  const { appName } = req.query

  if (!Array.isArray(metrics)) {
    return res.status(400).send({error: "Invalid payload."})
  }else if (!appName) {
    return res.status(400).send({error: "No appName specified within query string. Retry with ?appName=<yourappname>."})
  }

  const payload = calculateResources(metrics, appName as string)
  if (payload.error) {
    return res.status(400).send({error: payload.error})
  }
  res.json(payload)
})

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
