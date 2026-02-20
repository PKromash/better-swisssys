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
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  pairingNumber: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("Player", playerSchema);
