import express from 'express';
import { getAllTenantKriteriaValues, createTenantKriteriaValue, getMatriksKeputusan } from '../controllers/tenantKriteriaController.js';

const router = express.Router();

router.get('/', getAllTenantKriteriaValues);
router.post('/', createTenantKriteriaValue);
router.get('/setup', getMatriksKeputusan);

export default router;