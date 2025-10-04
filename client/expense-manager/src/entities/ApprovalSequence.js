export const ApprovalSequence = {
  name: "ApprovalSequence",
  type: "object",
  properties: {
    sequence_id: {
      type: "string",
      description: "Unique identifier for the approval sequence (Primary Key)"
    },
    company_id: {
      type: "string",
      description: "Reference to company"
    },
    sequence_order: {
      type: "number",
      minimum: 1,
      description: "Order in sequence (1, 2, 3...)"
    },
    role: {
      type: "string",
      enum: [
        "manager",
        "admin",
        "finance"
      ],
      description: "Role required for this step"
    },
    is_mandatory: {
      type: "boolean",
      default: true,
      description: "Whether this step is mandatory"
    },
    specific_user_id: {
      type: "string",
      description: "If set, only this specific user can approve"
    },
    description: {
      type: "string",
      description: "Description of approval step"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the sequence was created"
    },
    updated_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the sequence was last updated"
    }
  },
  required: [
    "sequence_id",
    "company_id",
    "sequence_order",
    "role",
    "created_at"
  ]
};