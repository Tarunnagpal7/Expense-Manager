import prisma from "../lib/prisma.js";
import axios from "axios";

// Helper: get exchange rate from baseCurrency -> targetCurrency
const getExchangeRate = async (baseCurrency, targetCurrency) => {
  if (baseCurrency === targetCurrency) return 1;
  try {
    const res = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    return res.data.rates[targetCurrency] || null;
  } catch (err) {
    console.error("Error fetching exchange rate:", err.message);
    return null;
  }
};

// Convert amount to requested currency
const convertAmount = async (amount, fromCurrency, toCurrency) => {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  if (!rate) throw new Error("Failed to get exchange rate");
  return amount * rate;
};

/**
 * GET /api/reports/overview?currency=USD
 */
const overviewReport = async (req, res) => {
  try {
    const targetCurrency =
      req.query.currency || req.user.company.currency || "INR";

    const totalExpensesObj = await prisma.expense.aggregate({
      _sum: { amountCompany: true },
      where: { companyId: req.user.companyId },
    });
    const totalExpenses = totalExpensesObj._sum.amountCompany || 0;

    const totalPaidCount = await prisma.expense.count({
      where: { status: "PAID", companyId: req.user.companyId },
    });

    const totalPendingCount = await prisma.expense.count({
      where: {
        status: "APPROVED",
        isReimbursed: false,
        companyId: req.user.companyId,
      },
    });

    // Convert total expenses to requested currency
    const convertedTotal = await convertAmount(
      totalExpenses,
      req.user.company.currency,
      targetCurrency
    );

    res.json({
      totalExpenses: convertedTotal,
      currency: targetCurrency,
      totalPaid: totalPaidCount,
      totalPending: totalPendingCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate overview report" });
  }
};

/**
 * GET /api/reports/spend-by-category?currency=USD
 */
const spendByCategory = async (req, res) => {
  try {
    const targetCurrency =
      req.query.currency || req.user.company.currency || "INR";
    const result = await prisma.expense.groupBy({
      by: ["category"],
      _sum: { amountCompany: true },
      where: { companyId: req.user.companyId },
    });

    const converted = await Promise.all(
      result.map(async (r) => ({
        category: r.category,
        totalAmount: await convertAmount(
          r._sum.amountCompany || 0,
          req.user.company.currency,
          targetCurrency
        ),
      }))
    );

    res.json({ currency: targetCurrency, data: converted });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to generate spend by category report" });
  }
};

/**
 * GET /api/reports/spend-by-user?currency=USD
 */
const spendByUser = async (req, res) => {
  try {
    const targetCurrency =
      req.query.currency || req.user.company.currency || "INR";

    const result = await prisma.expense.groupBy({
      by: ["createdById"],
      _sum: { amountCompany: true },
      where: { companyId: req.user.companyId },
    });

    const withUserDetails = await Promise.all(
      result.map(async (r) => {
        const user = await prisma.user.findUnique({
          where: { id: r.createdById },
        });
        const convertedAmount = await convertAmount(
          r._sum.amountCompany || 0,
          req.user.company.currency,
          targetCurrency
        );
        return {
          user: { id: user.id, name: user.name, email: user.email },
          totalAmount: convertedAmount,
        };
      })
    );

    res.json({ currency: targetCurrency, data: withUserDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate spend by user report" });
  }
};

/**
 * GET /api/reports/monthly?currency=USD
 */
const monthlyReport = async (req, res) => {
  try {
    const targetCurrency =
      req.query.currency || req.user.company.currency || "INR";

    const expenses = await prisma.expense.findMany({
      where: { companyId: req.user.companyId },
      select: { amountCompany: true, dateOfExpense: true },
    });

    const monthly = {};
    for (const e of expenses) {
      const month = new Date(e.dateOfExpense).toISOString().slice(0, 7);
      const convertedAmount = await convertAmount(
        e.amountCompany || 0,
        req.user.company.currency,
        targetCurrency
      );
      if (!monthly[month]) monthly[month] = 0;
      monthly[month] += convertedAmount;
    }
    
    res.json({ currency: targetCurrency, data: monthly });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate monthly report" });
  }
};

export { overviewReport, monthlyReport, spendByCategory, spendByUser };
