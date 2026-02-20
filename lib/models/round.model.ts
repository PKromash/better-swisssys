import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
    required: true,
  },
  games: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
  ],
});

export default mongoose.model("Round", roundSchema);
