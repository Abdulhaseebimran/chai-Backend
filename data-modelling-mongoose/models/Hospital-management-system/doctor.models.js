import mongoose from "mongoose";

const doctorHospitalInHoursSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    workInHospitals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        required: true,
      },
    ],
    qualification: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    experienceInYears: {
      type: Number,
      default: 0,
      required: true,
    },
    timingsOfDoctor: {
      type: [doctorHospitalInHoursSchema],
      required: true,
    },
  },
  { timestamps: true }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
