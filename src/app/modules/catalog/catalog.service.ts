import mongoose from 'mongoose';
import subIndustryModel from './modal/subIndustry.model';
import categoryModel from './modal/category.model';
import subCategoryModel from './modal/subCategory.model';
import skillsModel from './modal/skills.model';
import industryModel from './modal/industry.model';
import { BaseModel, TCatalog } from './interface';
import ApiError from '../../../errors/ApiError';
import { findOrCreateDocument } from './utils';
import QueryBuilder from '../../builder/QueryBuilder';

const createCatalog = async (data: TCatalog): Promise<any> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { industry, subIndustries, categories, subCategories, skills } = data;

    // Step 1: Find or create industry document
    const industryDoc = await findOrCreateDocument(
      industryModel,
      { name: industry },
      { name: industry },
      session,
    );

    // Step 2: Find or create sub-industries
    const subIndustryDocs = await Promise.all(
      subIndustries.map(async (name: string) => {
        const subIndustryDoc = await findOrCreateDocument(
          subIndustryModel,
          { name, industryId: industryDoc._id },
          { name, industryId: industryDoc._id },
          session,
        );
        return subIndustryDoc;
      }),
    );

    // Step 3: Find or create categories
    const categoryDocs = await Promise.all(
      categories.map(async (name: string, index: number) => {
        const categoryDoc = await findOrCreateDocument(
          categoryModel,
          { name },
          {
            name,
            industryId: industryDoc._id,
            subIndustryId: subIndustryDocs[index % subIndustryDocs.length]._id,
          },
          session,
        );

        return categoryDoc;
      }),
    );

    // Step 4: Find or create sub-categories
    const subCategoryDocs = await Promise.all(
      subCategories.map(async (name: string, index: number) => {
        const subCategoryDoc = await findOrCreateDocument(
          subCategoryModel,
          { name },
          {
            name,
            categoryId: categoryDocs[index % categoryDocs.length]._id, // Link to category
            subIndustryId: subIndustryDocs[index % subIndustryDocs.length]._id, // Link to sub-industry
            industryId: industryDoc._id,
          },
          session,
        );
        return subCategoryDoc;
      }),
    );

    // Step 5: Find or create skills
    const skillDocs = await Promise.all(
      skills.map(async (name: string, index: number) => {
        const skillDoc = await findOrCreateDocument(
          skillsModel,
          { name },
          {
            name,
            subCategoryId: subCategoryDocs[index % subCategoryDocs.length]._id, // Link to sub-category
            categoryId: categoryDocs[index % categoryDocs.length]._id,
            subIndustryId: subIndustryDocs[index % subIndustryDocs.length]._id,
            industryId: industryDoc._id,
          },
          session,
        );

        return skillDoc;
      }),
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return {
      industry: industryDoc,
      subIndustries: subIndustryDocs,
      categories: categoryDocs,
      subCategories: subCategoryDocs,
      skills: skillDocs,
    };
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating/updating catalog:', error);
    throw new ApiError(500, 'Failed to create/update catalog');
  }
};

const getAllCatalogs = async (industryId: string) => {
  try {
    const data = await industryModel.aggregate([
      // Stage-1: Match the given industry ID
      { $match: { _id: new mongoose.Types.ObjectId(industryId) } },

      // Stage-2: Lookup sub-industries
      {
        $lookup: {
          from: 'subindustries',
          localField: '_id',
          foreignField: 'industryId',
          as: 'subIndustries',
        },
      },

      // Stage-3: Lookup categories for each sub-industry
      {
        $lookup: {
          from: 'categories',
          localField: 'subIndustries._id',
          foreignField: 'subIndustryId',
          as: 'categories',
        },
      },

      // Stage-4: Lookup sub-categories for each category
      {
        $lookup: {
          from: 'subcategories',
          localField: 'categories._id',
          foreignField: 'categoryId',
          as: 'subCategories',
        },
      },

      // Stage-5: Lookup sub-categories for each category
      {
        $lookup: {
          from: 'skills',
          localField: 'subCategories._id',
          foreignField: 'subCategoryId',
          as: 'skills',
        },
      },

      // Project fields to flatten and exclude __v (Looping throw each array)
      {
        $project: {
          _id: 1,
          industry: '$name',
          subIndustries: {
            $map: {
              input: '$subIndustries',
              as: 'subIndustry',
              in: {
                _id: '$$subIndustry._id',
                name: '$$subIndustry.name',
                industryId: '$$subIndustry.industryId',
              },
            },
          },
          categories: {
            $map: {
              input: '$categories',
              as: 'category',
              in: {
                _id: '$$category._id',
                name: '$$category.name',
                subIndustryId: '$$category.subIndustryId',
              },
            },
          },
          subCategories: {
            $map: {
              input: '$subCategories',
              as: 'subCategory',
              in: {
                _id: '$$subCategory._id',
                name: '$$subCategory.name',
                categoryId: '$$subCategory.categoryId',
              },
            },
          },
          skills: {
            $map: {
              input: '$skills',
              as: 'skill',
              in: {
                _id: '$$skill._id',
                name: '$$skill.name',
                subCategoryId: '$$skill.subCategoryId',
              },
            },
          },
        },
      },
    ]);

    return data[0]; // Return the first (and only) document
  } catch (error) {
    console.error('Error fetching catalog data:', error);
    throw new ApiError(500, 'Failed to fetch catalog data');
  }
};

