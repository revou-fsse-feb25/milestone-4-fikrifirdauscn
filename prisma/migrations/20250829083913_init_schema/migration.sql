/*
  Warnings:

  - You are about to alter the column `balance` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.
  - You are about to drop the column `accountId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionDate` on the `Transaction` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(14,2)`.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `performedById` to the `Transaction` table without a default value. This is not possible if the table is not empty.
*/

ALTER TABLE "public"."Transaction" DROP CONSTRAINT "Transaction_accountId_fkey";


DROP INDEX "public"."User_username_key";


ALTER TABLE "public"."Account" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(14,2),
ALTER COLUMN "userId" DROP DEFAULT;


ALTER TABLE "public"."Transaction" DROP COLUMN "accountId",
DROP COLUMN "transactionDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fromAccountId" INTEGER,
ADD COLUMN     "performedById" INTEGER NOT NULL,
ADD COLUMN     "toAccountId" INTEGER,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(14,2);


ALTER TABLE "public"."User" DROP COLUMN "username",
ALTER COLUMN "phone" DROP NOT NULL;


CREATE INDEX "Account_userId_idx" ON "public"."Account"("userId");


CREATE INDEX "Transaction_createdAt_idx" ON "public"."Transaction"("createdAt");


CREATE INDEX "Transaction_performedById_idx" ON "public"."Transaction"("performedById");


CREATE INDEX "Transaction_fromAccountId_idx" ON "public"."Transaction"("fromAccountId");


CREATE INDEX "Transaction_toAccountId_idx" ON "public"."Transaction"("toAccountId");


ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "public"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "public"."Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "public"."Transaction" ADD CONSTRAINT "Transaction_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
