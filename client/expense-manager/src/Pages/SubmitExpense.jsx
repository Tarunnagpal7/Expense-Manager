import React, { useState, useEffect } from 'react';
import { User } from "@/entities/User";
import { Company } from "@/entities/Company";
import { Expense } from "@/entities/Expense";
import { ExpenseApproval } from "@/entities/ExpenseApproval";
import { ApprovalSequence } from "@/entities/ApprovalSequence";
import { AuditLog } from "@/entities/AuditLog";
// import { UploadFile, ExtractDataFromUploadedFile } from "@/integrations/Core";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload, Receipt, Sparkles, ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

import ReceiptScanner from "../components/expense/ReceiptScanner";
import CurrencyConverter from "../components/expense/CurrencyConverter";

export default function SubmitExpense() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount_original: '',
    currency_original: '',
    merchant_name: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_url: ''
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await User.me();
    setUser(userData);

    if (userData.company_id) {
      const companies = await Company.filter({ id: userData.company_id });
      if (companies.length > 0) {
        setCompany(companies[0]);
        setFormData(prev => ({ ...prev, currency_original: companies[0].default_currency }));
      }
    }
  };

//   const handleReceiptScan = async (file) => {
//     setIsScanning(true);
//     try {
//       const { file_url } = await UploadFile({ file });
//       setFormData(prev => ({ ...prev, receipt_url: file_url }));

//       const result = await ExtractDataFromUploadedFile({
//         file_url,
//         json_schema: {
//           type: "object",
//           properties: {
//             merchant_name: { type: "string" },
//             amount: { type: "number" },
//             currency: { type: "string" },
//             date: { type: "string" },
//             category: { type: "string" }
//           }
//         }
//       });

//       if (result.status === "success" && result.output) {
//         setFormData(prev => ({
//           ...prev,
//           merchant_name: result.output.merchant_name || prev.merchant_name,
//           amount_original: result.output.amount || prev.amount_original,
//           currency_original: result.output.currency || prev.currency_original,
//           expense_date: result.output.date || prev.expense_date,
//           category: result.output.category || prev.category
//         }));
//       }
//     } catch (error) {
//       console.error("Error scanning receipt:", error);
//     }
//     setIsScanning(false);
//   };

  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (!amount || fromCurrency === toCurrency) return amount;

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await response.json();
      return (amount * data.rates[toCurrency]).toFixed(2);
    } catch (error) {
      console.error("Error converting currency:", error);
      return amount;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const convertedAmount = await convertCurrency(
        parseFloat(formData.amount_original),
        formData.currency_original,
        company.default_currency
      );

      const expense = await Expense.create({
        ...formData,
        company_id: company.id,
        user_email: user.email,
        user_name: user.full_name,
        amount_converted: parseFloat(convertedAmount),
        status: 'pending',
        current_approval_step: 1
      });

      const sequences = await ApprovalSequence.filter(
        { company_id: company.id },
        'sequence_order'
      );

      if (sequences.length > 0) {
        const firstSequence = sequences[0];
        let approverEmail = null;

        if (firstSequence.specific_user_email) {
          approverEmail = firstSequence.specific_user_email;
        } else if (firstSequence.role === 'admin') {
          approverEmail = company.admin_email;
        } else if (firstSequence.role === 'manager' && user.manager_email) {
          approverEmail = user.manager_email;
        }

        if (approverEmail) {
          await ExpenseApproval.create({
            expense_id: expense.id,
            approver_email: approverEmail,
            approver_name: 'Approver',
            sequence_order: 1,
            status: 'pending'
          });

          await Expense.update(expense.id, { status: 'in_review' });
        }
      }

      await AuditLog.create({
        user_email: user.email,
        user_name: user.full_name,
        action: `Submitted expense: ${formData.category} - ${company.currency_symbol}${convertedAmount}`,
        reference_id: expense.id,
        reference_type: 'expense'
      });

      setShowSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    } catch (error) {
      console.error("Error submitting expense:", error);
    }
    setIsSubmitting(false);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Expense Submitted!</h2>
          <p className="text-slate-600">Redirecting to dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Submit New Expense</h1>
            <p className="text-slate-600 mt-1">Upload receipt and fill in the details</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="border-none shadow-lg shadow-slate-200/50">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  Expense Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({...formData, category: value})}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Travel", "Meals", "Accommodation", "Transportation", "Office Supplies", "Software", "Client Entertainment", "Other"].map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="merchant">Merchant Name</Label>
                      <Input
                        id="merchant"
                        value={formData.merchant_name}
                        onChange={(e) => setFormData({...formData, merchant_name: e.target.value})}
                        placeholder="e.g. Starbucks"
                      />
                    </div>
                  </div>

                  <CurrencyConverter
                    amount={formData.amount_original}
                    currency={formData.currency_original}
                    targetCurrency={company?.default_currency}
                    onAmountChange={(value) => setFormData({...formData, amount_original: value})}
                    onCurrencyChange={(value) => setFormData({...formData, currency_original: value})}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="date">Expense Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.expense_date}
                      onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Add any additional details..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.category || !formData.amount_original}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Expense'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            {/* <ReceiptScanner
              onScan={handleReceiptScan}
              isScanning={isScanning}
              receiptUrl={formData.receipt_url}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}