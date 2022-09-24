/*
    Digital namebadge schema for storing user data and customisations
    by Matt Hall
*/
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BadgeSchema = new Schema({
  currentId: Number,
  lastUpdate: Date,
  macAddress: { type: String, trim: true, immutable: true },
  userData: {
    name: { type: String, trim: true },
    pronouns: { type: String, trim: true },
    affiliation: { type: String, trim: true },
    message: { type: String, trim: true },
    image: { type: String, trim: true },
  },
});

module.exports = mongoose.model("Badge", BadgeSchema);
