/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import httpStatus from 'http-status';
import multer from 'multer';
import path from 'path';
import ApiError from '../errors/ApiError';
import { IClodinaryResponse, IUploadFile } from '../inerfaces/file';

// Configuration
cloudinary.config({
  cloud_name: 'da7ujmmwz',
  api_key: '652413498683358',
  api_secret: '15PrxUUbK2f6OSQXJ88vn1cUZDg',
});

// Use a temporary directory in production environments like Aws ,clowdinary, Lambda
const uploadDir = path.join('/tmp', 'uploads');

// Ensure the uploads directory exists; if not, create it
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure the directory exists before storing the file
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Use the correct directory path
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Save the file with its original name
  },
});

const upload = multer({ storage: storage });

const uploadSingleToCloudinary = async (
  file: IUploadFile,
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      (error: Error, result: IClodinaryResponse) => {
        fs.unlinkSync(file.path);
        if (error) {
          reject(error);
        } else {
          resolve(result?.url);
        }
      },
    );
  });
};

const uploadMultipleToCloudinary = async (
  files: IUploadFile[],
): Promise<string[] | any> => {
  const uploadPromises = files.map(
    file =>
      new Promise<IClodinaryResponse>((resolve, reject) => {
        cloudinary.uploader.upload(
          file.path,
          (error: Error, result: IClodinaryResponse) => {
            fs.unlinkSync(file.path);
            if (error) {
              reject(error);
            } else if (result && result.url) {
              resolve(result.url as never);
            }
          },
        );
      }),
  );

  const results = await Promise.all(uploadPromises);
  return results as unknown as string[];
};

// delete image from clodinary
const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const parts = url.split('/');
    const publicIdWithExtension = parts[parts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

const deleteImageByUrl = async (url: string) => {
  const publicId = extractPublicIdFromUrl(url);

  if (!publicId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Failed to extract public ID from URL',
    );
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

const deleteMultipleImagesByUrl = async (urls: string[]) => {
  const deletePromises = urls.map(url => deleteImageByUrl(url));
  await Promise.all(deletePromises);
};

export const FileUploadHelper = {
  deleteImageByUrl,
  deleteMultipleImagesByUrl,
  uploadSingleToCloudinary,
  uploadMultipleToCloudinary,
  upload,
};
