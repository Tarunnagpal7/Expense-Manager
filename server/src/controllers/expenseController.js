import express from 'express';
import prisma from '../lib/prisma.js';
import { auth } from '../middleware/auth.js';
import { roleCheck } from '../middleware/roleCheck.js';

const router = express.Router();

/**
 * GET /api/expenses
 * Get all expenses
 */
router.get('/', auth, async (req, res) => {
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
});

/**
 * GET /api/expenses/:id
 * Get single expense by ID
 */
router.get('/:id', auth, async (req, res) => {
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
});

/**
 * POST /api/expenses
 * Create new expense
 */
router.post('/', auth, async (req, res) => {
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
});

/**
 * PATCH /api/expenses/:id
 * Update an existing expense
 */
router.patch('/:id', auth, async (req, res) => {
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
});

/**
 * PATCH /api/expenses/:id/submit
 * Submit an expense for approval
 */
router.patch('/:id/submit', auth, async (req, res) => {
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
});

/**
 * DELETE /api/expenses/:id
 * Delete an expense
 */
router.delete('/:id', auth, async (req, res) => {
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
});

/**
 * GET /api/expenses/user/:userId
 * Get all expenses created by a specific user
 */
router.get('/user/:userId', auth, async (req, res) => {
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
});

module.exports = router;
