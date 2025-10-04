import React, { useState, useEffect, useCallback } from 'react';
import { User } from "@/entities/User";
import { Company } from "@/entities/Company";
import { Expense } from "@/entities/Expense";
import { ExpenseApproval } from "@/entities/ExpenseApproval";
import { ApprovalSequence } from "@/entities/ApprovalSequence";
import { AuditLog } from "@/entities/AuditLog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, User as UserIcon, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

import ApprovalTimeline from "../components/expense/ApprovalTimeline";

export default function ExpenseDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const expenseId = urlParams.get('id');

  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [expense, setExpense] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [canApprove, setCanApprove] = useState(false);
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = useCallback(async () => {
    if (!expenseId) return;

    const userData = await User.me();
    setUser(userData);

    if (userData.company_id) {
      const companies = await Company.filter({ id: userData.company_id });
      if (companies.length > 0) setCompany(companies[0]);
    }

    const expenses = await Expense.filter({ id: expenseId });
    if (expenses.length > 0) {
      setExpense(expenses[0]);

      const expenseApprovals = await ExpenseApproval.filter(
        { expense_id: expenseId },
        'sequence_order'
      );
      setApprovals(expenseApprovals);

      const pendingApproval = expenseApprovals.find(
        a => a.status === 'pending' && a.approver_email === userData.email
      );
      setCanApprove(!!pendingApproval);
    }
  }, [expenseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproval = async (approved) => {
    setIsProcessing(true);
    try {
      const currentApproval = approvals.find(
        a => a.status === 'pending' && a.approver_email === user.email
      );

      if (currentApproval) {
        await ExpenseApproval.update(currentApproval.id, {
          status: approved ? 'approved' : 'rejected',
          comments,
          approved_at: new Date().toISOString()
        });

        if (!approved) {
          await Expense.update(expenseId, {
            status: 'rejected',
            rejection_reason: comments
          });

          await AuditLog.create({
            user_email: user.email,
            user_name: user.full_name,
            action: `Rejected expense #${expenseId.slice(0, 8)}`,
            reference_id: expenseId,
            reference_type: 'expense',
            details: comments
          });
        } else {
          const sequences = await ApprovalSequence.filter(
            { company_id: expense.company_id },
            'sequence_order'
          );
          const nextSequence = sequences.find(s => s.sequence_order > currentApproval.sequence_order);

          if (nextSequence) {
            let nextApproverEmail = null;

            if (nextSequence.specific_user_email) {
              nextApproverEmail = nextSequence.specific_user_email;
            } else if (nextSequence.role === 'admin') {
              nextApproverEmail = company.admin_email;
            }

            if (nextApproverEmail) {
              await ExpenseApproval.create({
                expense_id: expenseId,
                approver_email: nextApproverEmail,
                approver_name: 'Approver',
                sequence_order: nextSequence.sequence_order,
                status: 'pending'
              });

              await Expense.update(expenseId, {
                current_approval_step: nextSequence.sequence_order
              });
            }
          } else {
            await Expense.update(expenseId, {
              status: 'approved',
              final_approved_by: user.email
            });
          }

          await AuditLog.create({
            user_email: user.email,
            user_name: user.full_name,
            action: `Approved expense #${expenseId.slice(0, 8)}`,
            reference_id: expenseId,
            reference_type: 'expense'
          });
        }

        navigate(createPageUrl("Dashboard"));
      }
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
    pending: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    in_review: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    approved: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
    rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" }
  };

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
            <p className="text-slate-600 mt-1">ID: {expenseId.slice(0, 16)}...</p>
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
                    <p className="font-semibold text-slate-900">{expense.user_name}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Date</span>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {format(new Date(expense.expense_date), 'MMMM d, yyyy')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm font-medium">Amount</span>
                    </div>
                    <p className="font-bold text-2xl text-emerald-600">
                      {company?.currency_symbol}{expense.amount_converted?.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Original: {expense.currency_original} {expense.amount_original?.toFixed(2)}
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

                {expense.receipt_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Receipt</p>
                    <a
                      href={expense.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      {expense.receipt_url.endsWith('.pdf') ? (
                        <div className="border-2 border-slate-200 rounded-xl p-4 hover:border-emerald-500 transition-colors">
                          <p className="text-emerald-600 font-medium">View PDF Receipt</p>
                        </div>
                      ) : (
                        <img
                          src={expense.receipt_url}
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
              currentStep={expense.current_approval_step}
              status={expense.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}