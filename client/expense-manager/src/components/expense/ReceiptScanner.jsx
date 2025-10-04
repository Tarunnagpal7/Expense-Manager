import React, { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ReceiptScanner({ onScan, isScanning, receiptUrl }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onScan(file);
    }
  };

  return (
    <Card className="border-none shadow-lg shadow-slate-200/50">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Smart Receipt Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {!receiptUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-all duration-200 cursor-pointer bg-slate-50 hover:bg-emerald-50"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Upload Receipt</h3>
            <p className="text-sm text-slate-600 mb-4">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-slate-400">
              PDF, PNG, JPG up to 10MB
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500">
              {receiptUrl.endsWith('.pdf') ? (
                <div className="bg-slate-100 p-8 text-center">
                  <p className="text-slate-600 font-medium">PDF Receipt Uploaded</p>
                </div>
              ) : (
                <img src={receiptUrl} alt="Receipt" className="w-full" />
              )}
              <div className="absolute top-2 right-2 bg-emerald-500 text-white p-2 rounded-lg shadow-lg">
                <Check className="w-4 h-4" />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              Change Receipt
            </Button>
          </motion.div>
        )}

        {isScanning && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl">
            <div className="flex items-center gap-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
              <span className="text-sm font-medium">Scanning receipt...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}