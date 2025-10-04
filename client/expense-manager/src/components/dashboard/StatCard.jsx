import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const colorSchemes = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600"
  },
  green: {
    bg: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-600"
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600"
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-50",
    text: "text-purple-600"
  }
};

export default function StatCard({ title, value, icon: Icon, color = "blue" }) {
  const scheme = colorSchemes[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-none shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 ${scheme.bg} rounded-full opacity-5 transform translate-x-12 -translate-y-12`} />
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${scheme.light}`}>
              <Icon className={`w-6 h-6 ${scheme.text}`} />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}