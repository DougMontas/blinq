// const mongoose = require("mongoose");

// const ConfigurationSchema = new mongoose.Schema({
//   hardcodedEnabled: {
//     type: Boolean,
//     default: false,
//   },
//   // You can add additional global configuration fields here in the future.
// });

// module.exports = mongoose.model("Configuration", ConfigurationSchema);

// backend/models/Configuration.js
import mongoose from "mongoose";

const configurationSchema = new mongoose.Schema({
  hardcodedEnabled: { type: Boolean, default: false },
  // → add any other global flags here
}, { timestamps: true });

export default mongoose.model("Configuration", configurationSchema);
