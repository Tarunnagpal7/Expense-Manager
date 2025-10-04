export const Expense = {
  name: "Expense",
  type: "object",
  properties: {
    expense_id: {
      type: "string",
      description: "Unique identifier for the expense (Primary Key)"
    },
    company_id: {
      type: "string",
      description: "Reference to company"
    },
    user_id: {
      type: "string",
      description: "Reference to user who submitted the expense"
    },
    user_email: {
      type: "string",
      format: "email",
      description: "Email of employee who submitted"
    },
    user_name: {
      type: "string",
      description: "Name of employee"
    },
    amount_original: {
      type: "number",
      minimum: 0,
      description: "Original expense amount"
    },
    currency_original: {
      type: "string",
      description: "Original currency code"
    },
    amount_converted: {
      type: "number",
      minimum: 0,
      description: "Amount in company currency"
    },
    category: {
      type: "string",
      enum: [
        "Travel",
        "Meals",
        "Accommodation",
        "Transportation",
        "Office Supplies",
        "Software",
        "Client Entertainment",
        "Other"
      ],
      description: "Expense category"
    },
    description: {
      type: "string",
      description: "Expense description"
    },
    merchant_name: {
      type: "string",
      description: "Merchant/vendor name"
    },
    expense_date: {
      type: "string",
      format: "date",
      description: "Date of expense"
    },
    receipt_url: {
      type: "string",
      description: "Uploaded receipt URL"
    },
    status: {
      type: "string",
      enum: [
        "draft",
        "submitted",
        "in_review",
        "approved",
        "rejected",
        "paid"
      ],
      default: "draft",
      description: "Current status"
    },
    current_approval_step: {
      type: "number",
      minimum: 0,
      default: 0,
      description: "Current step in approval sequence"
    },
    final_approved_by: {
      type: "string",
      description: "User ID of final approver"
    },
    rejection_reason: {
      type: "string",
      description: "Reason for rejection if applicable"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the expense was created"
    },
    updated_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the expense was last updated"
    },
    submitted_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the expense was submitted for approval"
    }
  },
  required: [
    "expense_id",
    "company_id",
    "user_id",
    "amount_original",
    "currency_original",
    "category",
    "expense_date",
    "created_at"
  ]
};