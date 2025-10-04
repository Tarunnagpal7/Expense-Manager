import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, ArrowRight } from "lucide-react";

export default function ApprovalQueue({ approvals, onRefresh }) {
  return (
    <Card className="border-none shadow-lg shadow-slate-200/50">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Pending Approvals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {approvals.length > 0 ? (
          <div className="space-y-3">
            {approvals.slice(0, 5).map((approval) => (
              <Link
                key={approval.id}
                to={createPageUrl(`ExpenseDetails?id=${approval.expense_id}`)}
                className="block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Expense #{approval.expense_id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Step {approval.sequence_order}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500">No pending approvals</p>
        )}
      </CardContent>
    </Card>
  );
}