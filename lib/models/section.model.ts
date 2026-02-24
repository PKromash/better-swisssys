import mongoose from "mongoose";

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
  type: {
    type: String,
    trim: true,
  },
  numberRounds: {
    type: Number,
  },
  players: {
    type: Number,
  },
  beginningDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  sectionType: {
    type: String,
    trim: true,
  },
  grandPrixStatus: {
    type: String,
    trim: true,
  },
  grandPrixPoints: {
    type: Number,
  },
});

export default mongoose.model("Section", sectionSchema);
