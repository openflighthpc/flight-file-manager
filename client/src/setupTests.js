// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import 'regenerator-runtime/runtime'
import { enableFetchMocks } from 'jest-fetch-mock';


import testConfig from '../public/config.test.json';

// The lightest possible MutationObserver shim.  We may need to upgrade this
// to `import "mutationobserver-shim"` at some point.
global.MutationObserver = class {
    // constructor(callback) {}
    disconnect() {}
    observe(element, initObject) {}
};

enableFetchMocks();

beforeEach(() => {
  fetch.resetMocks();
  fetch.mockResponse((req) => {
    const url = new URL(req.url);
    const pathname = url.pathname;
    // console.log('req:', req.method, pathname);  // eslint-disable-line no-console

    if (pathname === `${process.env.REACT_APP_LOGIN_API_BASE_URL}/session`) {
      return Promise.resolve({status: 403});

    } else if (pathname === `${process.env.REACT_APP_LOGIN_API_BASE_URL}/sign-in`) {
      return Promise.resolve(JSON.stringify({
        user: {
          username: 'test-user',
          name: 'Test user',
          authentication_token: 'test-token'
        }
      }));

    } else if (url.toString() === process.env.REACT_APP_CONFIG_FILE) {
      return Promise.resolve(JSON.stringify(testConfig));

    } else if (url.toString() === process.env.REACT_APP_BRANDING_FILE) {
      return Promise.resolve(JSON.stringify({}));

    } else if (url.toString() === process.env.REACT_APP_ENVIRONMENT_FILE) {
      return Promise.resolve(JSON.stringify({}));

    } else if (url.toString() === process.env.REACT_APP_DATA_FILE) {
      return Promise.resolve(JSON.stringify({}));
    }
  });
});

afterEach(() => {
  fetch.resetMocks();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
