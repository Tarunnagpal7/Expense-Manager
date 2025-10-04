import React, { useState, useEffect } from 'react';
import { User } from "@/entities/User";
import { Company } from "@/entities/Company";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Shield, User as UserIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ManageUsers() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const userData = await User.me();
    setCurrentUser(userData);

    if (userData.company_id) {
      const companyUsers = await User.filter({ company_id: userData.company_id });
      setUsers(companyUsers);

      const companies = await Company.filter({ id: userData.company_id });
      if (companies.length > 0) setCompany(companies[0]);
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
          <div className="flex items-center gap-2 text-emerald-600">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{users.length} Team Members</span>
          </div>
        </div>

        <Card className="border-none shadow-lg shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-emerald-600" />
              All Users
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell className="text-slate-600">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={user.role === 'admin' 
                          ? "bg-purple-100 text-purple-800 border-purple-200" 
                          : "bg-blue-100 text-blue-800 border-blue-200"}>
                          {user.role === 'admin' ? (
                            <><Shield className="w-3 h-3 mr-1" /> Admin</>
                          ) : (
                            <><UserIcon className="w-3 h-3 mr-1" /> Employee</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell className="text-slate-600">
                        {user.manager_email || 'No manager assigned'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Need to add team members?</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Invite new users through the Dashboard → Data → User section. They'll automatically be part of your company.
                </p>
                <p className="text-xs text-blue-600">
                  💡 Tip: You can update user details like department and manager directly in the data table.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}