import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

// Input pilihan sub-kriteria (Contoh: Sangat Mudah = 1.0)
export const createKriteriaValue = async (req: Request, res: Response) => {
    const { kriteriaId, value } = req.body;
    if (!kriteriaId || value === undefined) {
        return res.status(400).json({ error: 'kriteriaId dan value harus diisi' });
    }
    try {
        const newValue = await prisma.kriteriaValue.create({
            data: { kriteriaId: Number(kriteriaId), value: Number(value) }
        });
        return res.status(201).json(newValue);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal membuat kriteria value' });
    }
};

// Input Request Rekomendasi + Bobot Dinamis dari User
export const createRekomendasiRequest = async (req: Request, res: Response) => {
    const { userId, tempat, weights } = req.body; 
    // weights berbentuk array contoh: [{"kriteriaId": 1, "bobot": 25}, {"kriteriaId": 2, "bobot": 15}]

    if (!userId || !tempat || !weights || !Array.isArray(weights)) {
        return res.status(400).json({ error: 'userId, tempat, dan weights array harus diisi' });
    }

    try {
        // Simpan request utama dan bobotnya sekaligus (Prisma Nested Writes)
        const newRequest = await prisma.rekomendasiRequest.create({
            data: {
                userId: Number(userId),
                tempat,
                rekomendasiRequestWeights: {
                    create: weights.map((w: any) => ({
                        kriteriaId: Number(w.kriteriaId),
                        bobot: Number(w.bobot)
                    }))
                }
            },
            include: {
                rekomendasiRequestWeights: true
            }
        });
        return res.status(201).json(newRequest);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menyimpan request rekomendasi' });
    }
};