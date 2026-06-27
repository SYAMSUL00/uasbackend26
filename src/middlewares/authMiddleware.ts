import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

//fungsi cek authentication
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    try {
        const secret = process.env.JWT_SECRET || "saya_sangat_rahasia";
        const decoded = jwt.verify(token, secret) as any;
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid' });
    }
}    