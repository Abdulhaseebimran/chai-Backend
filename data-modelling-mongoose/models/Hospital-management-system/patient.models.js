import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    diagonsedWith: {
      // what the patient is diagonsed with
      type: String,
      required: true,
    },
    admittedAt: {
      // when the patient was admitted
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    dischargedAt: {
      // if dischargedAt is null, then the patient is still admitted
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other", "null"],
      default: "null",
    },
    contact: {
      type: String,
      required: true,
    },
    bloodGroup: {
      // if bloodGroup is null, then the blood group is not known
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "null"],
      default: "null",
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
