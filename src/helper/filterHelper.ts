import { Model, SortOrder } from 'mongoose';
import { IPaginationOptions } from '../interfaces/pagination';
import { IGenericResponse } from '../shared/sendResponse';
import { paginationHelpers } from './paginationHelper';

// Build search and filter conditions
export const buildConditions = (
  searchTerm: string | undefined,
  filtersData: Record<string, any>,
  searchableFields: string[],
): Record<string, any> => {
  const andConditions: Record<string, any>[] = [];

  // Add search conditions
  if (searchTerm) {
    andConditions.push({
      $or: searchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Add filter conditions
  if (Object.keys(filtersData).length > 0) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  return andConditions.length > 0 ? { $and: andConditions } : {};
};
// Build sorting conditions
export const buildSortConditions = (
  sortBy?: string,
  sortOrder?: SortOrder,
): Record<string, SortOrder> => {
  return sortBy && sortOrder ? { [sortBy]: sortOrder } : {};
};

// Generic response function
const getGenericResponse = async <T>(
  model: Model<any>,
  paginationOptions: IPaginationOptions,
  filters: Record<string, any>,
  searchableFields: string[],
  // populateField?: string,
): Promise<IGenericResponse<T[]> | null> => {
  const { searchTerm, ...filtersData } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const whereConditions = buildConditions(
    searchTerm,
    filtersData,
    searchableFields,
  );
  const sortConditions = buildSortConditions(sortBy, sortOrder);

  const result = await model
    .find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit)
    // .populate()
    .lean<T[]>();

  const total = await model.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const FilterPaginationHelper = {
  getGenericResponse,
  buildConditions,
  buildSortConditions,
};

export default FilterPaginationHelper;
