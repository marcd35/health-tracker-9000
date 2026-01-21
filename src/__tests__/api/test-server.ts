import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import Database from 'better-sqlite3';
import { setupTestDbWithData } from '../setup/test-db';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let server: any;
let db: Database.Database;

export async function setupTestServer() {
  if (!server) {
    await app.prepare();

    server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    // Set up test database
    db = setupTestDbWithData();

    // Override the database connection for API routes
    process.env.TEST_DB = db as any;

    await new Promise<void>((resolve) => {
      server.listen(0, () => resolve()); // Use port 0 for auto-assignment
    });
  }

  return {
    server,
    db,
    port: (server.address() as any).port,
    url: `http://localhost:${(server.address() as any).port}`,
  };
}

export async function teardownTestServer() {
  if (server) {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    server = undefined;
  }

  if (db) {
    db.close();
    db = undefined as any;
  }

  // Clean up environment variables
  delete process.env.TEST_DB;
}