const getCatalogByDynamicQuery = async (query: Record<string, unknown>) => {
  let model: BaseModel;

  // Dynamically assign the model based on the query keys
  // why do we delete query? because we don't want to send it to the database
  // just we are dynamically selecting the model 
  if (query.industry) {
    model = industryModel;
    delete query.industry;
  } else if (query.subIndustry) {
    model = subIndustryModel;
    delete query.subIndustry;
  } else if (query.category) {
    model = categoryModel;
    delete query.category;
  } else if (query.subCategory) {
    model = subCategoryModel;
    delete query.subCategory;
  } else {
    model = industryModel;
  }

  
  // Build the query dynamically
  const dynamicQuery = new QueryBuilder(model.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await dynamicQuery.modelQuery;
  const meta = await dynamicQuery.countTotal();

  return {
    data: result,
    meta,
  };
};

const updateCatalogItem = async (data: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { industry, subIndustries, categories, subCategories, skills } = data;

    let updatedIndustry = null;

    // Step 1: Update Industry
    if (industry) {
      updatedIndustry = await industryModel.findOneAndUpdate(
        { _id: industry._id },
        { $set: industry },
        { new: true, upsert: true, session },
      );
    }

    let updatedSubIndustries = [];
    // Step 2: Update Sub-Industries
    if (subIndustries) {
      updatedSubIndustries = await Promise.all(
        subIndustries.map(async (subIndustry: any) => {
          const updatedSubIndustry = await subIndustryModel.findOneAndUpdate(
            { _id: subIndustry._id },
            { $set: subIndustry },
            { new: true, upsert: true, session },
          );
          return updatedSubIndustry;
        }),
      );
    }

    let updatedCategories = [];
    // Step 3: Update Categories
    if (categories) {
      updatedCategories = await Promise.all(
        categories.map(async (category: any) => {
          const updatedCategory = await categoryModel.findOneAndUpdate(
            { _id: category._id },
            { $set: category },
            { new: true, upsert: true, session },
          );
          return updatedCategory;
        }),
      );
    }

    let updatedSubCategories = [];

    // Step 4: Update Sub-Categories
    if (subCategories) {
      updatedSubCategories = await Promise.all(
        subCategories.map(async (subCategory: any) => {
          const updatedSubCategory = await subCategoryModel.findOneAndUpdate(
            { _id: subCategory._id },
            { $set: subCategory },
            { new: true, upsert: true, session },
          );
          return updatedSubCategory;
        }),
      );
    }

    let updatedSkills = [];
    // Step 5: Update Skills
    if (skills) {
      updatedSkills = await Promise.all(
        skills.map(async (skill: any) => {
          const updatedSkill = await skillsModel.findOneAndUpdate(
            // Using _id for update
            { _id: skill._id },
            { $set: skill },
            { new: true, upsert: true, session },
          );
          return updatedSkill;
        }),
      );
    }

    // Commit the transaction if all updates are successful
    await session.commitTransaction();
    session.endSession();

    return {
      industry: updatedIndustry,
      subIndustries: updatedSubIndustries,
      categories: updatedCategories,
      subCategories: updatedSubCategories,
      skills: updatedSkills,
    };
  } catch (error) {
    // Abort the transaction in case of an error
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating catalog:', error);
    throw new ApiError(500, 'Failed to update catalog');
  }
};

export const catalogService = {
  createCatalog,
  getAllCatalogs,
  getCatalogByDynamicQuery,
  updateCatalogItem,
};
