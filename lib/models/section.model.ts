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
  rounds: [
    {
      roundNumber: Number,
      pairings: [
        {
          whitePlayer: {
            type: Number, // pairing number of the white player
            required: true,
          },
          blackPlayer: {
            type: Number, // pairing number of the black player
            required: true,
          },
          result: {
            type: String,
            enum: ["1-0", "0-1", "1/2-1/2", "1F-0F", "0F-1F", "0F-0F", "-"],
            required: true,
            default: "-", // "-" indicates a game that has not been played yet
          },
        },
      ],
    },
  ],
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
