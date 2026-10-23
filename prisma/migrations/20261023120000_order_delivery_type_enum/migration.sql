-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('PICKUP', 'ADDRESS');

-- AlterTable: рядки 'pickup'/'address' -> 'PICKUP'/'ADDRESS'
ALTER TABLE "Order" ALTER COLUMN "deliveryType" TYPE "DeliveryType" USING UPPER("deliveryType")::"DeliveryType";
