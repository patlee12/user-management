-- CreateTable
CREATE TABLE "AccountRequest" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountRequest_username_key" ON "AccountRequest"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AccountRequest_email_key" ON "AccountRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AccountRequest_token_key" ON "AccountRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AccountRequest_id_email_key" ON "AccountRequest"("id", "email");
