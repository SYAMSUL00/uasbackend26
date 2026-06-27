import express from 'express';
import { createKriteriaValue, createRekomendasiRequest } from '../controllers/kriteriaValueController.js';

const router = express.Router();

router.post('/sub-kriteria', createKriteriaValue);
router.post('/request', createRekomendasiRequest);

export default router;