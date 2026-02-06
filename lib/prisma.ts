import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
// This import points to the custom output path defined in your schema.prisma
import { PrismaClient } from '../generated/prisma/client.js';

/**
 * DATABASE_URL should be your Neon pooled connection string:
 * postgresql://user:password@ep-name-pooler.region.aws.neon.tech/neondb?sslmode=require
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in your environment variables.');
}

// 1. Initialize the 'pg' (node-postgres) Pool
// We use a pool to manage connections efficiently, especially with Neon
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. Initialize the Prisma Driver Adapter
const adapter = new PrismaPg(pool);

// 3. Instantiate the Prisma Client
// We pass the adapter here so Prisma uses 'pg' instead of its default Rust engine
const prisma = new PrismaClient({ 
  adapter
});

export { prisma };