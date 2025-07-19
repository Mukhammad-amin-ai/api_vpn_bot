import dotenv from "dotenv";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const TELEGRAM_BOT_TOKEN = "7738577791:AAFC4gQUbWk3XgLNRwniD8jYto0117J6xo4";
const TELEGRAM_CHAT_ID = "526075074";
class User {
  async CreatePayment(req, res) {
    const { amount, description } = req.body;
    try {
      const IDSH = uuidv4();
      const response = await axios.post(
        "https://api.yookassa.ru/v3/payments",
        {
          amount: {
            value: amount,
            currency: "RUB",
          },
          confirmation: {
            type: "redirect",
            return_url: "https://telegram-vpn-bot-web-app.vercel.app/callback", // заменишь позже
          },
          capture: true,
          description: description || "Оплата",
        },
        {
          auth: {
            username: process.env.YOOKASSA_SHOP_ID,
            password: process.env.YOOKASSA_SECRET_KEY,
          },
          headers: {
            "Idempotence-Key": IDSH,
          },
        }
      );
      console.log(IDSH);

      return res.json({
        data: response.data,
        confirmation_url: response.data.confirmation.confirmation_url,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Не удалось создать платеж" });
    }
  }

  async CatchWebhook(req, res) {
    try {
      const event = req.body;

      const prettyJson = JSON.stringify(event, null, 2);

      const message = `<b>📩 Новый Webhook от YooKassa</b>\n<pre>${prettyJson}</pre>`;
      await axios.post(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }
      );

      return res.sendStatus(200);
    } catch (error) {
      console.error(
        "Ошибка при отправке в Telegram:",
        error.response?.data || error.message
      );
    }
  }
}

export default new User();
