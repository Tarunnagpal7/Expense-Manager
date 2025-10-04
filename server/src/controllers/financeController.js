import prisma from '../lib/prisma.js';
import axios from 'axios';

// Helper: get exchange rate
const getExchangeRate = async (from, to) => {
  if (from === to) return 1;
  try {
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from}`);
    return res.data.rates[to] || 1;
  } catch (err) {
    console.error('Exchange rate fetch error:', err.message);
    return 1;
  }
};

// Convert amount
const convertAmount = async (amount, fromCurrency, toCurrency) => {
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
};

/**
 * GET /api/finance/payouts?currency=USD
 */
export const getPayouts = async (req, res) => {
  try {
    const targetCurrency = req.query.currency || req.user.company.currency || 'INR';
    const payouts = await prisma.expense.findMany({
      where: { status: 'APPROVED', isReimbursed: false, companyId: req.user.companyId },
      include: { createdBy: true, receipts: true },
    });

    const converted = await Promise.all(
      payouts.map(async (p) => ({
        ...p,
        amountCompany: await convertAmount(p.amountCompany, req.user.company.currency, targetCurrency),
        currency: targetCurrency,
      }))
    );

    res.json(converted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
};

/**
 * POST /api/finance/payouts/mark-paid
 */
export const markPayoutPaid = async (req, res) => {
  try {
    const { expenseIds } = req.body;
    if (!expenseIds || !Array.isArray(expenseIds)) {
      return res.status(400).json({ error: 'expenseIds must be an array' });
    }

    const update = await prisma.expense.updateMany({
      where: { id: { in: expenseIds }, companyId: req.user.companyId },
      data: { status: 'PAID', isReimbursed: true, resolvedAt: new Date() },
    });

    res.json({ message: `${update.count} expense(s) marked as paid` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark payouts as paid' });
  }
};

/**
 * GET /api/finance/paid?currency=USD
 */
export const getPaidExpenses = async (req, res) => {
  try {
    const targetCurrency = req.query.currency || req.user.company.currency || 'INR';
    const paidExpenses = await prisma.expense.findMany({
      where: { status: 'PAID', companyId: req.user.companyId },
      include: { createdBy: true, receipts: true },
    });

    const converted = await Promise.all(
      paidExpenses.map(async (p) => ({
        ...p,
        amountCompany: await convertAmount(p.amountCompany, req.user.company.currency, targetCurrency),
        currency: targetCurrency,
      }))
    );

    res.json(converted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch paid expenses' });
  }
};
