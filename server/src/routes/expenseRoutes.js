import express from "express";
import { Router } from "express";
import { auth } from "../middleware/auth.js";
// import { roleCheck } from '../middleware/roleCheck.js';
import * as expensesController from "../controllers/expenseController.js";

const router = Router();

// Routes
router.get("/", auth, expensesController.getAllExpenses);
router.get("/:id", auth, expensesController.getExpenseById);
router.post("/", auth, expensesController.createExpense);
router.patch("/:id", auth, expensesController.updateExpense);
router.patch("/:id/submit", auth, expensesController.submitExpense);
router.delete("/:id", auth, expensesController.deleteExpense);
router.get("/user/:userId", auth, expensesController.getUserExpenses);

export default router;
