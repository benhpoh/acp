export enum Metric {
  cpu = "cpu usage (mcores)",
  memory = "memory usage (MiB)",
}

interface UsageMetric {
  app: string;
  time: string | Date;
  [Metric.cpu]: number;
  [Metric.memory]: number;
};

export type UsageMetrics = UsageMetric[];

interface MaxUsage {
  maxMemory: number;
  maxCpu: number;
};

interface Resource {
  "memory(MiB)": number;
  "cpu(mCores)": number;
};

interface ResourceRecommendation {
  requests: Resource;
  limits: Resource;
  error?: string;
};

export const getAverage = (metrics: UsageMetrics, resource: Metric): number => {
  const totalUsage = metrics
    .map((metric) => metric[resource])
    .reduce((total, current) => total + current);
  const count = metrics.length;

  return totalUsage / count;
};

export const getMax = (metrics: UsageMetrics): MaxUsage => {
  const maxMemory: number = metrics.sort(
    (a, b) => b[Metric.memory] - a[Metric.memory] // Sort usage in descending order
  )[0][Metric.memory];

  const maxCpu: number = metrics.sort(
    (a, b) => b[Metric.cpu] - a[Metric.cpu] // Sort usage in descending order
  )[0][Metric.cpu];

  return { maxMemory, maxCpu };
};

const roundUpResourceValue = (num: number, roundValue:number = 500) => {
  return Math.ceil(num / roundValue) * roundValue;
};

export const calculateResources = (
  metrics: UsageMetrics, appName: string
): ResourceRecommendation => {
  const filteredMetrics = metrics.filter(metric => metric.app === appName)
  if (filteredMetrics.length === 0) {
    const errorMessage = `No metrics found for app: ${appName}`
    return {
      requests: {
        "memory(MiB)": 0,
        "cpu(mCores)": 0,
      },
      limits: {
        "memory(MiB)": 0,
        "cpu(mCores)": 0,
      },
      error: errorMessage
    }
  }

  const averageMemory = getAverage(filteredMetrics, Metric.memory);
  const averageCpu = getAverage(filteredMetrics, Metric.cpu);
  const { maxMemory, maxCpu } = getMax(filteredMetrics);
  const limitBuffer = 1.1 // Allow extra 10% buffer on top of logged max consumption

  const recommendedResources = {
    requests: {
      "memory(MiB)": roundUpResourceValue(averageMemory),
      "cpu(mCores)": roundUpResourceValue(averageCpu),
    },
    limits: {
      "memory(MiB)": roundUpResourceValue(maxMemory * limitBuffer),
      "cpu(mCores)": roundUpResourceValue(maxCpu * limitBuffer),
    },
  };

  return recommendedResources;
};
