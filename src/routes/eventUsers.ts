import express from 'express';
import { 
    getAllUsers, 
    createUser, 
    getUserById, 
    updateUserById, 
    deleteUserById 
} from '../controllers/usersController.js';

const router = express.Router();

// endpoint
router.get('/', getAllUsers);          // Menampilkan semua user
router.post('/', createUser);          // Mendaftarkan user baru
router.get('/:id', getUserById);       // Menampilkan 1 user berdasarkan ID
router.put('/:id', updateUserById);    // Mengubah data user berdasarkan ID
router.delete('/:id', deleteUserById); // Menghapus user berdasarkan ID

export default router;