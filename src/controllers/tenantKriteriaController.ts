import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

// Mengambil seluruh isi matriks keputusan secara mentah
export const getAllTenantKriteriaValues = async (req: Request, res: Response) => {
    try {
        const values = await prisma.tenantKriteriaValue.findMany({ 
            include: { tenant: true, kriteria: true } 
        });
        return res.status(200).json(values);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data matriks keputusan' });
    }
};

// Mengisi/input nilai kriteria untuk tenant (Input Matriks via Postman)
export const createTenantKriteriaValue = async (req: Request, res: Response) => {
    const { tenantId, kriteriaId, nilai } = req.body;
    if (!tenantId || !kriteriaId || nilai === undefined) {
        return res.status(400).json({ error: 'tenantId, kriteriaId, dan nilai harus diisi' });
    }
    try {
        const tenantExist = await prisma.tenant.findUnique({ where: { id: Number(tenantId) } });
        const kriteriaExist = await prisma.kriteria.findUnique({ where: { id: Number(kriteriaId) } });
        if (!tenantExist || !kriteriaExist) {
            return res.status(404).json({ error: 'Tenant atau Kriteria tidak ditemukan' });
        }

        const newMatriksValue = await prisma.tenantKriteriaValue.create({
            data: { tenantId: Number(tenantId), kriteriaId: Number(kriteriaId), nilai: Number(nilai) }
        });
        return res.status(201).json(newMatriksValue);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menyimpan nilai matriks kriteria' });
    }
};

// Fungsi Baru: Mengambil data matriks yang sudah rapi dikelompokkan per tenant untuk kesiapan rumus
export const getMatriksKeputusan = async (req: Request, res: Response) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: { 
                tenantCriteriaValues: { 
                    include: { kriteria: true } 
                } 
            }
        });

        // Merapikan struktur data objek agar siap dihitung oleh algoritma SAW/AHP
        const matriks = tenants.map(t => ({
            tenantId: t.id,
            namaTenant: t.namaTenant,
            skorKriteria: t.tenantCriteriaValues.map(v => ({ 
                kodeKriteria: v.kriteria.kode, 
                nilai: v.nilai 
            }))
        }));

        return res.status(200).json(matriks);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menyusun matriks keputusan' });
    }
};