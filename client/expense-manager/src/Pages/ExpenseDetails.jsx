import React, { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../lib/services/expenseService';
import { approvalService } from '../lib/services/approvalService';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User as UserIcon, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useAuth } from '../lib/contexts/AuthContext';
import { useParams } from "react-router-dom";


import ApprovalTimeline from "../components/expense/ApprovalTimeline";

const ExpenseDetails=()=> {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("Expense ID:", id);

  //const expenseId = urlParams.get('id');
  console.log("Expense Id : ", id);

  const [company, setCompany] = useState(null);
  const [expense, setExpense] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [canApprove, setCanApprove] = useState(false);
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const [currentInstanceStepId, setCurrentInstanceStepId] = useState(null);

 

  const loadData = useCallback(async () => {
    if (!id) return;

    // Fetch expense details from backend
    const expenseResp = await expenseService.getExpenseById(id);
    const fetchedExpense = expenseResp?.data || expenseResp; // handle either {success,data} or direct
    console.log('Expense is ', fetchedExpense);
    setExpense(fetchedExpense);

    // Fetch approval instance and map to timeline approvals
    const instance = await approvalService.getApprovalInstance(id);
    if (instance) {
      const mappedApprovals = (instance.stepsState || [])
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((s) => ({
          id: s.id,
          sequence_order: s.stepOrder,
          approver_name: s.decisions?.[0]?.approver?.name || undefined,
          approver_email: s.decisions?.[0]?.approver?.email || undefined,
          status: (s.status || 'PENDING').toLowerCase(),
          approved_at: s.decisions?.find(d => d.decision === 'APPROVED')?.decidedAt || null,
          comments: s.decisions?.[0]?.comment || undefined,
        }));
      setApprovals(mappedApprovals);

      // Determine if current user can approve this expense now
      const pendingStep = (instance.stepsState || []).find((s) => s.status === 'PENDING');
      if (pendingStep) {
        setCurrentInstanceStepId(pendingStep.id);
        // As pending retrieval uses step.approverUserId, check via pending approvals list for reliability
        const myPendings = await approvalService.getPendingApprovals();
        const isPendingForMe = Array.isArray(myPendings) && myPendings.some((p) => p.id === pendingStep.id);
        setCanApprove(!!isPendingForMe);
      } else {
        setCanApprove(false);
      }
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  console.log('User2 is: ', user);

  const handleApproval = async (approved) => {
    setIsProcessing(true);
    try {
      if (!currentInstanceStepId) return;
      await approvalService.decideApproval(
        currentInstanceStepId,
        approved ? 'APPROVED' : 'REJECTED',
        comments
      );
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error processing approval:", error);
    }
    setIsProcessing(false);
  };

  if (!expense) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const statusColors = {
    PENDING_APPROVAL: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    SUBMITTED: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    in_review: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    approved: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
    rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" }
  };
  
  console.log(expense);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">Expense Details</h1>
            <p className="text-slate-600 mt-1">ID: {String(id).slice(0, 16)}...</p>
          </div>
          <Badge className={`${statusColors[expense.status].bg} ${statusColors[expense.status].text} ${statusColors[expense.status].border} border-2 text-sm px-4 py-2`}>
            {expense.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-lg shadow-slate-200/50">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  Expense Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <UserIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Employee</span>
                    </div>
                    <p className="font-semibold text-slate-900">{expense.createdBy.name || 'Employee'}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Date</span>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {expense.dateOfExpense ? format(new Date(expense.dateOfExpense), 'MMMM d, yyyy') : 'N/A'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Amount</span>
                    </div>
                    <p className="font-bold text-2xl text-emerald-600">
                      {(company?.currency_symbol || '')}{(expense.amountCompany ?? 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Original: {expense.currencyOriginal} {(expense.amountOriginal ?? 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Category</span>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {expense.category}
                    </Badge>
                  </div>
                </div>

                {expense.merchant_name && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Merchant</p>
                    <p className="font-semibold text-slate-900">{expense.merchant_name}</p>
                  </div>
                )}

                {expense.description && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Description</p>
                    <p className="text-slate-700">{expense.description}</p>
                  </div>
                )}

                {Array.isArray(expense.receipts) && expense.receipts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Receipt</p>
                    <a
                      href={expense.receipts[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      {String(expense.receipts[0].url).endsWith('.pdf') ? (
                        <div className="border-2 border-slate-200 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                          <p className="text-emerald-600 font-medium">View PDF Receipt</p>
                        </div>
                      ) : (
                        <img
                          src={expense.receipts[0].url}
                          alt="Receipt"
                          className="max-w-full rounded-xl border-2 border-slate-200 hover:border-emerald-500 transition-colors"
                        />
                      )}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {canApprove && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200">
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                      <Clock className="w-5 h-5" />
                      Approval Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Comments (optional)</label>
                      <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Add your comments..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproval(false)}
                        disabled={isProcessing}
                        variant="outline"
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50 h-12"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApproval(true)}
                        disabled={isProcessing}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div>
            <ApprovalTimeline
              approvals={approvals}
              currentStep={expense?.approvalInstances?.[0]?.currentStepOrder || 0}
              status={expense.status?.toLowerCase?.()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseDetails;