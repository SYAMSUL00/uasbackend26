import express from 'express';
import { getAllKriteria, createKriteria } from '../controllers/kriteriaController.js';
// Ambil middleware pembatas hak akses
import { authMiddleware, superAdminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Siapa saja yang sudah login boleh melihat list kriteria
router.get('/', authMiddleware, getAllKriteria);

// HANYA Super Admin yang boleh membuat kriteria baru
router.post('/', authMiddleware, superAdminOnly, createKriteria);

export default router;