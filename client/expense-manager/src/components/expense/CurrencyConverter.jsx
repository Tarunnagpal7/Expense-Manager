import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";

const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK'];

export default function CurrencyConverter({ amount, currency, targetCurrency, onAmountChange, onCurrencyChange }) {
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const convertCurrency = async () => {
      if (!amount || !currency || !targetCurrency || currency === targetCurrency) {
        setConvertedAmount(null);
        return;
      }

      setIsConverting(true);
      try {
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${currency}`);
        const data = await response.json();
        const converted = (parseFloat(amount) * data.rates[targetCurrency]).toFixed(2);
        setConvertedAmount(converted);
      } catch (error) {
        console.error("Error converting currency:", error);
      }
      setIsConverting(false);
    };

    convertCurrency();
  }, [amount, currency, targetCurrency]);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select value={currency} onValueChange={onCurrencyChange} required>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_CURRENCIES.map(curr => (
                <SelectItem key={curr} value={curr}>{curr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {convertedAmount && currency !== targetCurrency && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              {currency} {parseFloat(amount).toFixed(2)}
            </span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-emerald-700">
              {targetCurrency} {convertedAmount}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Converted to company currency
          </p>
        </div>
      )}
    </div>
  );
}