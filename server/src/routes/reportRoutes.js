import express from "express";
import { auth } from "../middleware/auth.js";
import {
  overviewReport,
  spendByCategory,
  spendByUser,
  monthlyReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Reports
router.get("/overview", auth, overviewReport);
router.get("/spend-by-category", auth, spendByCategory);
router.get("/spend-by-user", auth, spendByUser);
router.get("/monthly", auth, monthlyReport);

export default router;
