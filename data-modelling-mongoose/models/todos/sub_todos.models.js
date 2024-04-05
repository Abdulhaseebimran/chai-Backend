import mongoose from "mongoose";

const subTodosSchema = new mongoose.Schema({}, { timestamps: true });

export const subTodo = mongoose.model("subTodo", subTodosSchema);
