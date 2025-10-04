import express from "express";
import { companyController } from "../controllers/companyController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/companies - Get all companies
router.get("/", companyController.getAllCompanies);

// GET /api/companies/:id - Get company by ID
router.get("/:id", companyController.getCompanyById);

// POST /api/companies - Create new company
router.post("/", companyController.createCompany);

// PUT /api/companies/:id - Update company
router.put("/:id", companyController.updateCompany);

// DELETE /api/companies/:id - Delete company
router.delete("/:id", companyController.deleteCompany);

export default router;
