import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

// 1. Mengambil semua data lapangan olahraga beserta tenantnya
export const getAllLapangan = async (req: Request, res: Response) => {
    try {
        const lapangan = await prisma.lapangan.findMany({
            include: {
                tenant: true 
            }
        });
        return res.status(200).json(lapangan);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data lapangan' });
    }
};

// 2. Menambahkan lapangan baru sekaligus mengisi nilai kriteria tenant ke database
export const createLapangan = async (req: Request, res: Response) => {
    const { 
        tenantId, 
        namaLapangan, 
        hargaJam, 
        jarak, 
        fasilitas, 
        rating, 
        fleksibilitas 
    } = req.body;

    if (!tenantId || !namaLapangan || !hargaJam) {
        return res.status(400).json({ error: 'tenantId, namaLapangan, dan hargaJam harus diisi' });
    }

    try {
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

        const kriteriaMapping = [
            { kriteriaId: 1, nilai: hargaJam },
            { kriteriaId: 2, nilai: jarak },
            { kriteriaId: 3, nilai: fasilitas },
            { kriteriaId: 4, nilai: rating },
            { kriteriaId: 5, nilai: fleksibilitas }
        ];

        for (const item of kriteriaMapping) {
            if (item.nilai !== undefined && item.nilai !== null) {
                await prisma.tenantKriteriaValue.create({
                    data: {
                        tenantId: Number(tenantId),
                        kriteriaId: item.kriteriaId,
                        // Prisma otomatis mengonversi string angka ini menjadi @db.Decimal di MySQL
                        nilai: item.nilai.toString()
                    }
                });
            }
        }

        return res.status(201).json({
            message: 'Lapangan dan kriteria nilai tenant berhasil disimpan!',
            lapangan: newLapangan
        });

    } catch (error) {
        console.error("Detail Error Prisma:", error);
        return res.status(500).json({ error: 'Gagal menambahkan lapangan baru beserta kriteria' });
    }
};

// 3. Memperbarui nilai kriteria suatu Tenant secara spesifik lewat Postman
export const updateKriteriaTenant = async (req: Request, res: Response) => {
    const { tenantId, kriteriaId, nilai } = req.body;

    if (!tenantId || !kriteriaId || nilai === undefined) {
        return res.status(400).json({ error: 'tenantId, kriteriaId, dan nilai harus diisi' });
    }

    try {
        const existingValue = await prisma.tenantKriteriaValue.findFirst({
            where: {
                tenantId: Number(tenantId),
                kriteriaId: Number(kriteriaId)
            }
        });

        let result;
        const stringNilai = nilai.toString();

        if (existingValue) {
            result = await prisma.tenantKriteriaValue.update({
                where: { id: existingValue.id },
                data: { nilai: stringNilai }
            });
        } else {
            result = await prisma.tenantKriteriaValue.create({
                data: {
                    tenantId: Number(tenantId),
                    kriteriaId: Number(kriteriaId),
                    nilai: stringNilai
                }
            });
        }

        return res.status(200).json({ message: 'Nilai kriteria berhasil diperbarui', data: result });
    } catch (error) {
        console.error("Detail Error Update Kriteria:", error);
        return res.status(500).json({ error: 'Gagal memperbarui kriteria' });
    }
};