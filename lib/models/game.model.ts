import mongoose from "mongoose";
import playerSchema from "./player.model";

const gameSchema = new mongoose.Schema({
  whitePlayer: {
    type: playerSchema,
    required: true,
  },
  blackPlayer: {
    type: playerSchema,
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
