import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Memperluas interface Request Express secara global agar mengenali properti req.user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

/**
 * 1. FUNGSI AUTHENTICATION (Cek Login & Validasi Token)
 * Berfungsi untuk memeriksa apakah request membawa token JWT yang valid di dalam Header.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Token tidak ditemukan, silakan login' });
    }

    // Mengambil token setelah kata 'Bearer ' (contoh: "Bearer eyJhbG...")
    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'Format token salah atau tidak ditemukan' });
    }

    try {
        const secret = process.env.JWT_SECRET || "saya_sangat_rahasia";
        const decoded = jwt.verify(token, secret) as any;
        
        // Menyimpan data hasil decode token (id, email, role) ke dalam object req.user
        req.user = decoded; 
        
        next(); // Lolos, lanjut ke middleware berikutnya/controller utama
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }
};

/**
 * 2. FUNGSI AUTHORIZATION: KHUSUS SUPER ADMIN
 * Mencegah user biasa atau tenant mengakses rute privat Super Admin (ex: kelola kriteria SPK, manajemen user).
 */
export const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
    // Memastikan user sudah melewati authMiddleware terlebih dahulu
    if (!req.user) {
        return res.status(401).json({ message: 'Akses tidak sah, silakan login terlebih dahulu' });
    }

    // Pengecekan nilai role dari token JWT
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Akses ditolak! Fitur ini hanya untuk Super Admin.' });
    }

    next(); // Lolos, user adalah SUPER_ADMIN
};

/**
 * 3. FUNGSI AUTHORIZATION: KHUSUS TENANT ADMIN (PEMILIK LAPANGAN)
 * Mencegah customer mengakses rute khusus milik lapangan (ex: kelola jam operasional, kelola data lapangan).
 */
export const tenantAdminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Akses tidak sah, silakan login terlebih dahulu' });
    }

    if (req.user.role !== 'TENANT_ADMIN') {
        return res.status(403).json({ message: 'Akses ditolak! Fitur ini hanya untuk Admin Tenant.' });
    }

    next(); // Lolos, user adalah TENANT_ADMIN
};

/**
 * 4. FUNGSI AUTHORIZATION: KHUSUS CUSTOMERS (PELANGGAN)
 * Memastikan rute hanya bisa dieksekusi oleh akun pelanggan biasa (ex: buat transaksi booking lapangan).
 */
export const customersOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Akses tidak sah, silakan login terlebih dahulu' });
    }

    if (req.user.role !== 'CUSTOMERS') {
        return res.status(403).json({ message: 'Akses ditolak! Fitur ini khusus untuk Customer.' });
    }

    next(); // Lolos, user adalah CUSTOMERS
};