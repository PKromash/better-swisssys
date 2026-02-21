import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  metadata: {
    name: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    affiliateID: {
      type: String,
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
