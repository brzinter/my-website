// Test setup and global mocks
global.fetch = jest.fn();
global.AbortSignal = {
  timeout: jest.fn(() => ({}))
};

// Mock DOMParser for RSS parsing
global.DOMParser = class {
  parseFromString(str, type) {
    return {
      querySelectorAll: jest.fn(() => [])
    };
  }
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
});
