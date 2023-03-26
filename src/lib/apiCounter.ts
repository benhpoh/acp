import { readFileSync, writeFileSync, existsSync } from "fs";

const COUNTER_FILE = process.env.COUNTER_FILE || "counter.txt";

export const readCounterFromFile = (): number => {
  try {
    let fileContent: string;
    if (existsSync(COUNTER_FILE)) {
      fileContent = readFileSync(COUNTER_FILE, 'utf8');
    } else {
      console.warn(`Counter file "${COUNTER_FILE}" not found. Creating new file.`);
      fileContent = '0';
      writeFileSync(COUNTER_FILE, fileContent, 'utf8');
    }
    return parseInt(fileContent);
  } catch (error) {
    console.error(`Error reading counter file: ${error}`);
    return 0;
  }

};

const writeCounterToFile = (newCount: number): void => {
  try {
    writeFileSync(COUNTER_FILE, newCount.toString(), "utf8");
  } catch (error) {
    console.error(`Error writing counter file: ${error}`);
  }
}

export const incrementCounter = (currentCount: number): number => {
  const newCount = currentCount + 1
  writeCounterToFile(newCount)
  return newCount
}