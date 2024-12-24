
import mongoose, { Schema } from "mongoose";
import { SkillDocument } from "../interface";


const SkillSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  subCategoryId: { type: Schema.Types.ObjectId, ref: "SubCategory", required: true },
});



SkillSchema.index({ name: "text" });


export default mongoose.model<SkillDocument>("Skill", SkillSchema);
