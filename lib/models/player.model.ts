import mongoose from "mongoose";

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  USCF_id: {
    type: String,
    // required: true,
    trim: true,
  },
  rating: {
    // Number or unr
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  pairingNumber: {
    type: Number,
  },
  // A list of the pairing numbers of the opponents this player has faced in previous rounds in the order they played them
  opponents: [Number],
  results: [String], // W, L, D, B 
  colors: [String], // W, B, or X for did not play
  byes: [
    {
      round: {
        type: Number,
        required: true,
      },
      points: {
        type: Number,
        required: true,
      },
    },
  ],
  withdrawn: {
    type: Boolean,
    default: false,
  },
});

export default playerSchema;
