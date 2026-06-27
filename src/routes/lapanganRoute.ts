import express from 'express';
import { getAllLapangan, createLapangan } from '../controllers/lapanganController.js';

const router = express.Router();

router.get('/', getAllLapangan);
router.post('/', createLapangan);

export default router;