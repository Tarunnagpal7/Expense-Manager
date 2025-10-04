import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle, DollarSign, FileText, Users } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";
import { format } from "date-fns";
import { useAuth } from "../lib/contexts/AuthContext";
import { expenseService } from "../lib/services/expenseService";
import { reportService } from "../lib/services/reportService";

import StatCard from "../components/dashboard/StatCard";
import ExpenseTable from "../components/dashboard/ExpenseTable";
import ApprovalQueue from "../components/dashboard/ApprovalQueue";
import RecentActivity from "../components/dashboard/RecentActivity";
import CompanySetupWizard from "../components/dashboard/CompanySetupWizard";

export default function Dashboard() {
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }

      if (!user.company && user.role === 'ADMIN') {
        setShowSetupWizard(true);
        setIsLoading(false);
        return;
      }

      if (user.company) {
        setCompany(user.company);
      }

      if (user.role === 'ADMIN') {
        const expensesResponse = await expenseService.getAllExpenses();
        setExpenses(expensesResponse.data || []);
        
        const reportResponse = await reportService.getOverviewReport();
        setStats(reportResponse);

        setStats({
          totalExpenses: expensesResponse.data?.length || 0,
          pendingCount: expensesResponse.data?.filter(e => e.status === 'SUBMITTED' || e.status === 'PENDING_APPROVAL').length || 0,
          approvedCount: expensesResponse.data?.filter(e => e.status === 'APPROVED').length || 0,
          totalAmount: reportResponse.totalExpenses || 0
        });
      } else {
        const myExpensesResponse = await expenseService.getUserExpenses(user.id);
        setExpenses(myExpensesResponse.data || []);

        setStats({
          totalExpenses: myExpensesResponse.data?.length || 0,
          pendingCount: myExpensesResponse.data?.filter(e => e.status === 'SUBMITTED' || e.status === 'PENDING_APPROVAL').length || 0,
          approvedCount: myExpensesResponse.data?.filter(e => e.status === 'APPROVED').length || 0,
          totalAmount: myExpensesResponse.data?.reduce((sum, e) => sum + (e.amountCompany || 0), 0) || 0
        });
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setIsLoading(false);
  };

  const handleSetupComplete = () => {
    setShowSetupWizard(false);
    loadData();
  };

  if (showSetupWizard) {
    return <CompanySetupWizard onComplete={handleSetupComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              {user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-slate-600">
              {user?.role === 'admin' 
                ? 'Overview of all company expenses and approvals' 
                : 'Track your expenses and pending approvals'}
            </p>
          </div>
          <Link to={createPageUrl("SubmitExpense")}>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4 mr-2" />
              New Expense
            </Button>
          </Link>
        </div>

        {!isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Expenses"
                value={stats.totalExpenses || 0}
                icon={FileText}
                color="blue"
              />
              <StatCard
                title="Pending Review"
                value={stats.pendingCount || 0}
                icon={Clock}
                color="orange"
              />
              <StatCard
                title="Approved"
                value={stats.approvedCount || 0}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Total Amount"
                value={`${company?.currency_symbol || '$'}${(stats.totalAmount || 0).toFixed(2)}`}
                icon={DollarSign}
                color="purple"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ExpenseTable 
                  expenses={expenses}
                  userRole={user?.role}
                  currencySymbol={company?.currency_symbol || '$'}
                />
              </div>

              <div className="space-y-6">
                {pendingApprovals.length > 0 && (
                  <ApprovalQueue 
                    approvals={pendingApprovals}
                    onRefresh={loadData}
                  />
                )}
                <RecentActivity activities={recentActivity} />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}