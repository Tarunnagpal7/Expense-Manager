import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Download,
  MoreHorizontal,
  Users,
  FileText,
  TrendingUp,
  Clock,
  Eye,
  DollarSign,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '../lib/contexts/AuthContext';
import { expenseService } from '../lib/services/expenseService';
import { approvalService } from '../lib/services/approvalService';
import { userService } from '../lib/services/userService';
import { reportService } from '../lib/services/reportService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';
import { useNavigate } from 'react-router-dom';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    teamMembersCount: 0,
    approvedThisMonth: 0,
    totalExpenses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  //console.log("Auth Context User is: ", user);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load pending approvals for this manager
      const approvalsResponse = await approvalService.getPendingApprovals();
      //console.log('Approvals are ', approvalsResponse);
      setPendingApprovals(Array.isArray(approvalsResponse) ? approvalsResponse : []);
      //console.log(approvalsResponse);
      // Load team members (direct reports)
      const usersResponse = await userService.getAllUsers();
      //console.log('Users are ',usersResponse);
      const directReports = usersResponse.users?.filter(u => 
        u.manager.id === user.id || u.manager.email === user.email
      ) || [];
      setTeamMembers(directReports);
      

      // Load manager-specific stats
      const reportResponse = await reportService.getOverviewReport();
      
      // Calculate stats
      const pendingCount = Array.isArray(approvalsResponse) ? approvalsResponse.length : 0;
      const teamMembersCount = usersResponse.users?.length || 0;
      const approvedThisMonth = reportResponse.approvedThisMonth || 0;
      const totalExpenses = reportResponse.totalExpenses || 0;

      setStats({
        pendingCount,
        teamMembersCount,
        approvedThisMonth,
        totalExpenses
      });

      // Load recent activity dynamically from team expenses
      const expensesResp = await expenseService.getAllExpenses();
      const allExpenses = Array.isArray(expensesResp?.data)
        ? expensesResp.data
        : Array.isArray(expensesResp)
        ? expensesResp
        : [];

      const teamIds = new Set(directReports.map((u) => u.id));
      const teamExpenses = allExpenses.filter((e) => teamIds.has(e.createdById));
      //console.log('Team Expenses are: ', teamExpenses);

      const activities = teamExpenses
      .filter(e => ['APPROVED', 'PAID','REJECTED'].includes(e.status))
        .map((e) => {
          // Determine most relevant event and timestamp
          const status = e.status;
          let type = null;
          let ts = e.updatedAt || e.resolvedAt || e.submittedAt || e.createdAt;

          if (status === 'APPROVED' || status === 'PAID') type = 'approved';
          else if (status === 'REJECTED') type = 'rejected';
          else if (status === 'SUBMITTED' || status === 'PENDING_APPROVAL') type = 'submitted';
          else type = 'updated';

          return {
            id: e.id,
            type,
            description: e.title || e.description || 'Expense update',
            amount: e.amountCompany || 0,
            user: e.createdBy?.name || 'Unknown',
            timestamp: new Date(ts),
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
      
      console.log("Activities are: ", activities);
      setRecentActivity(activities);

    } catch (error) {
      console.error('Error loading manager dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (approvalId, isApproved) => {
    setIsProcessingApproval(true);
    try {
      await approvalService.decideApproval(approvalId, isApproved ? 'APPROVED' : 'REJECTED', approvalComment);
      
      toast.success(`Expense ${isApproved ? 'approved' : 'rejected'} successfully`);
      
      // Refresh data
      await loadData();
      
      // Close dialog
      setIsApprovalDialogOpen(false);
      setSelectedApproval(null);
      setApprovalComment('');
      
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error(`Failed to ${isApproved ? 'approve' : 'reject'} expense`);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  const openApprovalDialog = (approval) => {
    setSelectedApproval(approval);
    setIsApprovalDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING_APPROVAL: { color: 'bg-orange-100 text-orange-800 border-orange-200' },
      APPROVED: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      REJECTED: { color: 'bg-red-100 text-red-800 border-red-200' },
      SUBMITTED: { color: 'bg-blue-100 text-blue-800 border-blue-200' }
    };
    
    return (
      <Badge variant="outline" className={variants[status]?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status?.replace('_', ' ').toLowerCase() || 'Unknown'}
      </Badge>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      Travel: 'text-blue-600 bg-blue-50',
      Meals: 'text-orange-600 bg-orange-50',
      Accommodation: 'text-purple-600 bg-purple-50',
      'Client Entertainment': 'text-pink-600 bg-pink-50',
      'Office Supplies': 'text-gray-600 bg-gray-50',
      'Software': 'text-green-600 bg-green-50',
      'Transportation': 'text-indigo-600 bg-indigo-50'
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };
  
  //console.log('Approvals that are pending:', pendingApprovals);
  const filteredApprovals = pendingApprovals.filter(approval =>
    approval.instance.expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    approval.instance.expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //console.log('Filtered Approvals are: ',filteredApprovals);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  console.log("Selected Approvals are :", selectedApproval);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 
          className="text-3xl font-bold text-slate-900 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Manager's Dashboard
        </motion.h1>
        <p className="text-slate-600">Review and manage team expense approvals</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingCount}</p>
                </div>
                <div className="p-3 rounded-full bg-orange-50">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Team Members</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.teamMembersCount}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Approved This Month</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">${stats.approvedThisMonth.toFixed(2)}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-50">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalExpenses}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-50">
                  <FileText className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-900">Approvals to Review</CardTitle>
                  <CardDescription>Manage pending expense approvals from your team</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <Input 
                      placeholder="Search approvals..." 
                      className="pl-9 w-64 border-slate-200"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-200">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-700">Approval Subject</TableHead>
                    <TableHead className="text-slate-700">Request Owner</TableHead>
                    <TableHead className="text-slate-700">Category</TableHead>
                    <TableHead className="text-slate-700">Request Status</TableHead>
                    <TableHead className="text-slate-700 text-right">Total Amount</TableHead>
                    <TableHead className="text-slate-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApprovals.map((approval) => (
                    <motion.tr 
                      key={approval.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-slate-200 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900">
                        <div>
                          <p className="font-semibold">{approval.subject || approval.instance.expense.title || 'Untitled Expense'}</p>
                          <p className="text-sm text-slate-500 mt-1">{approval.instance.expense.description || approval.note || 'No description'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          {approval.instance.expense.createdBy.name || approval.user?.name || approval.owner || 'Unknown User'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getCategoryColor(approval.category)}>
                          {approval.instance.expense.category || 'Uncategorized'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.instance.expense.status)}</TableCell>
                      <TableCell className="text-right text-slate-900 font-semibold">
                        ₹{(approval.instance.expense.amountCompany || approval.amount || 0).toFixed(2)}
                        <p className="text-sm text-slate-500 font-normal">
                          {approval.currency || 'USD'}
                        </p>
                      </TableCell>
                      <TableCell>
                        {(approval.instance.expense.status === 'PENDING_APPROVAL' || approval.instance.expense.status === 'SUBMITTED') ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => openApprovalDialog(approval)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(createPageUrl('ExpenseDetails', { id: approval.instance.expense.id || approval.id }))}
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className={
                                approval.instance.expense.status === 'APPROVED' 
                                  ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                  : 'border-red-200 text-red-700 bg-red-50'
                              }
                            >
                              {approval.instance.expense.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(createPageUrl('ExpenseDetails', { id: approval.instance.expense.id || approval.id }))}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download Receipt
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>

              {filteredApprovals.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">All Caught Up!</h3>
                  <p className="text-slate-600">No pending approvals to review at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => navigate(createPageUrl('SubmitExpense'))}
              >
                <FileText className="w-4 h-4 mr-2" />
                Submit Expense
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-200"
                onClick={() => navigate(createPageUrl('Dashboard'))}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-200"
                onClick={() => {
                  // Export functionality would go here
                  toast.info('Export feature coming soon!');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Team Members</CardTitle>
              <CardDescription>{teamMembers.length} direct reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {(member.name || member.full_name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {member.name || member.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {member.department || 'No department'}
                      </p>
                    </div>
                  </div>
                ))}
                {teamMembers.length > 5 && (
                  <p className="text-xs text-slate-500 text-center pt-2">
                    +{teamMembers.length - 5} more team members
                  </p>
                )}
                {teamMembers.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No team members assigned
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {activity.type === 'approved' ? 'Approved expense' : 'Rejected expense'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {activity.description} - ${activity.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {format(activity.timestamp, 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Expense</DialogTitle>
            <DialogDescription>
              Review the expense details and make your decision
            </DialogDescription>
          </DialogHeader>
          
          {selectedApproval && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Subject</Label>
                  <p className="text-sm text-slate-900">{selectedApproval.instance.expense.title || selectedApproval.title || 'Untitled'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Amount</Label>
                  <p className="text-sm text-slate-900">${(selectedApproval.instance.expense.amountCompany || selectedApproval.amount || 0).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Category</Label>
                  <p className="text-sm text-slate-900">{selectedApproval.instance.expense.category || 'Uncategorized'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Submitted By</Label>
                  <p className="text-sm text-slate-900">{selectedApproval.instance.expense.createdBy.name || selectedApproval.user?.name || 'Unknown'}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-700">Description</Label>
                <p className="text-sm text-slate-900 mt-1">{selectedApproval.instance.expense.description || selectedApproval.note || 'No description provided'}</p>
              </div>

              <div>
                <Label htmlFor="comment" className="text-sm font-medium text-slate-700">Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Add a comment for your decision..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsApprovalDialogOpen(false);
                setSelectedApproval(null);
                setApprovalComment('');
              }}
              disabled={isProcessingApproval}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleApprove(selectedApproval?.id, false)}
              disabled={isProcessingApproval}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isProcessingApproval ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              onClick={() => handleApprove(selectedApproval?.id, true)}
              disabled={isProcessingApproval}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isProcessingApproval ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;