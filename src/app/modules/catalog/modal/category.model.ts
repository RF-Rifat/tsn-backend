import mongoose, { Schema } from 'mongoose';
import { CategoryDocument } from '../interface';

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  subIndustryId: {
    type: Schema.Types.ObjectId,
    ref: 'SubIndustry',
    required: true,
  },
});

CategorySchema.index({ name: 'text' });

export default mongoose.model<CategoryDocument>('Category', CategorySchema);
