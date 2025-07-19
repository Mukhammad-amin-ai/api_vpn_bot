import mongoose from "mongoose";

const TelegramProfile = new mongoose.Schema({
  user_id: { type: Number, required: true },
  first_name: { type: String },
  user_name: { type: String },
});

const VpnStatus = new mongoose.Schema({
  key: { type: Number, default: null },
  starting_date: { type: Number, default: null },
  status_is_active: { type: Boolean, default: false },
  ending_date: { type: Number, default: null },
});

const Users = new mongoose.Schema({
  tg_profile: {
    type: TelegramProfile,
  },
  status: {
    type: VpnStatus,
  },
});

export default mongoose.model("Users", Users);
