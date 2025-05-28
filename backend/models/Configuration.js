import mongoose from "mongoose";

const configurationSchema = new mongoose.Schema(
  {
    hardcodedEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Configuration", configurationSchema);
