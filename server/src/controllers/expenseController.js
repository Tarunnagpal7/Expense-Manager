import prisma from "../lib/prisma.js";
// import { roleCheck } from "../middleware/roleCheck.js";
import axios from "axios";

// Helper: fetch exchange rate
const getExchangeRate = async (fromCurrency, toCurrency) => {
  try {
    const res = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );
    return res.data.rates[toCurrency];
  } catch (err) {
    console.error("Error fetching exchange rate:", err.message);
    return null;
  }
};

// Helper: validate required fields for create/update
const validateExpenseFields = (data) => {
  const errors = [];
  if (!data.title || typeof data.title !== "string")
    errors.push("Title is required and must be a string");
  if (!data.amountOriginal || typeof data.amountOriginal !== "number")
    errors.push("Amount is required and must be a number");
  if (!data.currencyOriginal || typeof data.currencyOriginal !== "string")
    errors.push("Currency is required and must be a string");
  if (!data.category || typeof data.category !== "string")
    errors.push("Category is required and must be a string");
  if (data.dateOfExpense && isNaN(new Date(data.dateOfExpense)))
    errors.push("Date of expense must be a valid date");
  return errors;
};

/**
 * Get all expenses for the company
 */
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { companyId: req.user.companyId },
      include: {
        receipts: true,
        approvalInstances: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    return res.json({ success: true, data: expenses });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch expenses" });
  }
};

/**
 * Get single expense by ID
 */
const getExpenseById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Invalid expense ID" });

    const expense = await prisma.expense.findFirst({
      where: { id, companyId: req.user.companyId },
      include: {
        receipts: true,
        approvalInstances: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!expense)
      return res
        .status(404)
        .json({ success: false, error: "Expense not found" });
    return res.json({ success: true, data: expense });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch expense" });
  }
};

/**
 * Create new expense
 */
const createExpense = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      dateOfExpense,
      amountOriginal,
      currencyOriginal,
    } = req.body;

    const errors = validateExpenseFields(req.body);
    if (errors.length > 0)
      return res.status(400).json({ success: false, errors });

    // Fetch company currency
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
    });
    const companyCurrency = company?.currency || "INR";

    // Calculate amount in company currency
    let amountCompany = amountOriginal;
    let exchangeRate = 1;
    if (currencyOriginal !== companyCurrency) {
      exchangeRate = await getExchangeRate(currencyOriginal, companyCurrency);
      if (!exchangeRate)
        return res
          .status(500)
          .json({ success: false, error: "Failed to fetch exchange rate" });
      amountCompany = amountOriginal * exchangeRate;
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        description,
        category,
        dateOfExpense: dateOfExpense ? new Date(dateOfExpense) : new Date(),
        amountOriginal,
        currencyOriginal,
        amountCompany,
        exchangeRateAtSubmit: exchangeRate,
        companyId: req.user.companyId,
        createdById: req.user.id,
        status: "SUBMITTED",
      },
    });

    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create expense" });
  }
};

/**
 * Update an existing expense
 */
const updateExpense = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Invalid expense ID" });

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: "Expense not found" });
    if (existing.createdById !== req.user.id)
      return res
        .status(403)
        .json({ success: false, error: "Not allowed to edit this expense" });

    const {
      title,
      description,
      category,
      dateOfExpense,
      amountOriginal,
      currencyOriginal,
    } = req.body;

    const errors = validateExpenseFields(req.body);
    if (errors.length > 0)
      return res.status(400).json({ success: false, errors });

    // Recalculate amount in company currency if needed
    let amountCompany = existing.amountCompany;
    let exchangeRate = existing.exchangeRateAtSubmit;
    if (
      amountOriginal &&
      currencyOriginal &&
      (amountOriginal !== existing.amountOriginal ||
        currencyOriginal !== existing.currencyOriginal)
    ) {
      const company = await prisma.company.findUnique({
        where: { id: req.user.companyId },
      });
      const companyCurrency = company?.currency || "INR";
      exchangeRate = await getExchangeRate(currencyOriginal, companyCurrency);
      if (!exchangeRate)
        return res
          .status(500)
          .json({ success: false, error: "Failed to fetch exchange rate" });
      amountCompany = amountOriginal * exchangeRate;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        title,
        description,
        category,
        dateOfExpense: dateOfExpense
          ? new Date(dateOfExpense)
          : existing.dateOfExpense,
        amountOriginal: amountOriginal ?? existing.amountOriginal,
        currencyOriginal: currencyOriginal ?? existing.currencyOriginal,
        amountCompany,
        exchangeRateAtSubmit: exchangeRate,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update expense" });
  }
};

/**
 * Submit an expense
 */
const submitExpense = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Invalid expense ID" });

    // Fetch the draft expense to validate ownership and company
    console.log("req.user is ", req.user);
    console.log("id is ", id);
    const draft = await prisma.expense.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        createdById: req.user.id,
        status: "SUBMITTED",
      },
    });

    if (!draft)
      return res.status(404).json({
        success: false,
        error: "Expense not found or cannot be submitted",
      });

    // Find company's default approval flow with ordered steps
    const defaultFlow = await prisma.approvalFlow.findFirst({
      where: { companyId: req.user.companyId, isDefault: true },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
    });

    // If no flow configured, keep backward-compatible behavior
    if (!defaultFlow || defaultFlow.steps.length === 0) {
      await prisma.expense.update({
        where: { id },
        data: { status: "SUBMITTED", submittedAt: new Date() },
      });
      return res.json({
        success: true,
        message: "Expense submitted successfully (no approval flow configured)",
      });
    }

    // Create approval instance and first step in a transaction
    await prisma.$transaction(async (tx) => {
      // Update expense to pending approval
      await tx.expense.update({
        where: { id },
        data: { status: "PENDING_APPROVAL", submittedAt: new Date() },
      });

      const firstStepOrder = defaultFlow.steps[0].stepOrder;

      // Create instance
      const instance = await tx.approvalInstance.create({
        data: {
          expenseId: id,
          flowId: defaultFlow.id,
          currentStepOrder: firstStepOrder,
        },
      });

      // Create only the first step state; subsequent steps will be created by engine when advancing
      const firstFlowStep = defaultFlow.steps[0];
      await tx.approvalInstanceStep.create({
        data: {
          instanceId: instance.id,
          stepId: firstFlowStep.id,
          stepOrder: firstFlowStep.stepOrder,
          status: "PENDING",
        },
      });
    });

    return res.json({
      success: true,
      message: "Expense submitted and entered approval workflow",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit expense" });
  }
};

/**
 * Delete an expense
 */
const deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Invalid expense ID" });

    const expense = await prisma.expense.deleteMany({
      where: {
        id,
        companyId: req.user.companyId,
        createdById: req.user.id,
        status: "DRAFT",
      },
    });

    if (expense.count === 0)
      return res.status(404).json({
        success: false,
        error: "Expense not found or cannot be deleted",
      });
    return res.json({ success: true, message: "Expense deleted successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete expense" });
  }
};

/**
 * Get all expenses created by a specific user
 */
const getUserExpenses = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId)
      return res.status(400).json({ success: false, error: "Invalid user ID" });

    const expenses = await prisma.expense.findMany({
      where: { createdById: userId, companyId: req.user.companyId },
      include: {
        receipts: true,
        approvalInstances: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    return res.json({ success: true, data: expenses });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch user expenses" });
  }
};

export {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  submitExpense,
  deleteExpense,
  getUserExpenses,
};
