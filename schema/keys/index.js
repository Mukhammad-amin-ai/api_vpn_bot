import mongoose from "mongoose";

const VpnKeys = new mongoose.Schema({
  user_id: { type: Number, required: true },
  key: { type: Number, required: true },
  starting_date: { type: Number, required: true, default: null },
  status_is_active: { type: Boolean, default: false, required: true },
  ending_date: { type: Number, required: true, default: null },
  status_name: { type: String, required: true },
});

export default mongoose.model("Keys", VpnKeys);
