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
});
