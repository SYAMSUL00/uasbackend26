import express from 'express';
import { hitungMultiMetodeSPK } from '../controllers/spkController.js';

const router = express.Router();

// Endpoint POST /spk/hitung
router.post('/hitung', hitungMultiMetodeSPK);

export default router;