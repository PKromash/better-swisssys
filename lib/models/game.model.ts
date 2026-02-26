import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  whitePlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  blackPlayer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Player",
    required: true,
  },
  result: {
    type: String,
    enum: ["1-0", "0-1", "1/2-1/2", "1F-0F", "0F-1F", "0F-0F", "-"],
    required: true,
    default: "-", // "-" indicates a game that has not been played yet
  },
  round: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Round",
    required: true,
  },
});

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
export default Game;
