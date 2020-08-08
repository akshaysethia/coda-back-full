const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  lang: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
  },
});

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      unique: true,
    },
    email: {
      type: String,
      default: "",
      unique: true,
    },
    password: {
      type: String,
      default: "",
    },
    votes: {
      type: Number,
      default: 0,
    },
    challenges: {
      type: Number,
      default: 0,
      min: 0,
    },
    expertiselvl: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    expertin: [expertSchema],
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model("Candidate", candidateSchema);

module.exports = Candidate;
