import express from 'express';
import { getAllTenants, createTenant } from '../controllers/tenantController.js';

const router = express.Router();

// Endpoint untuk Tenant
router.get('/', getAllTenants);   // GET http://localhost:3000/tenants
router.post('/', createTenant); // POST http://localhost:3000/tenants

export default router;