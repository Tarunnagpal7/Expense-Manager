import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Company } from "@/entities/Company";
import { User } from "@/entities/User";
import { ApprovalSequence } from "@/entities/ApprovalSequence";
import { Building2, Globe, DollarSign, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanySetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    currency: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const data = await response.json();
      const countryList = data.map(country => ({
        name: country.name.common,
        currencies: country.currencies ? Object.keys(country.currencies) : []
      })).sort((a, b) => a.name.localeCompare(b.name));
      setCountries(countryList);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const getCurrencySymbol = (code) => {
    const symbols = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CNY': '¥',
      'INR': '₹', 'AUD': 'A$', 'CAD': 'C$', 'CHF': 'Fr', 'SEK': 'kr'
    };
    return symbols[code] || code;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      
      const company = await Company.create({
        ...formData,
        currency_symbol: getCurrencySymbol(formData.currency),
        admin_email: user.email
      });

      await User.updateMyUserData({
        company_id: company.id
      });

      await ApprovalSequence.create({
        company_id: company.id,
        sequence_order: 1,
        role: 'admin',
        is_mandatory: true,
        description: 'Admin approval required'
      });

      onComplete();
    } catch (error) {
      console.error("Error creating company:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-none shadow-2xl">
          <CardHeader className="text-center pb-6 border-b">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-900">
              Welcome to ExpenseFlow
            </CardTitle>
            <p className="text-slate-600 mt-2">Let's set up your company in 3 simple steps</p>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                    step >= s 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' 
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-600 mb-4">
                  <Building2 className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Company Information</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    placeholder="Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12"
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-600 mb-4">
                  <Globe className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Location</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData({...formData, country: value, currency: ''})}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {countries.map((country) => (
                        <SelectItem key={country.name} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-600 mb-4">
                  <DollarSign className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Currency</h3>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({...formData, currency: value})}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.country && countries
                        .find(c => c.name === formData.country)
                        ?.currencies.map(curr => (
                          <SelectItem key={curr} value={curr}>
                            {curr} ({getCurrencySymbol(curr)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between p-8 border-t">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !formData.name) ||
                  (step === 2 && !formData.country)
                }
                className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!formData.currency || isLoading}
                className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isLoading ? 'Creating...' : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Setup
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}