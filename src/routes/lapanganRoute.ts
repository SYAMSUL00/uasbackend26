import { Router } from 'express';
import { getAllLapangan, createLapangan, updateKriteriaTenant } from '../controllers/lapanganController.js';
// Ambil middleware pembatas hak akses
import { authMiddleware, tenantAdminOnly } from '../middlewares/authMiddleware.js';

const router = Router();

// Semua orang (bahkan yang belum login) biasanya boleh melihat daftar lapangan
router.get('/', getAllLapangan);

// HANYA Admin Tenant yang boleh mendaftarkan lapangan baru
router.post('/', authMiddleware, tenantAdminOnly, createLapangan);

// HANYA Admin Tenant yang boleh memperbarui kriteria lapangan miliknya
router.put('/kriteria', authMiddleware, tenantAdminOnly, updateKriteriaTenant);

export default router;