import Key from "../../schema/keys/index.js";
import UserSchema from "../../schema/user/index.js";

export const checkExpiredKeysLogic = async () => {
  const allKeys = await Key.find({ status: true });

  for (const keyObj of allKeys) {
    const now = Date.now();
    const expiresAt = keyObj.date.ending_date_timestamp;

    if (expiresAt && now > expiresAt) {
      console.log(`❌ Ключ просрочен для user_id ${keyObj.user_id}`);

      // Удаление ключа из коллекции
      await Key.deleteOne({ _id: keyObj._id });

      // Обновление профиля пользователя
      const user = await UserSchema.findOne({
        "tg_profile.user_id": keyObj.user_id,
      });

      if (user) {
        user.vpn.key = null;
        user.vpn.status = false;
        user.vpn.status_name = "Not Active";
        user.vpn.starting_date = null;
        user.vpn.starting_date_timestamp = null;
        user.vpn.ending_date = null;
        user.vpn.ending_date_timestamp = null;
        await user.save();
      }
    } else {
      const timeLeft = expiresAt - now;
      const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      console.log(
        `✅ Ключ активен для user_id ${keyObj.user_id}. Осталось ~${daysLeft} дней`
      );
    }
  }
};
