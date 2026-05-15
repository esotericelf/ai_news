import { render, screen } from '@testing-library/react';
import App from './App';
import { config } from './config';

test('renders site name in header', () => {
  render(<App />);
  expect(screen.getByText(config.siteName)).toBeInTheDocument();
});
