import { prisma } from "../lib/prisma.js";

export const companyController = {
  // Get all companies
  async getAllCompanies(req, res) {
    try {
      const companies = await prisma.company.findMany({
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  },

  // Get company by ID
  async getCompanyById(req, res) {
    try {
      const { id } = req.params;
      const company = await prisma.company.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });

      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ error: "Failed to fetch company" });
    }
  },

  // Create new company
  async createCompany(req, res) {
    try {
      const { name, country, currency } = req.body;

      const company = await prisma.company.create({
        data: {
          name,
          country,
          currency,
        },
      });

      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ error: "Failed to create company" });
    }
  },

  // Update company
  async updateCompany(req, res) {
    try {
      const { id } = req.params;
      const { name, country, currency } = req.body;

      const company = await prisma.company.update({
        where: { id },
        data: {
          name,
          country,
          currency,
        },
      });

      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ error: "Failed to update company" });
    }
  },

  // Delete company
  async deleteCompany(req, res) {
    try {
      const { id } = req.params;

      await prisma.company.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting company:", error);
      res.status(500).json({ error: "Failed to delete company" });
    }
  },
};
