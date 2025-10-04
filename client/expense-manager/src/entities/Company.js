export const Company = {
  name: "Company",
  type: "object",
  properties: {
    company_id: {
      type: "string",
      description: "Unique identifier for the company (Primary Key)"
    },
    name: {
      type: "string",
      description: "Company name"
    },
    country: {
      type: "string",
      description: "Company country"
    },
    default_currency: {
      type: "string",
      description: "Company default currency code (e.g., USD, EUR)"
    },
    currency_symbol: {
      type: "string",
      description: "Currency symbol (e.g., $, €)"
    },
    admin_email: {
      type: "string",
      format: "email",
      description: "Primary admin email"
    },
    created_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the company record was created"
    },
    updated_at: {
      type: "string",
      format: "date-time",
      description: "Timestamp when the company record was last updated"
    }
  },
  required: [
    "company_id",
    "name",
    "country",
    "default_currency",
    "admin_email",
    "created_at"
  ]
};