import React, { useState, useEffect } from 'react';
import { authService } from "@/lib/services/authService";
import { userService } from "@/lib/services/userService";
import { companyService } from "@/lib/services/companyService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserPlus, Shield, User as UserIcon, Plus, Edit, Trash2, Crown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "react-hot-toast";

export default function ManageUsers() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [company, setCompany] = useState(null);
  const [managers, setManagers] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
    managerId: 'none',
    department: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.user;
      setCurrentUser(userData);

      if (userData.company) {
        setCompany(userData.company);
        
        // Fetch users for the company
        const usersResponse = await userService.getAllUsers();
        setUsers(usersResponse.users || []);
        
        // Get managers from all users (simpler approach)
        const allUsers = usersResponse.users || [];
        const managerUsers = allUsers.filter(user => 
          user.role?.toLowerCase() === 'manager' || 
          user.role?.toLowerCase() === 'admin' ||
          user.isManagerApprover === true
        );
        setManagers(managerUsers);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newUser.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = {
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        managerId: newUser.managerId === 'none' ? null : newUser.managerId || null,
        department: newUser.department || null
      };

      await userService.createUser(userData);
      toast.success('User created successfully!');
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'EMPLOYEE',
        managerId: 'none',
        department: ''
      });
      
      setIsCreateDialogOpen(false);
      loadData(); // Refresh the user list
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        loadData(); // Refresh the user list
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Crown className="w-3 h-3 mr-1" />;
      case 'manager':
        return <Shield className="w-3 h-3 mr-1" />;
      default:
        return <UserIcon className="w-3 h-3 mr-1" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return "bg-purple-100 text-purple-800 border-purple-200";
      case 'manager':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'employee':
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Management</h1>
            <p className="text-slate-600">Manage users and assign managers</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{users.length} Team Members</span>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Team Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Team Member</DialogTitle>
                  <DialogDescription>
                    Create a new user account for your team member. They will receive access based on their assigned role.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        placeholder="Min. 8 characters"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={newUser.confirmPassword}
                        onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                        placeholder="Re-enter password"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMPLOYEE">
                            <div className="flex items-center">
                              <UserIcon className="w-4 h-4 mr-2" />
                              Employee
                            </div>
                          </SelectItem>
                          <SelectItem value="MANAGER">
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-2" />
                              Manager
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager">Manager</Label>
                      <Select value={newUser.managerId} onValueChange={(value) => setNewUser({...newUser, managerId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No manager</SelectItem>
                          {managers.map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>
                              {manager.name} ({manager.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                      placeholder="e.g., Engineering, Sales, Marketing"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateUser}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    {isLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="border-none shadow-lg shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-emerald-600" />
              Team Members
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Manager</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          {user.name || user.full_name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleIcon(user.role)}
                          {user.role?.charAt(0).toUpperCase() + user.role?.slice(1).toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell className="text-slate-600">
                        {user.manager?.name || user.manager_email || 'No manager assigned'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.role?.toLowerCase() !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.name || user.full_name)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-2 border-emerald-200 bg-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900 mb-1">Team Management Made Easy</h3>
                <p className="text-sm text-emerald-700 mb-3">
                  You can now create and manage team members directly from this interface. New users will automatically be part of your company and can log in with their assigned credentials.
                </p>
                <ul className="text-xs text-emerald-600 space-y-1 list-disc list-inside">
                  <li><strong>Employees:</strong> Can submit expenses and track their status</li>
                  <li><strong>Managers:</strong> Can approve expenses from their direct reports</li>
                  <li><strong>Admins:</strong> Have full system access and can manage all users</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}