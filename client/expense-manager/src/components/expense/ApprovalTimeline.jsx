import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, XCircle, Circle } from "lucide-react";
import { format } from "date-fns";

export default function ApprovalTimeline({ approvals, currentStep, status }) {
  const getStepIcon = (approval) => {
    if (approval.status === 'approved') {
      return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    } else if (approval.status === 'rejected') {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else if (approval.sequence_order === currentStep) {
      return <Clock className="w-5 h-5 text-orange-600" />;
    }
    return <Circle className="w-5 h-5 text-slate-300" />;
  };

  return (
    <Card className="border-none shadow-lg shadow-slate-200/50">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900">
          Approval Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {approvals.map((approval, index) => (
            <div key={approval.id} className="relative">
              {index < approvals.length - 1 && (
                <div className="absolute left-2.5 top-8 w-0.5 h-12 bg-slate-200" />
              )}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  {getStepIcon(approval)}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-slate-900">
                    Step {approval.sequence_order}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    {approval.approver_name || approval.approver_email}
                  </p>
                  {approval.status !== 'pending' && approval.approved_at && (
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(approval.approved_at), 'MMM d, h:mm a')}
                    </p>
                  )}
                  {approval.comments && (
                    <p className="text-sm text-slate-600 mt-2 italic">
                      "{approval.comments}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {status === 'approved' && (
            <div className="flex gap-4 pt-2">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="font-bold text-emerald-600">Fully Approved</p>
                <p className="text-sm text-slate-600 mt-1">
                  Expense has been approved
                </p>
              </div>
            </div>
          )}

          {status === 'rejected' && (
            <div className="flex gap-4 pt-2">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div>
                <p className="font-bold text-red-600">Rejected</p>
                <p className="text-sm text-slate-600 mt-1">
                  Expense was rejected
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}