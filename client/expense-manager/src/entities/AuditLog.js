export const AuditLog = {
  name: "AuditLog",
  type: "object",
  properties: {
    log_id: {
      type: "string",
      description: "Unique identifier for the audit log (Primary Key)"
    },
    user_id: {
      type: "string",
      description: "User ID of user who performed action"
    },
    user_email: {
      type: "string",
      format: "email",
      description: "Email of user who performed action"
    },
    user_name: {
      type: "string",
      description: "Name of user"
    },
    action: {
      type: "string",
      description: "Action performed"
    },
    reference_id: {
      type: "string",
      description: "ID of related entity"
    },
    reference_type: {
      type: "string",
      enum: [
        "expense",
        "approval",
        "user",
        "company",
        "rule",
        "sequence"
      ],
      description: "Type of entity"
    },
    details: {
      type: "string",
      description: "Additional details"
    },
    ip_address: {
      type: "string",
      description: "IP address where action was performed"
    },
    user_agent: {
      type: "string",
      description: "User agent/browser information"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the audit log was created"
    }
  },
  required: [
    "log_id",
    "user_id",
    "action",
    "reference_type",
    "created_at"
  ]
};