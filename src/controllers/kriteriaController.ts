import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

export const getAllKriteria = async (req: Request, res: Response) => {
    try {
        const kriteria = await prisma.kriteria.findMany();
        return res.status(200).json(kriteria);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data kriteria' });
    }
};

export const createKriteria = async (req: Request, res: Response) => {
    const { kode, nama, tipe, bobot } = req.body;

    if (!kode || !nama || !tipe || !bobot) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
        const kriteriaExist = await prisma.kriteria.findUnique({ where: { kode } });
        if (kriteriaExist) {
            return res.status(400).json({ error: 'Kode kriteria sudah ada' });
        }

        const newKriteria = await prisma.kriteria.create({
            data: {
                kode,
                nama,
                tipe,
                bobot: Number(bobot)
            }
        });

        return res.status(201).json(newKriteria);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal membuat kriteria' });
    }
};