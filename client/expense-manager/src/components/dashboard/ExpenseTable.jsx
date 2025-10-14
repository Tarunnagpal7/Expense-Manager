import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const statusColors = {
  pending: "bg-orange-100 text-orange-800 border-orange-200",
  in_review: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200"
};

export default function ExpenseTable({ expenses, userRole, currencySymbol }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalItems = Array.isArray(expenses) ? expenses.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return (expenses || []).slice(start, end);
  }, [expenses, currentPage]);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  //console.log('Expenses are ',expenses);
  return (
    <Card className="border-none shadow-lg shadow-slate-200/50">
      <CardHeader className="border-b border-slate-100 pb-4">
        <CardTitle className="text-xl font-bold text-slate-900">
          {userRole === 'ADMIN' ? 'All Expenses' : 'My Expenses'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {userRole ==='ADMIN' && <TableHead className="font-semibold">Employee</TableHead>}
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {totalItems > 0 ? (
                  paginatedExpenses.map((expense, index) => (
                    <motion.tr
                      key={expense.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      {userRole ==='ADMIN' && <TableCell className="font-medium">{expense.createdBy?.name || 'Unknown User'}</TableCell>}
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="font-semibold">
                        {currencySymbol}{expense.amountCompany?.toFixed(2) || expense.amountOriginal?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {expense.dateOfExpense ? format(new Date(expense.dateOfExpense), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[expense.status]} border font-medium`}>
                          {expense.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={createPageUrl(`ExpenseDetails?id=${expense.id}`)}
                          className="text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      No expenses found. Create your first expense!
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        {/* Pagination Controls */}
        {totalItems > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-200"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}