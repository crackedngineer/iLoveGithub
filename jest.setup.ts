import "@testing-library/jest-dom";

// Provide required environment variables so modules that validate them at
// import time (e.g. supabase.ts, redis.ts) don't throw during tests.
process.env.NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "test-anon-key";
process.env.KV_REST_API_URL = process.env.KV_REST_API_URL || "https://test.upstash.io";
process.env.KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || "test-redis-token";
process.env.EMAIL_FROM = process.env.EMAIL_FROM || "test@ilovegithub.com";
process.env.NEXT_PUBLIC_ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
