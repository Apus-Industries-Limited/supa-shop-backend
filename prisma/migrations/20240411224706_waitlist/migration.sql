-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Waitlist_email_key" ON "Waitlist"("email");
