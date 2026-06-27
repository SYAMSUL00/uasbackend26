import { Response, Request } from 'express';
import { prisma } from '../lib/db.js';

// Menampilkan semua data user yang terdaftar di database
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        // Mengambil data user tetapi menyembunyikan kolom password demi keamanan
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        return res.status(200).json(allUsers);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data user' });
    }
};

// Membuat data user baru secara manual (Biasa digunakan oleh Super Admin)
export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    
    // Validasi input wajib
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, dan password harus diisi' });
    }

    try {
        // Memastikan email yang didaftarkan belum digunakan oleh user lain
        const userExist = await prisma.user.findUnique({
            where: { email }
        });
        if (userExist) {
            return res.status(400).json({ error: 'Email sudah terdaftar' });
        }

        // Menyimpan data user baru ke database MySQL
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // Catatan: Sebaiknya di-hash menggunakan bcrypt sebelum disimpan
                role: role || 'CUSTOMERS' // Jika role kosong, otomatis diatur ke CUSTOMERS
            }
        });
        return res.status(201).json(newUser);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menyimpan data user baru' });
    }
};

// Mengambil satu data spesifik user berdasarkan ID
export const getUserById = async (req: Request, res: Response) => {  
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            // Membatasi kolom yang dikirim ke client (tanpa password)
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        
        // Validasi jika ID user tidak ditemukan di database
        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }
        return res.json(user);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengambil data user' });
    }
};

// Memperbarui data profile atau hak akses (role) user berdasarkan ID
export const updateUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { name, email, password, role }
        });
        return res.json(updatedUser);
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengupdate data user' });
    }
};

// Menghapus data user dari database berdasarkan ID
export const deleteUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: Number(id) }
        });
        return res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menghapus data user' });
    }
};