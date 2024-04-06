import mongoose from "mongoose";
import { Doctor } from "./doctor.models";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    contct: {
      type: String,
      required: true,
    },
    totalBeds: {
      type: Number,
      required: true,
    },
    availableBeds: {
      type: Number,
      required: true,
    },
    emergencyContact: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    totalEmployees: {
      type: Number,
      required: true,
    },
    hospitalType: {
      type: String,
      required: true,
    },
    totalDoctors: {
      type: Doctor.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  { timestamps: true }
);

export const Hospital = mongoose.model("Hospital", hospitalSchema);
