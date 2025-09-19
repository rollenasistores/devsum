/**
 * Jest test setup file
 * Configures test environment and global test utilities
 */

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

beforeEach(() => {
  // Reset console mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Restore console after each test
  Object.assign(console, originalConsole);
});

// Global test utilities
global.testUtils = {
  // Mock file system operations
  mockFileSystem: () => {
    jest.mock('fs/promises');
  },
  
  // Mock git operations
  mockGitService: () => {
    jest.mock('../src/core/git');
  },
  
  // Mock AI service
  mockAIService: () => {
    jest.mock('../src/core/ai');
  },
  
  // Mock configuration
  mockConfig: () => {
    jest.mock('../src/core/config');
  },
};

// Type definitions for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        mockFileSystem: () => void;
        mockGitService: () => void;
        mockAIService: () => void;
        mockConfig: () => void;
      };
    }
  }
}
