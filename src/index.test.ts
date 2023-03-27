import axios from "axios";

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

describe("API Routes", () => {
  // Test / route
  describe("GET /hello", () => {
    it('should contain "Hello world, the time is currently"', async () => {
      const res = await axios.get(`${BASE_URL}/hello`);
      expect(res.status).toEqual(200);
      expect(res.data).toContain("Hello world, the time is currently");
    });

    it("should increment api counter", async () => {
      const metadataRes = await axios.get(`${BASE_URL}/metadata`);
      const baseCount = metadataRes.data.currentApiCount;

      await axios.get(`${BASE_URL}/hello`);

      const metadataRes2 = await axios.get(`${BASE_URL}/metadata`);
      const newCount = metadataRes2.data.currentApiCount;
      const additionalApiRequestsCount = 2;

      expect(newCount).toEqual(baseCount + additionalApiRequestsCount);
    });
  });

  // Test /health route
  describe("GET /health", () => {
    it("should return status 204", async () => {
      const res = await axios.get(`${BASE_URL}/health`);
      expect(res.status).toEqual(204);
    });

    it("should not increment api counter", async () => {
      const metadataRes = await axios.get(`${BASE_URL}/metadata`);
      const baseCount = metadataRes.data.currentApiCount;

      await axios.get(`${BASE_URL}/health`);
      await axios.get(`${BASE_URL}/health`);

      const metadataRes2 = await axios.get(`${BASE_URL}/metadata`);
      const newCount = metadataRes2.data.currentApiCount;
      const additionalApiRequestsCount = 1;

      expect(newCount).toEqual(baseCount + additionalApiRequestsCount);
    });
  });

  // Test /metadata route
  describe("GET /metadata", () => {
    it("should return metadata object", async () => {
      const res = await axios.get(`${BASE_URL}/metadata`);
      expect(res.status).toEqual(200);
      expect(res.data).toHaveProperty("commitHash");
      expect(res.data).toHaveProperty("currentApiCount");
    });

    it("should contain commit hash from env variable object", async () => {
      const res = await axios.get(`${BASE_URL}/metadata`);
      expect(res.data.commitHash).toEqual("75e6b26b21f404b05c5e0646de06e7c7271f5cb2");
    });

    it("should increment api counter", async () => {
      const res = await axios.get(`${BASE_URL}/metadata`);
      const baseCount = res.data.currentApiCount;

      const res2 = await axios.get(`${BASE_URL}/metadata`);
      const newCount = res2.data.currentApiCount;
      const additionalApiRequestsCount = 1;

      expect(newCount).toEqual(baseCount + additionalApiRequestsCount);
    });
  });

  // Test /calculate route
  describe("GET & POST /calculate failed path", () => {
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

    it("should 405 on GET requests", async () => {
      try {
        const res = await axios.get(`${BASE_URL}/calculate`);
        expect("get /calculate to fail").toBe("request succeeded unexpectedly")
      } catch (error: any) {
        expect(error.response.status).toEqual(405);
      }
    });

    it("should error when using appName isn't specified", async () => {
      try {
        const res = await axios.post(`${BASE_URL}/calculate`, payload);
        expect("post /calculate to fail").toBe("request succeeded unexpectedly")
      } catch (error: any) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data.error).toContain("No appName specified");
      }
    });

    it("should error when payload is invalid", async () => {
      try {
        const res = await axios.post(`${BASE_URL}/calculate`, {});
        expect("post /calculate to fail").toBe("request succeeded unexpectedly")
      } catch (error: any) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data.error).toContain("Invalid");
      }
    });

    it("should error when appName does not match payload", async () => {
      try {
        const res = await axios.post(`${BASE_URL}/calculate?appName=grafana`, payload);
        expect("post /calculate to fail").toBe("request succeeded unexpectedly")
      } catch (error: any) {
        expect(error.response.status).toEqual(400);
        expect(error.response.data.error).toContain("No metrics");
      }
    });
  });

  describe("POST /calculate success path", () => {
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

    it("should calculate recommendation on single app payload", async () => {
      const res = await axios.post(`${BASE_URL}/calculate?appName=alertmanager`, payload);
      expect(res.status).toBe(200)
      expect(res.data.requests["memory(MiB)"]).toBe(500);
      expect(res.data.limits["memory(MiB)"]).toBe(500);
      expect(res.data.requests["cpu(mCores)"]).toBe(1500);
      expect(res.data.limits["cpu(mCores)"]).toBe(2000);
      expect(res.data.error).toBeUndefined
    });

    it("should calculate grafana recommendation on multi app payload", async () => {
      const res = await axios.post(`${BASE_URL}/calculate?appName=grafana`, multiAppPayload);
      expect(res.status).toBe(200)
      expect(res.data.requests["memory(MiB)"]).toBe(500);
      expect(res.data.limits["memory(MiB)"]).toBe(500);
      expect(res.data.requests["cpu(mCores)"]).toBe(1000);
      expect(res.data.limits["cpu(mCores)"]).toBe(1500);
      expect(res.data.error).toBeUndefined
    });

    it("should calculate prometheus recommendation on multi app payload", async () => {
      const res = await axios.post(`${BASE_URL}/calculate?appName=prometheus`, multiAppPayload);
      expect(res.status).toBe(200)
      expect(res.data.requests["memory(MiB)"]).toBe(5000);
      expect(res.data.limits["memory(MiB)"]).toBe(5500);
      expect(res.data.requests["cpu(mCores)"]).toBe(36500);
      expect(res.data.limits["cpu(mCores)"]).toBe(40500);
      expect(res.data.error).toBeUndefined
    });
  });
});
