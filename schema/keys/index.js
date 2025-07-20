import mongoose from "mongoose";

const DateSchema = new mongoose.Schema({
  starting_date: { type: Date, default: null },
  starting_date_timestamp: { type: Number, default: null },
  ending_date: { type: Date, default: null },
  ending_date_timestamp: { type: Number, default: null },
});

const VpnKeys = new mongoose.Schema({
  user_id: { type: Number, required: true },
  key: { type: String, required: true },
  status: { type: Boolean, default: false },
  status_name: { type: String, required: true },
  date: {
    type: DateSchema,
    default: () => ({}),
  },
});

export default mongoose.model("Keys", VpnKeys);
