import prisma from "../lib/prisma.js";

// Get all approval flows for a company
export const getApprovalFlows = async (req, res) => {
  try {
    const flows = await prisma.approvalFlow.findMany({
      include: { steps: true },
    });
    res.json(flows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one flow
export const getApprovalFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await prisma.approvalFlow.findUnique({
      where: { id },
      include: { steps: true },
    });
    if (!flow) return res.status(404).json({ error: "Flow not found" });
    res.json(flow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a flow
export const createApprovalFlow = async (req, res) => {
  try {
    const {
      companyId,
      name,
      description,
      ruleType,
      percentageThreshold,
      specificApproverId,
      isDefault,
    } = req.body;
    const flow = await prisma.approvalFlow.create({
      data: {
        companyId,
        name,
        description,
        ruleType,
        percentageThreshold,
        specificApproverId,
        isDefault,
      },
    });
    res.status(201).json(flow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a flow
export const updateApprovalFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const flow = await prisma.approvalFlow.update({
      where: { id },
      data: req.body,
    });
    res.json(flow);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a flow
export const deleteApprovalFlow = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.approvalFlow.delete({ where: { id } });
    res.json({ message: "Approval flow deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- Steps Management ---------------- //

// Add step to a flow
export const addStepToFlow = async (req, res) => {
  try {
    const { id } = req.params; // flowId
    const { approverUserId, approverRole, stepOrder } = req.body;
    const step = await prisma.approvalStep.create({
      data: {
        flowId: id,
        approverUserId,
        approverRole,
        stepOrder,
      },
    });
    res.status(201).json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update step
export const updateStep = async (req, res) => {
  try {
    const { id } = req.params;
    const step = await prisma.approvalStep.update({
      where: { id },
      data: req.body,
    });
    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete step
export const deleteStep = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.approvalStep.delete({ where: { id } });
    res.json({ message: "Step deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
