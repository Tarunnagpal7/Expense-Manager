import prisma from '../lib/prisma.js';
import { roleCheck } from '../middleware/roleCheck.js';
/**
 * Get all expenses for the company
 */
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { companyId: req.user.companyId },
      include: { receipts: true, approvalInstances: true },
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
};

/**
 * Get single expense by ID
 */
const getExpenseById = async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: { receipts: true, approvalInstances: true },
    });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
};

/**
 * Create new expense
 */
const createExpense = async (req, res) => {
  try {
    const { title, description, category, dateOfExpense, amountOriginal, currencyOriginal } = req.body;
    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        category,
        dateOfExpense: dateOfExpense ? new Date(dateOfExpense) : null,
        amountOriginal,
        currencyOriginal,
        companyId: req.user.companyId,
        createdById: req.user.id,
        status: 'DRAFT',
      },
    });
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
};

/**
 * Update an existing expense
 */
const updateExpense = async (req, res) => {
  try {
    const { title, description, category, dateOfExpense, amountOriginal, currencyOriginal } = req.body;
    const expense = await prisma.expense.updateMany({
      where: { id: req.params.id, companyId: req.user.companyId, createdById: req.user.id },
      data: {
        title,
        description,
        category,
        dateOfExpense: dateOfExpense ? new Date(dateOfExpense) : undefined,
        amountOriginal,
        currencyOriginal,
      },
    });
    if (expense.count === 0) return res.status(404).json({ error: 'Expense not found or not editable' });
    res.json({ message: 'Expense updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
};

/**
 * Submit an expense
 */
const submitExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.updateMany({
      where: { id: req.params.id, companyId: req.user.companyId, createdById: req.user.id, status: 'DRAFT' },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
    if (expense.count === 0) return res.status(404).json({ error: 'Expense not found or cannot be submitted' });
    res.json({ message: 'Expense submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit expense' });
  }
};

/**
 * Delete an expense
 */
const deleteExpense = async (req, res) => {
  try {
    const expense = await prisma.expense.deleteMany({
      where: { id: req.params.id, companyId: req.user.companyId, createdById: req.user.id, status: 'DRAFT' },
    });
    if (expense.count === 0) return res.status(404).json({ error: 'Expense not found or cannot be deleted' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
};

/**
 * Get all expenses created by a specific user
 */
const getUserExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { createdById: req.params.userId, companyId: req.user.companyId },
      include: { receipts: true, approvalInstances: true },
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user expenses' });
  }
};

export {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  submitExpense,
  deleteExpense,
  getUserExpenses
}