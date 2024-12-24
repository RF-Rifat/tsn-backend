import express from 'express';
import validateRequest from '../../middlewares/ValidateRequest';
import { CatalogController } from './catalog.controller';
import { catalogValidations } from './catalog.validation';

const router = express.Router();

// Route to create a new catalog
router.post(
  '/create',
  validateRequest(catalogValidations.catelogValidationSchema),
  CatalogController.createCatalog,
);
// get all categories down to the the industry
router.get('/:industryId', CatalogController.getAllCatalogs);
// get all data based on dynamic query
router.get('/dynamic/query', CatalogController.getCatalogByDynamicQuery);

router.put('/', CatalogController.updateCatalog);

export const catalogRoutes = router;
