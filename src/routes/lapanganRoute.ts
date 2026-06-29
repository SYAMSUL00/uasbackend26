import { Router } from 'express';
import { getAllLapangan, createLapangan, updateKriteriaTenant } from '../controllers/lapanganController.js';

const router = Router();

router.get('/', getAllLapangan);
router.post('/', createLapangan);
router.put('/kriteria', updateKriteriaTenant);

export default router;