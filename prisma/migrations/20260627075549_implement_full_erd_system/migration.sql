/*
  Warnings:

  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.
  - Added the required column `nama` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `name`,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('super admin', 'admin tenant', 'customers') NOT NULL DEFAULT 'customers';

-- CreateTable
CREATE TABLE `tenant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `nama_tenant` VARCHAR(191) NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lapangan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `nama_lapangan` VARCHAR(191) NOT NULL,
    `harga/jam` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tenant_kriteria_value` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tenant_id` INTEGER NOT NULL,
    `kriteria_id` INTEGER NOT NULL,
    `nilai` DECIMAL(10, 4) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kriteria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kode` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `tipe` VARCHAR(191) NOT NULL,
    `bobot` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `kriteria_kode_key`(`kode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kriteria_value` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kriteria_id` INTEGER NOT NULL,
    `value` DECIMAL(10, 4) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rekomendasi_request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `tempat` VARCHAR(191) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rekomendasi_request_weight` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rekomendasi_request_id` INTEGER NOT NULL,
    `kriteria_id` INTEGER NOT NULL,
    `bobot` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tenant` ADD CONSTRAINT `tenant_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lapangan` ADD CONSTRAINT `lapangan_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_kriteria_value` ADD CONSTRAINT `tenant_kriteria_value_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tenant_kriteria_value` ADD CONSTRAINT `tenant_kriteria_value_kriteria_id_fkey` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kriteria_value` ADD CONSTRAINT `kriteria_value_kriteria_id_fkey` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rekomendasi_request` ADD CONSTRAINT `rekomendasi_request_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rekomendasi_request_weight` ADD CONSTRAINT `rekomendasi_request_weight_rekomendasi_request_id_fkey` FOREIGN KEY (`rekomendasi_request_id`) REFERENCES `rekomendasi_request`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rekomendasi_request_weight` ADD CONSTRAINT `rekomendasi_request_weight_kriteria_id_fkey` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
