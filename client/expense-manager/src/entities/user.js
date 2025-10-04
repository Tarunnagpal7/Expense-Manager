export const User = {
  name: "User",
  type: "object",
  properties: {
    user_id: {
      type: "string",
      description: "Unique identifier for the user (Primary Key)"
    },
    company_id: {
      type: "string",
      description: "Foreign key referencing the Company this user belongs to"
    },
    name: {
      type: "string",
      description: "Full name of the user"
    },
    email: {
      type: "string",
      format: "email",
      description: "Unique email address for the user"
    },
    password_hash: {
      type: "string",
      description: "Hashed password for authentication"
    },
    role: {
      type: "string",
      enum: ["admin", "manager", "employee"],
      description: "Role assigned to the user"
    },
    manager_id: {
      type: ["string", "null"],
      description: "Foreign key referencing the user's manager (nullable)"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the user record was created"
    },
    updated_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the user record was last updated"
    }
  },
  required: [
    "user_id",
    "company_id",
    "name",
    "email",
    "password_hash",
    "role",
    "created_at"
  ]
};
