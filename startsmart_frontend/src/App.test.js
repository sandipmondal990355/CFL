import { render, screen } from '@testing-library/react';
import App from './App';

test('renders App and checks for breadcrumb text', () => {
  render(<App />);
  const textElement = screen.getByText(/Digital Lounge/i);
  expect(textElement).toBeInTheDocument();
});
