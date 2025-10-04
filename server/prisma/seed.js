// prisma/seed.js
import prisma from "../src/lib/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  // 1. Create Company
  const company = await prisma.company.create({
    data: {
      name: "Hackathon Inc",
      country: "IN",
      currency: "INR",
    },
  });
  console.log("✅ Company created:", company.id);

  // 2. Create Users
  const passwordHash = await bcrypt.hash("password123", 10);

  const manager = await prisma.user.create({
    data: {
      name: "Alice Manager",
      email: "manager@hackathon.com",
      passwordHash,
      role: "MANAGER",
      companyId: company.id,
    },
  });

  const cfo = await prisma.user.create({
    data: {
      name: "Bob CFO",
      email: "cfo@hackathon.com",
      passwordHash,
      role: "ADMIN",
      companyId: company.id,
    },
  });

  const employee = await prisma.user.create({
    data: {
      name: "Eve Employee",
      email: "employee@hackathon.com",
      passwordHash,
      role: "EMPLOYEE",
      companyId: company.id,
      managerId: manager.id,
    },
  });

  console.log("✅ Users created:", {
    manager: manager.id,
    cfo: cfo.id,
    employee: employee.id,
  });

  // 3. Create Approval Flow (Manager → CFO)
  const flow = await prisma.approvalFlow.create({
    data: {
      companyId: company.id,
      name: "Manager then CFO",
      description: "Manager approves first, then CFO",
      ruleType: "SPECIFIC",
      isDefault: true,
    },
  });

  // Add Steps
  await prisma.approvalStep.create({
    data: {
      flowId: flow.id,
      approverUserId: manager.id,
      stepOrder: 1,
    },
  });

  await prisma.approvalStep.create({
    data: {
      flowId: flow.id,
      approverUserId: cfo.id,
      stepOrder: 2,
    },
  });

  console.log("✅ Approval Flow created:", flow.id);

  // 4. Create Draft Expense
  const expense = await prisma.expense.create({
    data: {
      companyId: company.id,
      createdById: employee.id,
      title: "Team Lunch",
      description: "Lunch with project team",
      category: "food",
      dateOfExpense: new Date(),
      amountOriginal: 2500,
      currencyOriginal: "INR",
      status: "DRAFT",
    },
  });

  console.log("✅ Draft Expense created:", expense.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
