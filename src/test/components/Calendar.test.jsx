import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';

// Mock firebase before importing Calendar
vi.mock('../../lib/firebase', () => ({
  db: {},
  auth: {},
}));

// Mock the Toast hook
vi.mock('../../components/shared/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    undo: vi.fn(),
  }),
}));

// Mock the Walkthrough component
vi.mock('../../components/shared/Walkthrough', () => ({
  HintBadge: ({ children }) => <div>{children}</div>,
}));

// Mock SeasonPlanner
vi.mock('../../components/pages/SeasonPlanner', () => ({
  default: () => <div>SeasonPlanner</div>,
}));

import Calendar from '../../components/pages/Calendar';

describe('Calendar component', () => {
  const mockTheme = {
    accent: '#fff',
    accentD: '#ccc',
    accentBg: '#111',
    bg: '#000',
    g900: '#111',
    g800: '#222',
    g700: '#333',
    g600: '#444',
    g500: '#555',
    g400: '#666',
    g300: '#777',
    white: '#fff',
  };

  const mockUser = {
    uid: 'test-user-123',
    displayName: 'Test Coach',
    email: 'coach@test.com',
  };

  const mockProps = {
    theme: mockTheme,
    user: mockUser,
    workouts: [],
    savedTemplates: [],
    athletes: [],
    groups: [],
  };

  it('renders the PRACTICE CALENDAR heading', () => {
    render(<Calendar {...mockProps} />);
    expect(screen.getByText('PRACTICE CALENDAR')).toBeInTheDocument();
  });

  it('renders without crashing with basic props', () => {
    const { container } = render(<Calendar {...mockProps} />);
    expect(container).toBeTruthy();
  });
});
