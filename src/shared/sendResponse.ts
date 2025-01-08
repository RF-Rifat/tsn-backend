/**
 * Title: 'Send api Response '
 * Description: ''
 * Author: 'Masum Rana'
 * Date: 27-12-2023
 *
 */

import { Response } from 'express';

export type IGenericResponse<T> = {
  meta?: {
    page: number;
    limit: number;
    total?: number;
  };
  data: T | null | undefined;
};

export type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string | null;
  meta?: {
    page: number;
    limit: number;
    total?: number;
  };
  data: T | null | undefined;
};

const sendResponse = <T>(res: Response, data: IApiResponse<T>): void => {
  const responseData: IApiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null || undefined,
    data: data.data || null || undefined,
  };
  res.status(data.statusCode).json(responseData);
};

export default sendResponse;
