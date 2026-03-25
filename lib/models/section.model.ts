import mongoose from "mongoose";
import playerSchema from "./player.model";

const pairingSchema = new mongoose.Schema({
  white: {type: Number, default: null},
  black: {type: Number, default: null},
  result: {
    type: String,
    enum: ["1-0", "0-1", "1/2-1/2", "1F-0F", "0F-1F", "0F-0F", "-"],
    default: "-",
  },
});

const roundSchema = new mongoose.Schema({
  roundNumber: {type: Number, required: true},
  pairings: {type: [pairingSchema], default: []},
});

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
  rounds: {type: [roundSchema], default: []},
  // round through which pairings have been generated (0 if pairings have not yet been generated for the first round)
  currentRound: {
    type: Number,
    default: 0,
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
