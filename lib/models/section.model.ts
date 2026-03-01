import mongoose from "mongoose";
import playerSchema from "./player.model";

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  timeControl: {
    type: String,
    trim: true,
  },
  sectionChiefTD: {
    type: String,
    trim: true,
  },
  sectionAssistantChiefTD: {
    type: String,
    trim: true,
  },
  numberRounds: {
    type: Number,
  },
  players: {
    type: [playerSchema],
    default: [],
  },
  beginningDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  sectionType: {
    type: Number,
    enum: [0, 1, 2, 3],
  },
  grandPrixStatus: {
    type: String,
    trim: true,
  },
  grandPrixPoints: {
    type: Number,
  },
});

const Section =
  mongoose.models.Section || mongoose.model("Section", sectionSchema);
export default Section;
