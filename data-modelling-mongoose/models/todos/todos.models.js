import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({}, { timestamps: true });

export const Todo = mongoose.model("Todo", TodoSchema);
