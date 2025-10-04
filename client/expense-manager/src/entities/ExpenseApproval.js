export const ExpenseApproval = {
  name: "ExpenseApproval",
  type: "object",
  properties: {
    approval_id: {
      type: "string",
      description: "Unique identifier for the approval record (Primary Key)"
    },
    expense_id: {
      type: "string",
      description: "Reference to expense"
    },
    approver_user_id: {
      type: "string",
      description: "User ID of approver"
    },
    approver_email: {
      type: "string",
      format: "email",
      description: "Email of approver"
    },
    approver_name: {
      type: "string",
      description: "Name of approver"
    },
    sequence_order: {
      type: "number",
      minimum: 1,
      description: "Order in approval sequence"
    },
    status: {
      type: "string",
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ],
      default: "pending",
      description: "Approval status"
    },
    comments: {
      type: "string",
      description: "Approver comments"
    },
    actioned_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp of approval/rejection"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the approval record was created"
    },
    updated_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the approval record was last updated"
    }
  },
  required: [
    "approval_id",
    "expense_id",
    "approver_user_id",
    "sequence_order",
    "status",
    "created_at"
  ]
};