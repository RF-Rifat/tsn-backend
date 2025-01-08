import mongoose from "mongoose";

// Utility function to find or create a document
export const findOrCreateDocument = async (
    model: mongoose.Model<any>,
    filter: object,
    createData: object,
    session: mongoose.ClientSession,
  ) => {
    const existingDoc = await model.findOne(filter).session(session);
    if (existingDoc) return existingDoc;
    return (await model.create([createData], { session }))[0];
  };
  


  export const getQueryType = (query: Record<string, unknown>): string => {
    if (query.industry) return 'Industry';
    if (query.subIndustry) return 'Sub-Industry';
    if (query.category) return 'Category';
    if (query.subCategory) return 'Sub-Category';
    return 'Industry';
  };
  