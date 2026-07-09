import {PrismaClient}  from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
})

export const prisma = new PrismaClient({adapter});

export * from "@prisma/client";


// model repo_files (
//   repo_id,
//   path,
//   blob_sha,
//   size,
//   language,
//   is_generated,
//   indexed_at
// );

// repo_symbols (
//   repo_id,
//   path,
//   blob_sha,
//   symbol_name,
//   symbol_type,
//   start_line,
//   end_line,
//   summary
// );

// repo_edges (
//   repo_id,
//   from_path,
//   from_symbol,
//   to_path,
//   to_symbol,
//   edge_type
// );

// repo_maps (
//   repo_id,
//   base_commit_sha,
//   map_text,
//   indexed_at
// );