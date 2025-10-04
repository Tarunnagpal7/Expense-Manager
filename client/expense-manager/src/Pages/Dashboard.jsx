import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Company } from "@/entities/Company";
import { Expense } from "@/entities/Expense";
import { ExpenseApproval } from "@/entities/ExpenseApproval";
import { AuditLog } from "@/entities/AuditLog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, TrendingUp, Clock, CheckCircle, XCircle, DollarSign, FileText, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

import StatCard from "../components/dashboard/StatCard";
import ExpenseTable from "../components/dashboard/ExpenseTable";
import ApprovalQueue from "../components/dashboard/ApprovalQueue";
import RecentActivity from "../components/dashboard/RecentActivity";
import CompanySetupWizard from "../components/dashboard/CompanySetupWizard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      if (!userData.company_id && userData.role === 'admin') {
        setShowSetupWizard(true);
        setIsLoading(false);
        return;
      }

      if (userData.company_id) {
        const companies = await Company.filter({ id: userData.company_id });
        if (companies.length > 0) {
          setCompany(companies[0]);
        }
      }

      if (userData.role === 'admin') {
        const allExpenses = await Expense.filter({ company_id: userData.company_id }, '-created_date');
        setExpenses(allExpenses);
        
        const allApprovals = await ExpenseApproval.filter({ status: 'pending' });
        setPendingApprovals(allApprovals);

        const logs = await AuditLog.list('-created_date', 10);
        setRecentActivity(logs);

        setStats({
          totalExpenses: allExpenses.length,
          pendingCount: allExpenses.filter(e => e.status === 'pending' || e.status === 'in_review').length,
          approvedCount: allExpenses.filter(e => e.status === 'approved').length,
          totalAmount: allExpenses.reduce((sum, e) => sum + (e.amount_converted || 0), 0)
        });
      } else {
        const myExpenses = await Expense.filter({ user_email: userData.email }, '-created_date');
        setExpenses(myExpenses);

        const myApprovals = await ExpenseApproval.filter({ 
          approver_email: userData.email,
          status: 'pending' 
        });
        setPendingApprovals(myApprovals);

        const myLogs = await AuditLog.filter({ user_email: userData.email }, '-created_date', 10);
        setRecentActivity(myLogs);

        setStats({
          totalExpenses: myExpenses.length,
          pendingCount: myExpenses.filter(e => e.status === 'pending' || e.status === 'in_review').length,
          approvedCount: myExpenses.filter(e => e.status === 'approved').length,
          totalAmount: myExpenses.reduce((sum, e) => sum + (e.amount_converted || 0), 0)
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