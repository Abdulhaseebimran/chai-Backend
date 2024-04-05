import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      requied: true,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subTodos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subTodo",
      },
    ], // Array of subTodos
  },
  { timestamps: true }
);

export const Todo = mongoose.model("Todo", TodoSchema);
