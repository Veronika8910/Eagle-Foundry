import { Router } from 'express';
import * as filesController from './files.controller.js';
import { validateBody, validateParams, uuidParamSchema } from '../../middlewares/validate.js';
import { authMiddleware, requireActiveUser } from '../../middlewares/auth.js';
import { presignUploadSchema, confirmUploadSchema } from './files.validators.js';

const router = Router();

router.use(authMiddleware);
router.use(requireActiveUser);

router.post(
    '/presign',
    validateBody(presignUploadSchema),
    filesController.presignUpload
);

router.post(
    '/confirm',
    validateBody(confirmUploadSchema),
    filesController.confirmUpload
);

router.get(
    '/:id/download',
    validateParams(uuidParamSchema),
    filesController.getDownloadUrl
);

router.delete(
    '/:id',
    validateParams(uuidParamSchema),
    filesController.deleteFile
);

export default router;
