import axios from "axios";
import https from "https";
import dotenv from "dotenv";

const envFile = process.env.NODE_ENV === "local" ? ".env.local" : ".env";
dotenv.config({ path: envFile });

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.API_URL,
  timeout: 1000,
  headers: { Authorization: `Bearer ${process.env.API_CERT}` },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

class VPNController {
  async getAccessKeys(req, res) {
    try {
      const response = await AXIOS_INSTANCE.get(`/access-keys`);
      return res.json({ key: response.data });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }

  async getAccessKeysById(req, res) {
    try {
      const { id } = req.params;
      const response = await AXIOS_INSTANCE.get(`/access-keys/${id}`);
      return res.json({ key: response.data });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }

  async generateKey(req, res) {
    try {
      const { name } = req.body;
      const response = await AXIOS_INSTANCE.post("/access-keys", {
        name: name,
      });
      return res.json({ key: response.data });
    } catch (error) {
      console.error(error);
      res.status(500).json(error);
    }
  }
}

export default new VPNController();
