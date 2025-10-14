import React, { useState, useEffect } from 'react';
import { authService } from "@/lib/services/authService";
import { approvalFlowService } from "@/lib/services/approvalFlowService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, GitBranch, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ApprovalSettings() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [flow, setFlow] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [rules, setRules] = useState([]);
  const [newSequence, setNewSequence] = useState({
    sequence_order: '',
    role: 'manager',
    is_mandatory: true,
    description: ''
  });

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
        // Load or create default approval flow for this company
        const allFlows = await approvalFlowService.listFlows();
        const companyFlows = (allFlows || []).filter(f => f.companyId === userData.company.id);
        let selectedFlow = companyFlows.find(f => f.isDefault) || companyFlows[0] || null;

        if (!selectedFlow) {
          selectedFlow = await approvalFlowService.createFlow({
            companyId: userData.company.id,
            name: "Default Flow",
            description: "Auto-created default approval flow",
            ruleType: "PERCENTAGE",
            percentageThreshold: 0,
            isDefault: true,
          });
        }

        // Ensure we have latest with steps included
        const flowWithSteps = await approvalFlowService.getFlow(selectedFlow.id);
        setFlow(flowWithSteps);

        const orderedSteps = (flowWithSteps.steps || [])
          .slice()
          .sort((a, b) => a.stepOrder - b.stepOrder);

        setSequences(orderedSteps.map(s => ({
          id: s.id,
          sequence_order: s.stepOrder,
          role: (s.approverRole || '').toLowerCase(),
          description: '',
        })));

        // Display basic rule info from flow
        setRules([
          {
            id: flowWithSteps.id,
            rule_type: flowWithSteps.ruleType,
            description:
              flowWithSteps.ruleType === 'PERCENTAGE'
                ? `Requires approval chain based on amount threshold (${flowWithSteps.percentageThreshold ?? 0}%).`
                : flowWithSteps.ruleType === 'SPECIFIC'
                ? 'Routes to a specific approver before continuing.'
                : 'Hybrid rule combining specific approver and percentage checks.',
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading approval settings:", error);
    }
  };

  const handleAddSequence = async () => {
    if (!newSequence.sequence_order || !company || !flow) return;

    const approverRole = newSequence.role === 'manager' ? 'MANAGER' : 'ADMIN';
    await approvalFlowService.addStep(flow.id, {
      approverRole,
      stepOrder: parseInt(newSequence.sequence_order, 10),
    });

    setNewSequence({
      sequence_order: '',
      role: 'manager',
      is_mandatory: true,
      description: ''
    });

    loadData();
  };

  const handleDeleteSequence = async (id) => {
    await approvalFlowService.deleteStep(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Approval Settings</h1>
          <p className="text-slate-600">Configure multi-level approval workflows</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-emerald-600" />
                Approval Sequence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                {sequences.map((seq) => (
                  <div key={seq.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-100 text-emerald-800">Step {seq.sequence_order}</Badge>
                        <Badge variant="outline">{seq.role}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{seq.description || 'No description'}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSequence(seq.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-slate-900">Add New Step</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Step Order</Label>
                    <Input
                      type="number"
                      value={newSequence.sequence_order}
                      onChange={(e) => setNewSequence({...newSequence, sequence_order: e.target.value})}
                      placeholder="1, 2, 3..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={newSequence.role}
                      onValueChange={(value) => setNewSequence({...newSequence, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={newSequence.description}
                    onChange={(e) => setNewSequence({...newSequence, description: e.target.value})}
                    placeholder="e.g., Manager approval required"
                  />
                </div>
                <Button
                  onClick={handleAddSequence}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg shadow-slate-200/50">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Approval Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {rules.length > 0 ? (
                  rules.map((rule) => (
                    <div key={rule.id} className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <Badge className="bg-purple-100 text-purple-800 mb-2">{rule.rule_type}</Badge>
                      <p className="text-sm text-slate-700">{rule.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-8 text-slate-500">No custom rules configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">How Approval Works</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Expenses flow through the approval sequence you define. Each step must be completed before moving to the next.
                </p>
                <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                  <li>Manager steps route to the employee's assigned manager</li>
                  <li>Admin steps route to the company administrator</li>
                  <li>Once all steps are approved, the expense is marked as approved</li>
                  <li>If any step is rejected, the expense is immediately rejected</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}