import dotenv from "dotenv";
import axios from "axios";
import https from "https";
import Key from "../../schema/keys/index.js";
import UserSchema from "../../schema/user/index.js";
import { checkExpiredKeysLogic } from "../cron/index.js";

import { v4 as uuidv4 } from "uuid";

const envFile = process.env.NODE_ENV === "local" ? ".env.local" : ".env";
dotenv.config({ path: envFile });

const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;

const HandleDate = (time, created) => {
  const createdDate = new Date(created);
  let endingDate = new Date(createdDate); // копия даты

  if (time === "month") {
    endingDate.setMonth(endingDate.getMonth() + 1);
  }

  if (time === "year") {
    endingDate.setFullYear(endingDate.getFullYear() + 1);
  }

  return {
    created_at: createdDate.toISOString(),
    created_at_timestamp: createdDate.getTime(),
    ending_at: endingDate.toISOString(),
    ending_at_timestamp: endingDate.getTime(),
  };
};

const AXIOS_INSTANCE = axios.create({
  baseURL: process.env.API_URL,
  timeout: 1000,
  headers: { Authorization: `Bearer ${process.env.API_CERT}` },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

class User {
  async CreatePayment(req, res) {
    const { userId, time, amount, description } = req.body;
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
            return_url: "https://api-vpn-bot.vercel.app/api/callback",
          },
          capture: true,
          description: description || "Оплата",
          metadata: {
            telegram_id: userId,
            deadline: time,
          },
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

      if (event.event === "payment.succeeded") {
        const deadline = event.object.metadata.deadline;
        const telegram_id = event.object.metadata.telegram_id;

        const generated_key = await AXIOS_INSTANCE.post("/access-keys", {
          name: telegram_id,
        });

        if (generated_key.status === 201) {
          const message = `✅ ${
            deadline === "month" ? "1 Месяц" : "1 Год"
          } подписка успешно оплачена\\!

🥳 Теперь вы можете пользоваться *SUPERPUPER VPN*\\. Для этого:

1️⃣ Скачайте клиент *Outline*  
2️⃣ Добавьте ключ доступа, предоставленный ботом, в приложение  
3️⃣ Нажмите кнопку *«Подключить»*

Для активации ключа доступа нажмите на код:

\`\`\`
${generated_key.data.accessUrl}
\`\`\`
          `;
          const accessurl = generated_key.data.accessUrl;
          const createdAt = event.object.created_at || event.created_at;

          const {
            created_at,
            created_at_timestamp,
            ending_at,
            ending_at_timestamp,
          } = HandleDate(deadline, createdAt);

          const key = await Key.create({
            user_id: telegram_id,
            key: accessurl,
            status: true,
            status_name: "Activated",
            date: {
              starting_date: created_at,
              starting_date_timestamp: created_at_timestamp,
              ending_date: ending_at,
              ending_date_timestamp: ending_at_timestamp,
            },
          });

          await key.save();

          const user = await UserSchema.findOne({
            "tg_profile.user_id": telegram_id,
          });

          user.vpn = {
            key: key.key,
            status: key.status,
            status_name: key.status_name,
            starting_date: key.date.starting_date,
            starting_date_timestamp: key.date.starting_date_timestamp,
            ending_date: key.date.ending_date,
            ending_date_timestamp: key.date.ending_date_timestamp,
          };
          await user.save();
          await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
            {
              chat_id: telegram_id,
              text: message,
              parse_mode: "MarkdownV2",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Cкачать Outline Client",
                      url: "https://play.google.com/store/apps/details?id=org.outline.android.client",
                    },
                  ],
                ],
              },
            }
          );
        } else {
          console.error("Ошибка при генерации ключа:", generated_key.data);
        }
        return res.sendStatus(200);
      }
      return res.sendStatus(400);
    } catch (error) {
      console.error(
        "Ошибка при отправке в Telegram:",
        error.response?.data || error.message
      );
      return res.sendStatus(500);
    }
  }

  async CheckExpiredKeys(req, res) {
    try {
      await checkExpiredKeysLogic();
      res.status(200).json({message:"OK"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Ошибка при проверке ключей" });
    }
  }
}

export default new User();
