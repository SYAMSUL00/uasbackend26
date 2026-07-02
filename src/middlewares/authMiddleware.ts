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
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Token tidak ditemukan, silakan login' });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'Format token salah atau tidak ditemukan' });
    }

    try {
        const secret = process.env.JWT_SECRET || "saya_sangat_rahasia";
        const decoded = jwt.verify(token, secret) as any;
        
        // Menyimpan data hasil decode token (userId, username, role) ke dalam object req.user
        req.user = decoded; 
        
        next(); 
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }
};

/**
 * 2. FUNGSI AUTHORIZATION: KHUSUS SUPER ADMIN
 */
export const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Akses tidak sah, silakan login terlebih dahulu' });
    }

    // Mendukung format mapping database maupun format Enum Prisma asli
    if (req.user.role !== 'super admin' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Akses ditolak! Fitur ini hanya untuk Super Admin.' });
    }

    next(); 
};

/**
 * 3. FUNGSI AUTHORIZATION: KHUSUS TENANT ADMIN (PEMILIK LAPANGAN)
 */
export const tenantAdminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Akses tidak sah, silakan login terlebih dahulu' });
    }

    // 🛠️ AMAN: Menerima 'admin tenant' (database) maupun 'TENANT_ADMIN' (payload token)
    if (req.user.role !== 'admin tenant' && req.user.role !== 'TENANT_ADMIN') {
        return res.status(403).json({ message: 'Akses ditolak! Fitur ini hanya untuk Admin Tenant.' });
    }

    next(); 
};

/**
 * 4. FUNGSI AUTHORIZATION: KHUSUS CUSTOMERS (PELANGGAN)
 */
export const customersOnly = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Akses tidak sah, silakan login terlebih dahulu' });
    }

    if (req.user.role !== 'customers' && req.user.role !== 'CUSTOMERS') {
        return res.status(403).json({ message: 'Akses ditolak! Fitur ini khusus untuk Customer.' });
    }

    next(); 
};