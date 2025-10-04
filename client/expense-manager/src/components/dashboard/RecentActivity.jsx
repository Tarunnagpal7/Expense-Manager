import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity } from "lucide-react";

export default function RecentActivity({ activities }) {
  return (
    <Card className="border-none shadow-lg shadow-slate-200/50">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-600 mt-1">{activity.user_name}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(activity.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-slate-500">No recent activity</p>
        )}
      </CardContent>
    </Card>
  );
}