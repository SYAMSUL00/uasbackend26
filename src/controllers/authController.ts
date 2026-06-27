import { Response, Request } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/db.js';

export const registerUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password harus diisi' });
    }

    try {
        const userExist = await prisma.user.findUnique({
            where: { email }
        });

        if (userExist) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: name || '',
                email,
                password: hashedPassword,
                role: role || 'CUSTOMERS'
            }
        });

        return res.status(201).json({
            message: 'Register berhasil',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal melakukan register user' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password harus diisi' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Password salah' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.email },
            process.env.JWT_SECRET || "saya_sangat_rahasia",
            { expiresIn: '1h' }
        );

        return res.json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal melakukan login' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email harus diisi' });
    }
    
    return res.json({ message: 'Fitur forgot password belum diimplementasikan penuh' });
};