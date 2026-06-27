import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diset di file .env");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export const prisma = new PrismaClient({ 
    adapter 
}); 