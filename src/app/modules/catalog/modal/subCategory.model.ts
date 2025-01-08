
import mongoose, { Schema, } from "mongoose";
import { SubCategoryDocument } from "../interface";

const SubCategorySchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});



SubCategorySchema.index({ name: "text" });

export default mongoose.model<SubCategoryDocument>("SubCategory", SubCategorySchema);
