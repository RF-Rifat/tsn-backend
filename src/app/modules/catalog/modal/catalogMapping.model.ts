import mongoose from 'mongoose';

const catalogMappingSchema = new mongoose.Schema(
  {
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true },
    subIndustryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubIndustry', required: false },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: false },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: false },
  },
  { timestamps: true }
);

export default mongoose.model('CatalogMapping', catalogMappingSchema);
