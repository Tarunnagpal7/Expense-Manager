import React, { useState, useEffect } from 'react';
import { authService } from "@/lib/services/authService";
import { companyService } from "@/lib/services/companyService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Save, Globe, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CompanySettings() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    default_currency: '',
    currency_symbol: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.user;
      setUser(userData);

      if (userData.company) {
        setCompany(userData.company);
        setFormData({
          name: userData.company.name,
          country: userData.company.country,
          default_currency: userData.company.currency,
          currency_symbol: userData.company.currency
        });
      }
    } catch (error) {
      console.error("Error loading company settings:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await Company.update(company.id, formData);
      loadData();
    } catch (error) {
      console.error("Error updating company:", error);
    }

    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Company Settings</h1>
          <p className="text-slate-600">Manage your company information</p>
        </div>

        <Card className="border-none shadow-lg shadow-slate-200/50">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-12"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="country">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Default Currency
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="currency"
                      value={formData.default_currency}
                      onChange={(e) => setFormData({...formData, default_currency: e.target.value})}
                      placeholder="USD"
                      className="h-12"
                    />
                    <Input
                      value={formData.currency_symbol}
                      onChange={(e) => setFormData({...formData, currency_symbol: e.target.value})}
                      placeholder="$"
                      className="h-12 w-20"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 h-12"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {company && (
          <Card className="mt-6 border-none shadow-lg shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg">Company Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Company ID</p>
                  <p className="font-mono text-sm text-slate-900">{company.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Created</p>
                  <p className="text-sm text-slate-900">
                    {new Date(company.created_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Admin</p>
                  <p className="text-sm text-slate-900">{company.admin_email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}