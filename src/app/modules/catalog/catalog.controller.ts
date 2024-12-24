import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { TCatalog } from './interface';
import catchAsync from '../../../shared/catchAsync';
import { catalogService } from './catalog.service';
import sendResponse from '../../../shared/sendResponse';
import { getQueryType } from './utils';

// Controller to create a new catalog
const createCatalog = catchAsync(async (req: Request, res: Response) => {
  const data: TCatalog = req.body;
  const result = await catalogService.createCatalog(data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Catalog created successfully!',
    data: result,
  });
});

// Controller to get all catalog data by industryId
const getAllCatalogs = catchAsync(async (req: Request, res: Response) => {
  const { industryId } = req.params;

  const result = await catalogService.getAllCatalogs(industryId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Catalog data retrieved successfully!',
    data: result,
  });
});

// Controller to get all catalog data by industryId
const getCatalogByDynamicQuery = catchAsync(
  async (req: Request, res: Response) => {
   
    const queryType = getQueryType(req.query);
    const result = await catalogService.getCatalogByDynamicQuery(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${queryType} data retrieved successfully!`,
      meta: result.meta,
      data: result.data,
    });
  },
);

// update the catalog (industry, subIndustry, category, subCategory, skills)
const updateCatalog = catchAsync(async (req: Request, res: Response) => {
  const data: TCatalog = req.body;
  const result = await catalogService.updateCatalogItem(data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Catalog updated successfully!',
    data: result,
  });
});

export const CatalogController = {
  createCatalog,
  getCatalogByDynamicQuery,
  getAllCatalogs,
  updateCatalog
};
