import mongoose, { Schema } from 'mongoose';
import { IndustryDocument } from '../interface';


const IndustrySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
});

IndustrySchema.index({ name: 'text' });

export default mongoose.model<IndustryDocument>('Industry', IndustrySchema);

