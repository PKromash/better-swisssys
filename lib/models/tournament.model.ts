import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  metadata: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    affiliateID: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    chiefTD: {
      type: String,
      required: true,
      trim: true,
    },
    assistantChiefTD: {
      type: String,
      trim: true,
    },
  },
  tournamentDirectors: [
    {
      USCF_id: {
        type: String,
        required: true,
        trim: true,
      },
    },
  ],
  sections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Tournament =
  mongoose.models.Tournament || mongoose.model("Tournament", tournamentSchema);

export default Tournament;
