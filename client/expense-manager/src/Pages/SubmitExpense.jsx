import React, { useState, useEffect } from 'react';
import { authService } from "@/lib/services/authService";
import { companyService } from "@/lib/services/companyService";
import { expenseService } from "@/lib/services/expenseService";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.user;
      setUser(userData);

      if (userData.company) {
        setCompany(userData.company);
        setFormData(prev => ({ ...prev, currency_original: userData.company.currency || 'USD' }));
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    } finally {
      setIsLoading(false);
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
      // Check if company data is loaded
      if (!company) {
        throw new Error("Company information not loaded. Please refresh the page and try again.");
      }

      const convertedAmount = await convertCurrency(
        parseFloat(formData.amount_original),
        formData.currency_original,
        company.currency || 'USD'
      );

      const expenseData = {
        title: formData.category,
        description: formData.description,
        category: formData.category,
        dateOfExpense: new Date(formData.expense_date),
        amountOriginal: parseFloat(formData.amount_original),
        currencyOriginal: formData.currency_original,
        amountCompany: parseFloat(convertedAmount),
        exchangeRateAtSubmit: parseFloat(convertedAmount) / parseFloat(formData.amount_original),
        status: 'DRAFT'
      };

      const expense = await expenseService.createExpense(expenseData);

      setShowSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    } catch (error) {
      console.error("Error submitting expense:", error);
      alert("Error submitting expense: " + (error.message || "Unknown error"));
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
                    targetCurrency={company?.currency}
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
                    disabled={isSubmitting || !formData.category || !formData.amount_original || !company || isLoading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12"
                  >
                    {isLoading ? 'Loading...' : isSubmitting ? 'Submitting...' : 'Submit Expense'}
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