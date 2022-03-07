import { render, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

async function renderApp() {
  const utils = render(<App />);
  expect(utils.getByText('Loading...')).toBeInTheDocument();
  await waitFor(
    () => expect(utils.queryByText('Loading...')).toBeNull()
  );
  return utils;
}

test('renders without crashing', async () => {
  const { queryByText } = await renderApp();
  expect(queryByText('An error has occurred')).toBeNull();
});



test('can sign in', async () => {
  const {
    getAllByText, getByText, getByRole, getByLabelText, queryAllByText,
    queryByText,
  } = await renderApp();

  const getFirstByText = (...args) => getAllByText(...args)[0];
  const queryFirstByText = (...args) => queryAllByText(...args)[0] || null;

  expect(queryByText(/test-user/)).toBeNull();
  expect(queryByText(/Test user/)).toBeNull();

  const loginButton = getFirstByText(/Log in/);
  expect(loginButton).toBeInTheDocument();
  fireEvent.click(loginButton)

  const nameInput = getByLabelText('Enter your username');
  const passwordInput = getByLabelText('Enter your password');
  const button = getByRole('button', { name: 'Sign in' });
  fireEvent.change(nameInput, { target: { value: 'test-user' } });
  fireEvent.change(passwordInput, { target: { value: 'test-password' } });
  fireEvent.click(button);
  await waitFor(
    () => expect(queryFirstByText(/Log in/)).toBeNull()
  )
  expect(getFirstByText('test-user')).toBeInTheDocument();
  expect(getFirstByText('Test user')).toBeInTheDocument();
});
