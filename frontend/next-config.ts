generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" url = env("DATABASE_URL") }
model Admin { id String @id @default(cuid()) email String @unique passwordHash String createdAt DateTime @default(now()) updatedAt DateTime @updatedAt }
model BotSession { id String @id @default(cuid()) ownerId String phoneMasked String status String @default("DISCONNECTED") lastConnectedAt DateTime? createdAt DateTime @default(now()) updatedAt DateTime @updatedAt }
model ConnectionEvent { id String @id @default(cuid()) sessionId String event String detail String? createdAt DateTime @default(now()) }
model AuditLog { id String @id @default(cuid()) actor String action String detail String? ip String? createdAt DateTime @default(now()) }
