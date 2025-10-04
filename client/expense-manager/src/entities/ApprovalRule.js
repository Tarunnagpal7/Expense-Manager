export const ApprovalRule = {
  name: "ApprovalRule",
  type: "object",
  properties: {
    rule_id: {
      type: "string",
      description: "Unique identifier for the approval rule (Primary Key)"
    },
    company_id: {
      type: "string",
      description: "Reference to company"
    },
    rule_type: {
      type: "string",
      enum: [
        "amount_threshold",
        "category_based",
        "auto_approve",
        "manager_approval"
      ],
      description: "Type of rule"
    },
    threshold_amount: {
      type: "number",
      minimum: 0,
      description: "Amount threshold for rule activation"
    },
    category: {
      type: "string",
      description: "Category this rule applies to"
    },
    auto_approve_under: {
      type: "number",
      minimum: 0,
      description: "Auto-approve expenses under this amount"
    },
    requires_additional_approval: {
      type: "boolean",
      default: false,
      description: "Whether additional approval is needed"
    },
    description: {
      type: "string",
      description: "Rule description"
    },
    is_active: {
      type: "boolean",
      default: true,
      description: "Whether rule is active"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the rule was created"
    },
    updated_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the rule was last updated"
    }
  },
  required: [
    "rule_id",
    "company_id",
    "rule_type",
    "is_active",
    "created_at"
  ]
};