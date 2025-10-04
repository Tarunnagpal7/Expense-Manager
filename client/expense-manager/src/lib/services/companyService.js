// services/companyService.js
import apiReq from "../apireq";

export const companyService = {
  // Get company by ID
  async getCompany(id) {
    try {
      const response = await apiReq.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all companies
  async getAllCompanies() {
    try {
      const response = await apiReq.get("/companies");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new company
  async createCompany(companyData) {
    try {
      const response = await apiReq.post("/companies", companyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update company
  async updateCompany(id, companyData) {
    try {
      const response = await apiReq.put(`/companies/${id}`, companyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete company
  async deleteCompany(id) {
    try {
      const response = await apiReq.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Filter companies (for backward compatibility)
  async filterCompanies(filters) {
    try {
      const response = await apiReq.get("/companies", { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
