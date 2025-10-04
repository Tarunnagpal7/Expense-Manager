// src/utils.js

// Define your application routes in one place
const routes = {
  Dashboard: "/dashboard",
  SubmitExpense: "/submit-expense",
  ManageUsers: "/manage-users",
  ApprovalSettings: "/approval-settings",
  CompanySettings: "/company-settings",
  Login: "/login",
  Signup: "/signup",
};

/**
 * Utility function to return the correct route path.
 * @param {string} pageName - Key from routes object
 * @param {Object} params - Optional params for dynamic routes
 * @returns {string} URL string
 */
export function createPageUrl(pageName, params = {}) {
  let url = routes[pageName];

  if (!url) {
    console.warn(`No route found for page: ${pageName}`);
    return "/";
  }

  // Replace dynamic placeholders (if any)
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });

  return url;
}
