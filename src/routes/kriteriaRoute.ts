import express from 'express';
import { getAllKriteria, createKriteria } from '../controllers/kriteriaController.js';

const router = express.Router();

// Endpoint untuk Kriteria
router.get('/', getAllKriteria);   // GET http://localhost:3000/kriteria
router.post('/', createKriteria); // POST http://localhost:3000/kriteria

export default router;