// services/approvalService.js
import prisma from "../lib/prisma.js";
import approvalEngine from "./approvalEngine.js";

export async function getPending(userId) {
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

export async function decide(instanceStepId, userId, decision, comment) {
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

  // Update instance step status immediately
  await prisma.approvalInstanceStep.update({
    where: { id: instanceStepId },
    data: { status: decision },
  });

  // Evaluate rules (percentage / specific / hybrid)
  await approvalEngine.evaluate(instanceStepId);

  return decisionRecord;
}

export async function getInstance(expenseId) {
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

//export default { getPending, decide, getInstance };
