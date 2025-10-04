// services/approvalService.js
import prisma from "../config/db.js";

async function getPending(userId) {
  return prisma.approvalInstanceStep.findMany({
    where: {
      status: "PENDING",
      step: { approverUserId: userId },
    },
    include: {
      instance: {
        include: { expense: true },
      },
    },
  });
}

async function decide(instanceStepId, userId, decision, comment) {
  // Insert decision record
  const decisionRecord = await prisma.approvalStepDecision.create({
    data: {
      instanceStepId,
      approverId: userId,
      decision,
      comment,
      decidedAt: new Date(),
    },
  });

  // Update step status if majority/specific rules apply
  await evaluate(instanceStepId);

  return decisionRecord;
}

async function getInstance(expenseId) {
  return prisma.approvalInstance.findFirst({
    where: { expenseId },
    include: {
      stepsState: {
        include: {
          step: true,
          decisions: { include: { approver: true } },
        },
      },
    },
  });
}

async function evaluate(instanceStepId) {
  const step = await prisma.approvalInstanceStep.findUnique({
    where: { id: instanceStepId },
    include: {
      instance: { include: { flow: true, expense: true } },
      decisions: true,
      step: true,
    },
  });

  const { decisions, instance, step: flowStep } = step;
  const flow = instance.flow;

  // Specific approver rule
  if (flow.ruleType === "SPECIFIC" && flow.specificApproverId) {
    const approved = decisions.some(
      (d) =>
        d.approverId === flow.specificApproverId && d.decision === "APPROVED"
    );
    if (approved) {
      await prisma.expense.update({
        where: { id: instance.expenseId },
        data: { status: "APPROVED", resolvedAt: new Date() },
      });
      return;
    }
  }

  // Percentage rule
  if (flow.ruleType === "PERCENTAGE" && flow.percentageThreshold) {
    const approvals = decisions.filter((d) => d.decision === "APPROVED").length;
    const total = decisions.length;
    const percent = (approvals / total) * 100;

    if (percent >= flow.percentageThreshold) {
      await prisma.expense.update({
        where: { id: instance.expenseId },
        data: { status: "APPROVED", resolvedAt: new Date() },
      });
      return;
    }
  }

  // Hybrid = combine both checks
  if (flow.ruleType === "HYBRID") {
    // apply specific + percentage
    // (implement similar logic as above combined)
  }
}

export default { getPending, decide };
