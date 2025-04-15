-- DropForeignKey
ALTER TABLE "mfa_auth" DROP CONSTRAINT "mfa_auth_userId_email_fkey";

-- AddForeignKey
ALTER TABLE "mfa_auth" ADD CONSTRAINT "mfa_auth_userId_email_fkey" FOREIGN KEY ("userId", "email") REFERENCES "User"("id", "email") ON DELETE CASCADE ON UPDATE CASCADE;
