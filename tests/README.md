# Test Documentation

This directory contains the test suite for the Personal Dashboard project. The tests are written using Jest and cover all major functionality.

## Test Structure

```
tests/
├── setup.js          # Global test setup and mocks
├── time.test.js      # Time and date display tests
├── weather.test.js   # Weather API and geolocation tests
├── stock.test.js     # Stock data and multi-proxy tests
├── news.test.js      # News RSS feed and parsing tests
└── README.md         # This file
```

## Prerequisites

Before running tests, you need to install the required dependencies.

### Install Dependencies

```bash
cd /Users/jason.wang/claude_project/my-website
npm install
```

This will install:
- `jest` - Testing framework
- `jest-environment-jsdom` - DOM environment for browser API testing
- `@babel/core` & `@babel/preset-env` - JavaScript transpilation
- `babel-jest` - Babel integration with Jest

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

This will re-run tests automatically when files change:

```bash
npm run test:watch
```

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

This generates a coverage report in the `coverage/` directory and displays a summary in the terminal.

### Run Specific Test File

```bash
npm test time.test.js
npm test weather.test.js
npm test stock.test.js
npm test news.test.js
```

### Run Tests with Verbose Output

```bash
npm test -- --verbose
```

## Test Coverage

The test suite covers the following areas:

### Time and Date Functions (`time.test.js`)
- ✅ Time display formatting (HH:MM:SS)
- ✅ Date display formatting
- ✅ Leading zero padding
- ✅ Edge cases (midnight, noon)

### Weather Functions (`weather.test.js`)
- ✅ Successful weather data fetching
- ✅ Weather code to description mapping
- ✅ Location display (GPS vs IP-based)
- ✅ IP geolocation fallback
- ✅ Error handling
- ✅ Temperature, humidity, and wind speed formatting

### Stock Data Functions (`stock.test.js`)
- ✅ Stock data fetching and parsing
- ✅ Multi-proxy fallback mechanism
- ✅ Price change calculations (positive/negative)
- ✅ Percentage change calculations
- ✅ Request timeout handling (8 seconds)
- ✅ All proxies failure scenario
- ✅ Stock information display formatting
- ✅ Error message display

### News Functions (`news.test.js`)
- ✅ RSS feed fetching and parsing
- ✅ Multi-proxy fallback mechanism
- ✅ Different proxy response format handling
- ✅ Article information extraction
- ✅ Date formatting
- ✅ Article limit (3 articles)
- ✅ Clickable link generation
- ✅ Empty feed handling
- ✅ Request timeout handling (8 seconds)
- ✅ Error message display

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
{
  testEnvironment: 'jsdom',           // Simulates browser environment
  collectCoverageFrom: ['js/**/*.js'], // Coverage for all JS files
  testMatch: ['**/tests/**/*.test.js'], // Test file pattern
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'] // Global setup
}
```

### Global Test Setup (`setup.js`)

The setup file provides:
- Mock `fetch` API for HTTP requests
- Mock `AbortSignal.timeout` for request timeouts
- Mock `DOMParser` for RSS XML parsing
- Console method mocks to reduce test noise
- Automatic mock clearing between tests

## Writing New Tests

When adding new functionality to the dashboard, follow these patterns:

### 1. Create a new test file

```javascript
describe('Feature Name', () => {
  let element;

  beforeEach(() => {
    // Set up DOM elements
    document.body.innerHTML = `<div id="test-element"></div>`;
    element = document.getElementById('test-element');
  });

  describe('Function Name', () => {
    test('should do something specific', () => {
      // Arrange
      const expected = 'result';

      // Act
      const actual = someFunction();

      // Assert
      expect(actual).toBe(expected);
    });
  });
});
```

### 2. Mock API responses

```javascript
global.fetch.mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: 'mock data' })
});
```

### 3. Test error scenarios

```javascript
global.fetch.mockResolvedValueOnce({
  ok: false,
  status: 500
});
```

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests failing with "ReferenceError: fetch is not defined"

Make sure the global setup is working:
```bash
# Check that setup.js is being loaded
npm test -- --verbose
```

### Tests timing out

Increase the Jest timeout:
```javascript
jest.setTimeout(10000); // 10 seconds
```

### Mock not being called

Reset mocks between tests:
```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how it does it
2. **Use descriptive test names** - Test names should clearly state what is being tested
3. **Follow AAA pattern** - Arrange, Act, Assert
4. **Keep tests independent** - Each test should run successfully in isolation
5. **Mock external dependencies** - Don't make real API calls in tests
6. **Test edge cases** - Include tests for error conditions and boundary values

## Coverage Goals

Target coverage metrics:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

View current coverage:
```bash
npm run test:coverage
open coverage/lcov-report/index.html  # macOS
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
