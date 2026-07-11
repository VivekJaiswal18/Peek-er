-- Associate a verified GitHub App installation with the Peek-er user who
-- completed the browser setup flow. The relation is optional because GitHub
-- can deliver the installation webhook before the setup callback is received.
ALTER TABLE "GitInstallation" ADD COLUMN "userId" INTEGER;

CREATE INDEX "GitInstallation_userId_idx" ON "GitInstallation"("userId");

ALTER TABLE "GitInstallation"
ADD CONSTRAINT "GitInstallation_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
