import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ManagerDashboard = () => {
  const [approvals, setApprovals] = useState([
    {
      id: '1',
      subject: 'Client Dinner - Tech Conference',
      owner: 'Sarah Johnson',
      category: 'Meals',
      status: 'pending',
      amount: 507.50,
      currency: 'USD',
      convertedAmount: 507.50,
      date: '2024-01-15',
      description: 'Business dinner with potential clients during tech conference'
    },
    {
      id: '2',
      subject: 'Flight to San Francisco',
      owner: 'Mike Chen',
      category: 'Travel',
      status: 'pending',
      amount: 845.00,
      currency: 'USD',
      convertedAmount: 845.00,
      date: '2024-01-10',
      description: 'Round-trip flight for quarterly business review'
    },
    {
      id: '3',
      subject: 'Team Building Activity',
      owner: 'Emily Davis',
      category: 'Client Entertainment',
      status: 'pending',
      amount: 1200.00,
      currency: 'USD',
      convertedAmount: 1200.00,
      date: '2024-01-08',
      description: 'Team building event with department members'
    }
  ]);

  const stats = [
    {
      title: 'Pending Approvals',
      value: '3',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Team Members',
      value: '12',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Approved This Month',
      value: '$2,845',
      icon: TrendingUp,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Total Expenses',
      value: '24',
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  const handleApprove = (approvalId) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === approvalId 
        ? { ...approval, status: 'approved' }
        : approval
    ));
  };

  const handleReject = (approvalId) => {
    setApprovals(prev => prev.map(approval => 
      approval.id === approvalId 
        ? { ...approval, status: 'rejected' }
        : approval
    ));
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { color: 'bg-orange-100 text-orange-800 border-orange-200' },
      approved: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    return (
      <Badge variant="outline" className={variants[status].color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      Travel: 'text-blue-600 bg-blue-50',
      Meals: 'text-orange-600 bg-orange-50',
      Accommodation: 'text-purple-600 bg-purple-50',
      'Client Entertainment': 'text-pink-600 bg-pink-50',
      'Office Supplies': 'text-gray-600 bg-gray-50'
    };
    return colors[category] || 'text-gray-600 bg-gray-50';
  };

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
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
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
                  {approvals.map((approval) => (
                    <motion.tr 
                      key={approval.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-slate-200 hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell className="font-medium text-slate-900">
                        <div>
                          <p className="font-semibold">{approval.subject}</p>
                          <p className="text-sm text-slate-500 mt-1">{approval.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700">{approval.owner}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getCategoryColor(approval.category)}>
                          {approval.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(approval.status)}</TableCell>
                      <TableCell className="text-right text-slate-900 font-semibold">
                        ${approval.convertedAmount.toFixed(2)}
                        <p className="text-sm text-slate-500 font-normal">
                          {approval.amount} {approval.currency} = {approval.convertedAmount} USD
                        </p>
                      </TableCell>
                      <TableCell>
                        {approval.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(approval.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(approval.id)}
                              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className={
                                approval.status === 'approved' 
                                  ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                                  : 'border-red-200 text-red-700 bg-red-50'
                              }
                            >
                              {approval.status === 'approved' ? 'Approved' : 'Rejected'}
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
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

              {approvals.filter(a => a.status === 'pending').length === 0 && (
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
              <Button className="w-full justify-start bg-emerald-600 hover:bg-emerald-700 text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Team Reports
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200">
                <Users className="w-4 h-4 mr-2" />
                Manage Team
              </Button>
              <Button variant="outline" className="w-full justify-start border-slate-200">
                <FileText className="w-4 h-4 mr-2" />
                Export Approvals
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-slate-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Approved expense</p>
                    <p className="text-sm text-slate-600">Client Meeting - $250.00</p>
                    <p className="text-xs text-slate-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Rejected expense</p>
                    <p className="text-sm text-slate-600">Personal Item - $89.99</p>
                    <p className="text-xs text-slate-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Approved expense</p>
                    <p className="text-sm text-slate-600">Software Subscription - $299.00</p>
                    <p className="text-xs text-slate-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;