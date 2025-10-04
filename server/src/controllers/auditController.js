import prisma from '../lib/prisma.js';
import axios from 'axios';

/**
 * GET /api/audit-logs
 * Get all audit logs for the company
 */
const getAuditLogs = async (req, res) => {
    try {
        const logs = await prisma.auditLog.findMany({
            where: { companyId: req.user.companyId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

/**
 * GET /api/audit-logs/:id
 * Get a single audit log by ID
 */
const getAuditLogById = async (req, res) => {
    try {
        const { id } = req.params;
        const log = await prisma.auditLog.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!log) return res.status(404).json({ error: 'Audit log not found' });
        res.json(log);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch audit log' });
    }
};

/**
 * GET /api/config
 * Returns basic config (can include company info, roles, etc.)
 */
const getConfig = async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: { id: req.user.companyId },
            select: { id: true, name: true, currency: true, country: true },
        });

        res.json({
            company,
            roles: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
            expenseStatuses: ['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID'],
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch config' });
    }
};


export {
    getConfig,
    getAuditLogs,
    getAuditLogById
}