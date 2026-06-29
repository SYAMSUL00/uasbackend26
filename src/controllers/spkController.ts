import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

export const hitungMultiMetodeSPK = async (req: Request, res: Response) => {
    const { weights: weightsRaw } = req.body; 
    
    // Validasi input awal
    if (!weightsRaw || !Array.isArray(weightsRaw)) {
        return res.status(400).json({ error: 'Bobot kriteria (weights) harus dikirim dalam bentuk array objek' });
    }

    try {
        // 1. Ambil data kriteria untuk tahu tipe (BENEFIT atau COST) dan kodenya
        const daftarKriteria = await prisma.kriteria.findMany();
        
        const kriteriaMeta = daftarKriteria.reduce((acc: any, k) => {
            acc[k.kode] = k.tipe.toUpperCase(); // 'BENEFIT' atau 'COST'
            return acc;
        }, {});

        // Transformasi array weights dari Postman menjadi objek Map kriteria kode:
        // Dari: [{ kriteriaId: 1, bobot: 35 }, { kriteriaId: 2, bobot: 25 }]
        // Menjadi: { "C1": 35, "C2": 25, "C3": 15, ... }
        const weights = daftarKriteria.reduce((acc: any, k) => {
            const match = weightsRaw.find((w: any) => Number(w.kriteriaId) === k.id);
            acc[k.kode] = match ? Number(match.bobot) : 0;
            return acc;
        }, {});

        // 2. Ambil data matriks keputusan (Alternatif Tenant beserta nilainya)
        const tenants = await prisma.tenant.findMany({
            include: {
                tenantCriteriaValues: {
                    include: { kriteria: true }
                }
            }
        });

        if (tenants.length === 0) {
            return res.status(400).json({ error: 'Data tenant/matriks masih kosong' });
        }

        // Susun data ke bentuk matriks objek agar mudah diolah rumusan matematika
        const matriksMentah = tenants.map(t => {
            const skor: any = {};
            t.tenantCriteriaValues.forEach(v => {
                skor[v.kriteria.kode] = Number(v.nilai);
            });
            return {
                tenantId: t.id,
                namaTenant: t.namaTenant,
                skor
            };
        });

        const kriteriaKodes = daftarKriteria.map(k => k.kode);

        // Cari nilai Max dan Min untuk setiap kriteria (berguna untuk normalisasi SAW & ideal TOPSIS)
        const nilaiEkstrem: any = {};
        kriteriaKodes.forEach(kode => {
            const semuaNilai = matriksMentah.map(m => m.skor[kode] || 0);
            nilaiEkstrem[kode] = {
                max: Math.max(...semuaNilai, 0.001),
                min: Math.min(...semuaNilai, 0.001)
            };
        });

        // ==========================================
        // PROSES 1: METODE SAW (Simple Additive Weighting)
        // ==========================================
        const hasilSaw = matriksMentah.map(m => {
            let totalSkor = 0;
            kriteriaKodes.forEach(kode => {
                const nilai = m.skor[kode] || 0;
                const bobot = weights[kode] || 0;
                let normalisasi = 0;

                if (kriteriaMeta[kode] === 'BENEFIT') {
                    normalisasi = nilai / nilaiEkstrem[kode].max;
                } else {
                    normalisasi = nilaiEkstrem[kode].min / (nilai || 0.001);
                }
                totalSkor += normalisasi * bobot;
            });
            return { tenantId: m.tenantId, namaTenant: m.namaTenant, skor: Number(totalSkor.toFixed(4)) };
        }).sort((a, b) => b.skor - a.skor);

        // ==========================================
        // PROSES 2: METODE WP (Weighted Product)
        // ==========================================
        const hasilWpSementaran = matriksMentah.map(m => {
            let vektorS = 1;
            kriteriaKodes.forEach(kode => {
                const nilai = m.skor[kode] || 0;
                const bobot = weights[kode] || 0;
                
                // Benefit pangkat positif, Cost pangkat negatif
                const pangkat = kriteriaMeta[kode] === 'BENEFIT' ? bobot : -bobot;
                vektorS *= Math.pow(nilai || 0.001, pangkat);
            });
            return { tenantId: m.tenantId, namaTenant: m.namaTenant, vektorS };
        });

        const totalVektorS = hasilWpSementaran.reduce((sum, item) => sum + item.vektorS, 0);
        const hasilWp = hasilWpSementaran.map(item => ({
            tenantId: item.tenantId,
            namaTenant: item.namaTenant,
            skor: Number((item.vektorS / (totalVektorS || 1)).toFixed(4))
        })).sort((a, b) => b.skor - a.skor);

        // ==========================================
        // PROSES 3: METODE TOPSIS
        // ==========================================
        // Pembagi Normalisasi Euclidian
        const pembagiTopsis: any = {};
        kriteriaKodes.forEach(kode => {
            const kuadratTotal = matriksMentah.reduce((sum, m) => sum + Math.pow(m.skor[kode] || 0, 2), 0);
            pembagiTopsis[kode] = Math.sqrt(kuadratTotal) || 1;
        });

        // Matriks Ternormalisasi Terbobot & Solusi Ideal
        const matriksTerbobot = matriksMentah.map(m => {
            const skorTerbobot: any = {};
            kriteriaKodes.forEach(kode => {
                const nilaiNormalisasi = (m.skor[kode] || 0) / pembagiTopsis[kode];
                skorTerbobot[kode] = nilaiNormalisasi * (weights[kode] || 0);
            });
            return { ...m, skorTerbobot };
        });

        const idealPositif: any = {};
        const idealNegatif: any = {};
        kriteriaKodes.forEach(kode => {
            const semuaTerbobot = matriksTerbobot.map(m => m.skorTerbobot[kode]);
            if (kriteriaMeta[kode] === 'BENEFIT') {
                idealPositif[kode] = Math.max(...semuaTerbobot);
                idealNegatif[kode] = Math.min(...semuaTerbobot);
            } else {
                idealPositif[kode] = Math.min(...semuaTerbobot);
                idealNegatif[kode] = Math.max(...semuaTerbobot);
            }
        });

        // Jarak Solusi & Nilai Preferensi Akhir
        const hasilTopsis = matriksTerbobot.map(m => {
            let jarakPositif = 0;
            let jarakNegatif = 0;

            kriteriaKodes.forEach(kode => {
                jarakPositif += Math.pow(m.skorTerbobot[kode] - idealPositif[kode], 2);
                jarakNegatif += Math.pow(m.skorTerbobot[kode] - idealNegatif[kode], 2);
            });

            const dPositif = Math.sqrt(jarakPositif);
            const dNegatif = Math.sqrt(jarakNegatif);
            const skorTopsis = dNegatif / ((dPositif + dNegatif) || 1);

            return {
                tenantId: m.tenantId,
                namaTenant: m.namaTenant,
                skor: Number(skorTopsis.toFixed(4))
            };
        }).sort((a, b) => b.skor - a.skor);

        // Kembalikan komparasi ketiga metode sekaligus ke Postman / Frontend
        return res.status(200).json({
            SAW: hasilSaw,
            WP: hasilWp,
            TOPSIS: hasilTopsis
        });

    } catch (error) {
        console.error("Detail Error Perhitungan SPK:", error);
        return res.status(500).json({ error: 'Gagal memproses perhitungan SPK' });
    }
};