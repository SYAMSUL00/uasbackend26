import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

// Mengambil semua data lapangan olahraga
export const getAllLapangan = async (req: Request, res: Response) => {
    try {
        const lapangan = await prisma.lapangan.findMany({
            include: {
                tenant: true // Ikut menampilkan info tenant pemilik lapangan
            }
        });
        return res.status(200).json(lapangan);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data lapangan' });
    }
};

// Menambahkan lapangan baru di bawah tenant tertentu
export const createLapangan = async (req: Request, res: Response) => {
    const { tenantId, namaLapangan, hargaJam } = req.body;

    if (!tenantId || !namaLapangan || !hargaJam) {
        return res.status(400).json({ error: 'tenantId, namaLapangan, dan hargaJam harus diisi' });
    }

    try {
        // Validasi apakah tenant beneran terdaftar di db
        const tenantExist = await prisma.tenant.findUnique({ where: { id: Number(tenantId) } });
        if (!tenantExist) {
            return res.status(404).json({ error: 'Tenant tidak ditemukan' });
        }

        const newLapangan = await prisma.lapangan.create({
            data: {
                tenantId: Number(tenantId),
                namaLapangan,
                hargaJam: Number(hargaJam)
            }
        });

        return res.status(201).json(newLapangan);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menambahkan lapangan baru' });
    }
};