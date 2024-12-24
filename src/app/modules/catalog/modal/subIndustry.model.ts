import mongoose, { Schema} from 'mongoose';
import { SubIndustryDocument } from '../interface';



const SubIndustrySchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  industryId: { type: Schema.Types.ObjectId, ref: 'Industry', required: true },
});

SubIndustrySchema.index({ name: 'text' });

export default mongoose.model<SubIndustryDocument>(
  'SubIndustry',
  SubIndustrySchema,
);
