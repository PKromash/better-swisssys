import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  timeControl: {
    type: String,
    required: true,
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
    required: true,
    trim: true,
  },
  numberRounds: {
    type: Number,
    required: true,
  },
  players: {
    type: Number,
    required: true,
  },
  beginningDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
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
