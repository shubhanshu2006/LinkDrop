import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  adminListFiles,
  disableFile,
  enableFile,
  deleteFilePermanently,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyJWT, requireAdmin);

router.get("/files", adminListFiles);
router.patch("/files/:fileId/disable", disableFile);
router.patch("/files/:fileId/enable", enableFile);
router.delete("/files/:fileId", deleteFilePermanently);

export default router;
