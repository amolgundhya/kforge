import { config } from 'dotenv';

// Load environment variables
config();

// Set default test timeout
jest.setTimeout(30000);

// Global setup
beforeAll(async () => {
  console.log('Starting E2E tests...');
});

// Global teardown
afterAll(async () => {
  console.log('E2E tests completed.');
});