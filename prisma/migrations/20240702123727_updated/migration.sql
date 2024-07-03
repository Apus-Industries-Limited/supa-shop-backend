/*
  Warnings:

  - You are about to drop the column `desc` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Merchant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `address` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dp` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone_number` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Waitlist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dp` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FASHION', 'ELECTRONICS', 'LIFESTYLE', 'PHONE', 'ACCESSORIES', 'AUTOMOBILE', 'GROCERRIES');

-- AlterTable
ALTER TABLE "Merchant" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dp" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "phone_number" TEXT NOT NULL,
ADD COLUMN     "refresh_token" TEXT[],
ADD COLUMN     "resetPasswordToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ADD COLUMN     "verification_code" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Waitlist" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "desc",
ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "color" TEXT[],
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "dimension" JSONB,
ADD COLUMN     "dp" TEXT NOT NULL,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "quantity" BIGINT NOT NULL,
ADD COLUMN     "ratings" DECIMAL(65,30)[];

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_username_key" ON "Merchant"("username");
