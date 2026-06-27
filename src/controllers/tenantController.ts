import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

export const getAllTenants = async (req: Request, res: Response) => {
    try {
        const tenants = await prisma.tenant.findMany({
            include: {
                lapangan: true
            }
        });
        return res.status(200).json(tenants);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data tenant' });
    }
};

export const createTenant = async (req: Request, res: Response) => {
    const { userId, namaTenant, alamat } = req.body;

    if (!userId || !namaTenant || !alamat) {
        return res.status(400).json({ error: 'userId, namaTenant, dan alamat harus diisi' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        const newTenant = await prisma.tenant.create({
            data: {
                userId: Number(userId),
                namaTenant,
                alamat
            }
        });

        return res.status(201).json({ message: 'Tenant berhasil dibuat', data: newTenant });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal membuat tenant baru' });
    }
};