/*
  Warnings:

  - You are about to drop the column `bobot` on the `kriteria` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `kriteria` DROP COLUMN `bobot`;

-- AlterTable
ALTER TABLE `lapangan` ADD COLUMN `tempat` VARCHAR(191) NOT NULL DEFAULT '';
