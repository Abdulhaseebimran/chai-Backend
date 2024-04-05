import mongoose from "mongoose";

const cateqoriesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    
}, { timestamps: true });

export const Categories = mongoose.model("Categories", cateqoriesSchema);