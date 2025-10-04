// services/approvalEngine.js
import prisma from "../lib/prisma.js";

async function evaluate(instanceStepId) {
  const stepState = await prisma.approvalInstanceStep.findUnique({
    where: { id: instanceStepId },
    include: {
      instance: {
        include: {
          flow: true,
          expense: true,
          stepsState: true,
        },
      },
      decisions: true,
      step: true,
    },
  });

  const { decisions, instance, step } = stepState;
  const flow = instance.flow;

  // ✅ Rule evaluation (specific, percentage, hybrid)
  const finalApproved = await checkRules(flow, decisions);

  if (finalApproved === "APPROVED") {
    await prisma.expense.update({
      where: { id: instance.expenseId },
      data: { status: "APPROVED", resolvedAt: new Date() },
    });

    await prisma.approvalInstance.update({
      where: { id: instance.id },
      data: { overallStatus: "APPROVED" },
    });
    return;
  }

  if (finalApproved === "REJECTED") {
    await prisma.expense.update({
      where: { id: instance.expenseId },
      data: { status: "REJECTED", resolvedAt: new Date() },
    });

    await prisma.approvalInstance.update({
      where: { id: instance.id },
      data: { overallStatus: "REJECTED" },
    });
    return;
  }

  // ✅ Move to next step if current is completed
  const allDecided = decisions.every((d) => d.decision !== "PENDING");

  if (allDecided) {
    // Mark this step as resolved
    await prisma.approvalInstanceStep.update({
      where: { id: stepState.id },
      data: { status: "APPROVED" },
    });

    // Find next step in the flow
    const nextStepOrder = step.stepOrder + 1;
    const nextStep = instance.stepsState.find(
      (s) => s.stepOrder === nextStepOrder
    );

    if (nextStep) {
      // Update instance current step order
      await prisma.approvalInstance.update({
        where: { id: instance.id },
        data: { currentStepOrder: nextStepOrder },
      });

      // Mark next step as pending
      await prisma.approvalInstanceStep.update({
        where: { id: nextStep.id },
        data: { status: "PENDING" },
      });
    } else {
      // No more steps → mark expense as APPROVED
      await prisma.expense.update({
        where: { id: instance.expenseId },
        data: { status: "APPROVED", resolvedAt: new Date() },
      });

      await prisma.approvalInstance.update({
        where: { id: instance.id },
        data: { overallStatus: "APPROVED" },
      });
    }
  }
}

// 🔧 Helper function for rule checks
async function checkRules(flow, decisions) {
  // Specific approver
  if (flow.ruleType === "SPECIFIC" && flow.specificApproverId) {
    const approved = decisions.some(
      (d) =>
        d.approverId === flow.specificApproverId && d.decision === "APPROVED"
    );
    if (approved) return "APPROVED";
  }

  // Percentage rule
  if (flow.ruleType === "PERCENTAGE" && flow.percentageThreshold) {
    const approvals = decisions.filter((d) => d.decision === "APPROVED").length;
    const percent = (approvals / decisions.length) * 100;
    if (percent >= flow.percentageThreshold) return "APPROVED";
  }

  // Hybrid rule
  if (flow.ruleType === "HYBRID") {
    const approvedBySpecific = decisions.some(
      (d) =>
        d.approverId === flow.specificApproverId && d.decision === "APPROVED"
    );
    const approvals = decisions.filter((d) => d.decision === "APPROVED").length;
    const percent = (approvals / decisions.length) * 100;

    if (approvedBySpecific || percent >= flow.percentageThreshold) {
      return "APPROVED";
    }
  }

  // Rejection check
  if (decisions.some((d) => d.decision === "REJECTED")) {
    return "REJECTED";
  }

  return null; // Still pending
}

export default { evaluate };
