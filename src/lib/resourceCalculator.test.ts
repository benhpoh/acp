import {
  calculateResources,
  getAverage,
  getMax,
  Metric,
} from "./resourceCalculator";

describe("Single app resource calculator", () => {
  let payload = [
    {
      app: "alertmanager",
      time: "20227-21T06:35:00.000Z",
      "cpu usage (mcores)": 500.1,
      "memory usage (MiB)": 29.5,
    },
    {
      app: "alertmanager",
      time: "20227-21T06:40:00.000Z",
      "cpu usage (mcores)": 1000.1,
      "memory usage (MiB)": 28.5,
    },
    {
      app: "alertmanager",
      time: "20227-21T06:45:00.000Z",
      "cpu usage (mcores)": 1500.1,
      "memory usage (MiB)": 27.5,
    },
  ];

  describe("get average", () => {
    it("should calculate average memory usage", async () => {
      const averageMemoryUsage = getAverage(payload, Metric.memory);
      expect(averageMemoryUsage).toBe(28.5);
    });

    it("should calculate average cpu usage", async () => {
      const averageCpuUsage = getAverage(payload, Metric.cpu);
      expect(averageCpuUsage).toBe(1000.1);
    });
  });

  describe("get max", () => {
    it("should calculate max memory usage", async () => {
      const { maxMemory } = getMax(payload);
      expect(maxMemory).toBe(29.5);
    });

    it("should calculate max cpu usage", async () => {
      const { maxCpu } = getMax(payload);
      expect(maxCpu).toBe(1500.1);
    });
  });

  describe("get recommendation", () => {
    it("should calculate memory recommendations", async () => {
      const { requests, limits, error } = calculateResources(payload, "alertmanager");
      expect(requests["memory(MiB)"]).toBe(500);
      expect(limits["memory(MiB)"]).toBe(500);
      expect(error).toBeUndefined
    });

    it("should calculate cpu recommendations", async () => {
      const { requests, limits, error } = calculateResources(payload, "alertmanager");
      expect(requests["cpu(mCores)"]).toBe(1500);
      expect(limits["cpu(mCores)"]).toBe(2000);
      expect(error).toBeUndefined
    });
  });
});

describe("Multi app resource calculator", () => {
  let multiAppPayload = [
    {
      app: "grafana",
      time: "20227-21T17:50:00.000Z",
      "cpu usage (mcores)": 836.0255,
      "memory usage (MiB)": 189.692864,
    },
    {
      app: "grafana",
      time: "20227-21T17:55:00.000Z",
      "cpu usage (mcores)": 1050.4,
      "memory usage (MiB)": 191.27528,
    },
    {
      app: "grafana",
      time: "20227-21T18:00:00.000Z",
      "cpu usage (mcores)": 856.8555,
      "memory usage (MiB)": 190.156256,
    },
    {
      app: "prometheus",
      time: "20227-21T07:55:00.000Z",
      "cpu usage (mcores)": 36205.264,
      "memory usage (MiB)": 4924.854784,
    },
    {
      app: "prometheus",
      time: "20227-21T08:00:00.000Z",
      "cpu usage (mcores)": 36699.9072,
      "memory usage (MiB)": 4905.284608,
    },
    {
      app: "prometheus",
      time: "20227-21T08:05:00.000Z",
      "cpu usage (mcores)": 36133.3472,
      "memory usage (MiB)": 4979.423744,
    },
  ];

  describe("get recommendation", () => {
    it("should error on invalid app name", async () => {
      const { requests, limits, error } = calculateResources(multiAppPayload, "invalidApp");
      expect(requests["memory(MiB)"]).toBe(0);
      expect(limits["memory(MiB)"]).toBe(0);
      expect(requests["cpu(mCores)"]).toBe(0);
      expect(limits["cpu(mCores)"]).toBe(0);
      expect(error).toBeDefined
    });

    it("should calculate grafana memory recommendations", async () => {
      const { requests, limits } = calculateResources(multiAppPayload, "grafana");
      expect(requests["memory(MiB)"]).toBe(500);
      expect(limits["memory(MiB)"]).toBe(500);
    });

    it("should calculate grafana cpu recommendations", async () => {
      const { requests, limits } = calculateResources(multiAppPayload, "grafana");
      expect(requests["cpu(mCores)"]).toBe(1000);
      expect(limits["cpu(mCores)"]).toBe(1500);
    });

    it("should calculate prometheus memory recommendations", async () => {
      const { requests, limits } = calculateResources(multiAppPayload, "prometheus");
      expect(requests["memory(MiB)"]).toBe(5000);
      expect(limits["memory(MiB)"]).toBe(5500);
    });

    it("should calculate prometheus cpu recommendations", async () => {
      const { requests, limits } = calculateResources(multiAppPayload, "prometheus");
      expect(requests["cpu(mCores)"]).toBe(36500);
      expect(limits["cpu(mCores)"]).toBe(40500);
    });
  });
});
