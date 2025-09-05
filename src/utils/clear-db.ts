import { Request, Response } from 'express';
import { AppDataSource } from '../database';

export const truncatePublicSchema = async (_: Request, res: Response) => {
  try {
    await AppDataSource.query(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
    `);

    res.json({
      success: true,
      message: 'All public tables truncated successfully',
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to truncate schema',
      details: err instanceof Error ? err.message : String(err),
    });
  }
};
