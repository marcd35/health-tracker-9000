import { setupTestDbWithData, teardownTestDb } from '../setup/test-db';

let db: any;

beforeAll(() => {
  db = setupTestDbWithData();
  // Override the database connection for API routes
  process.env.TEST_DB = db as any;
});

afterAll(() => {
  if (db) {
    teardownTestDb(db);
  }
  // Clean up environment variables
  delete process.env.TEST_DB;
});

// Helper function to create mock Request/Response for testing
export const createMockRequest = (method: string, body?: any, params?: Record<string, string>) => {
  const url = new URL('http://localhost:3000');
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const request = {
    method,
    url: url.toString(),
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => body,
  } as any;

  return request;
};

export const createMockResponse = () => {
  const response = {
    status: 200,
    headers: new Headers(),
    json: null as any,
    text: null as any,
  };

  const mockResponse = {
    status: (code: number) => {
      response.status = code;
      return mockResponse;
    },
    json: (data: any) => {
      response.json = data;
      return mockResponse;
    },
    setHeader: (name: string, value: string) => {
      response.headers.set(name, value);
      return mockResponse;
    },
  };

  return { response, mockResponse };
};
