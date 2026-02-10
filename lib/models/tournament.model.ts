import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  id: {type: String, required: true},
});

const Tournament =
  mongoose.models.Tournament || mongoose.model("Tournament", tournamentSchema);

export default Tournament;
