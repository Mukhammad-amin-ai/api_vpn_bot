import mongoose from "mongoose";

const TelegramProfile = new mongoose.Schema({
  user_id: { type: Number, required: true },
  first_name: { type: String },
  user_name: { type: String },
});

const VpnStatus = new mongoose.Schema({
  key: { type: String, required: true },
  status: { type: Boolean, default: false },
  status_name: { type: String, required: true },
  starting_date: { type: Date, default: null },
  starting_date_timestamp: { type: Number, default: null },
  ending_date: { type: Date, default: null },
  ending_date_timestamp: { type: Number, default: null },
});

const UserSchema = new mongoose.Schema({
  tg_profile: TelegramProfile, // ✅ не надо { type: ... }
  vpn: VpnStatus, // ✅ так же
});

export default mongoose.model("User", UserSchema);
