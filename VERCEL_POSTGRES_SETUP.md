# Setup Vercel Postgres

## Langkah-langkah

### 1. Buat Database di Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda (`abseni-annahl`)
3. Klik tab **Storage**
4. Klik **Create Database**
5. Pilih **Postgres**
6. Pilih region terdekat (Singapore recommended)
7. Klik **Create**

### 2. Dapatkan Environment Variables

Setelah database dibuat:

1. Klik database yang baru dibuat
2. Klik tab **.env.local**
3. Copy semua environment variables

Atau dari dashboard project:
1. Settings > Environment Variables
2. Vercel akan otomatis menambahkan variabel seperti:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - dll.

### 3. Update Environment Variables di Vercel

Tambahkan dua variabel penting di **Settings > Environment Variables**:

```
DATABASE_URL="${POSTGRES_PRISMA_URL}"
DIRECT_DATABASE_URL="${POSTGRES_URL_NON_POOLING}"
```

Atau langsung copy nilai dari Vercel Postgres:

```bash
# Untuk connection pooling (serverless)
DATABASE_URL="postgres://default:xxxx@xxxx.postgres.vercel-storage.com/verceldb?sslmode=require&pgbouncer=true&connect_timeout=15"

# Untuk direct connection (migrations)
DIRECT_DATABASE_URL="postgres://default:xxxx@xxxx.postgres.vercel-storage.com/verceldb?sslmode=require"
```

### 4. Update Schema untuk Production

Sebelum deploy ke Vercel:

```bash
# Switch ke Postgres schema
cp prisma/schemas/schema.postgres.prisma prisma/schema.prisma

# Generate Prisma client
bun run db:generate
```

### 5. Push Schema ke Database

Untuk pertama kali, jalankan di local dengan env production:

```bash
# Set env vars sementara
export DATABASE_URL="your-postgres-url"
export DIRECT_DATABASE_URL="your-direct-url"

# Push schema
bunx prisma db push
```

Atau gunakan Prisma migrations:

```bash
bunx prisma migrate deploy
```

### 6. Seed Data Awal

Setelah schema di-push, buat admin default:

```sql
-- Via Vercel Postgres Query Editor
INSERT INTO Admin (id, username, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-001',
  'admin',
  '$2b$10$rQZ9QxZ9QxZ9QxZ9QxZ9Q.', -- bcrypt hash untuk 'admin123'
  'Administrator',
  'superadmin',
  true,
  NOW(),
  NOW()
);
```

## Local Development vs Production

| Environment | Database | Schema File |
|-------------|----------|-------------|
| Local | SQLite | `prisma/schemas/schema.sqlite.prisma` |
| Vercel | Postgres | `prisma/schemas/schema.postgres.prisma` |

## Troubleshooting

### Error: P1001 - Can't reach database server
- Pastikan `DATABASE_URL` benar
- Pastikan IP Anda tidak di-block (untuk non-Vercel hosting)

### Error: P3009 - migrate found failed migrations
- Reset database: `bunx prisma migrate reset`

### Error: Connection refused
- Gunakan `DIRECT_DATABASE_URL` untuk migrations
- Gunakan `DATABASE_URL` (pooling) untuk aplikasi

## Environment Variables Reference

```env
# Vercel Postgres (Production)
DATABASE_URL="postgres://..."          # Connection pooling URL
DIRECT_DATABASE_URL="postgres://..."   # Direct connection URL

# SQLite (Local Development)
DATABASE_URL="file:./dev.db"
```
