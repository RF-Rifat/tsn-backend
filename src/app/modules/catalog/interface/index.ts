import mongoose, { Document } from "mongoose";


import { Model } from "mongoose";

// Define the base type for all models
export type BaseModel = Model<any>;

// Skill -> SubCategory -> Category -> SubIndustry -> Industry

// Top-level: Industry
export type IndustryDocument = Document & {
  name: string; 
};

// Sub-level: SubIndustry
export type SubIndustryDocument = Document & {
  name: string; 
  industryId: mongoose.Types.ObjectId; 
};

// Sub-level: Category
export type CategoryDocument = Document & {
  name: string; 
  subIndustryId: mongoose.Types.ObjectId; 
};

// Sub-level: SubCategory
export type SubCategoryDocument = Document & {
  name: string; 
  categoryId: mongoose.Types.ObjectId;
};

// Lowest-level: Skill
export type SkillDocument = Document & {
  name: string; 
  subCategoryId: mongoose.Types.ObjectId;
};


// Catelog
 export type TCatalog = {
  industry: string;
  subIndustries: string[];
  categories: string[];
  subCategories: string[];
  skills: string[];
}