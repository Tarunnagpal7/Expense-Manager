import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useAuth } from "../lib/contexts/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Settings,
  Building2,
  LogOut,
  Menu,
  X,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { approvalService } from "../lib/services/approvalService";
import { reportService } from "../lib/services/reportService";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickStats, setQuickStats] = useState({ pending: 0, monthSpend: 0 });

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // Navigate to login page after logout
  };

  const handleLogin = () => {
    navigate("/login"); // Navigate to login page
  };

  const handleSignup = () => {
    navigate("/signup"); // Navigate to signup page
  };

  useEffect(() => {
    const loadQuickStats = async () => {
      try {
        if (user?.role?.toLowerCase() !== "admin") return;
        // Pending approvals count (company-wide)
        const pendingRes = await approvalService.getCompanyPendingCount();
        const pending = pendingRes?.count || 0;
        // This month spend (convert from monthly report)
        const monthly = await reportService.getMonthlyReport();
        // monthly.data is an object of { 'YYYY-MM': amount }
        const keys = Object.keys(monthly?.data || {}).sort();
        const currentMonthKey = keys[keys.length - 1];
        const monthSpend = currentMonthKey ? monthly.data[currentMonthKey] : 0;
        setQuickStats({ pending, monthSpend });
      } catch (e) {
        // fail silently to keep sidebar resilient
        setQuickStats({ pending: 0, monthSpend: 0 });
      }
    };
    loadQuickStats();
  }, [user]);

  const navigationItems = [
    {
      title: "Dashboard",
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
      roles: ["admin", "employee"]
    },
    {
      title: "Manager Dashboard",
      url: createPageUrl("ManagerDashboard"),
      icon: TrendingUp,
      roles: ["manager"]
    },
    {
      title: "Submit Expense",
      url: createPageUrl("SubmitExpense"),
      icon: Receipt,
      roles: ["admin", "employee", "manager"]
    },
    {
      title: "Team Management",
      url: createPageUrl("ManageUsers"),
      icon: Users,
      roles: ["admin"]
    },
    {
      title: "Approval Settings",
      url: createPageUrl("ApprovalSettings"),
      icon: Settings,
      roles: ["admin"]
    },
    {
      title: "Company Settings",
      url: createPageUrl("CompanySettings"),
      icon: Building2,
      roles: ["admin"]
    }
  ];

  const filteredNav = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role?.toLowerCase() || "admin")
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <style>{`
          :root {
            --primary: 213 94% 14%;
            --primary-foreground: 0 0% 98%;
            --secondary: 152 69% 45%;
            --accent: 152 69% 45%;
            --muted: 213 20% 96%;
          }
        `}</style>

        <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">ExpenseFlow</h2>
                <p className="text-xs text-slate-500">Enterprise Edition</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-emerald-50 text-emerald-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user?.role?.toLowerCase() === "admin" && (
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Quick Stats
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 py-2 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Pending Approvals</span>
                      <span className="font-bold text-emerald-600">{quickStats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">This Month</span>
                      <span className="font-bold text-slate-900">₹{quickStats.monthSpend}</span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            {user ? (
              <div className="space-y-3">
                  <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-emerald-500">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                      {user?.role?.toLowerCase() === 'admin' ? 'Administrator' : 
                       user?.role?.toLowerCase() === 'manager' ? 'Manager' : 'Employee'}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignup}
                  className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                >
                  Create Account
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-lg font-bold text-slate-900">ExpenseFlow</h1>
              <div className="w-8" />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}