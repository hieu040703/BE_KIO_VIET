# RAG Module Notes

- `rag.pgvector.pool.ts` owns the singleton `pg.Pool` shared by `rag.chain.service.ts`, `rag.sync.service.ts`, and `ragDocument.service.ts`.
- `PGVectorStore.initialize(...)` is called per operation but reuses the shared pool from `getPgVectorPool()`, so pool sizing and shutdown behavior must be controlled centrally in `rag.pgvector.pool.ts`.
- API and worker shutdown paths must close the pgvector pool with `closePgVectorPool()` in addition to destroying the TypeORM `DatabaseConfig`.
- When debugging Postgres saturation, distinguish the TypeORM pool (`src/database/database.ts`) from the RAG pgvector pool; both hit the same database and count toward `max_connections`.
