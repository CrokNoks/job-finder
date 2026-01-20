import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import { StatsOverview } from '../StatsOverview';
import { mockUser, mockFirebaseAuth } from '../../utils/test-utils';

// Mock the API functions
jest.mock('@/lib/api', () => ({
  getUserStats: jest.fn(),
}));

// Mock UserStats type
const mockUserStats = {
  totalSearches: 15,
  savedJobs: 23,
  applicationsSent: 8,
  interviews: 3,
  offers: 1,
  responseRate: 65,
  avgResultsPerSearch: 12.5,
  sources: {
    linkedin: 8,
    indeed: 5,
    welcometothejungle: 2,
  },
  recentActivity: [
    {
      id: '1',
      type: 'job_saved',
      jobTitle: 'Senior React Developer',
      company: 'Tech Corp',
      timestamp: new Date('2024-01-15').toISOString(),
    },
  ],
};

describe('StatsOverview', () => {
  const { getUserStats } = require('@/lib/api');

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirebaseAuth(mockUser);
  });

  it('renders loading skeleton while fetching stats', () => {
    getUserStats.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

    render(<StatsOverview userId="user-123" />);

    expect(screen.getByText('Vos Statistiques')).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('generic', { name: '' })
        .filter((el) => el.classList.contains('animate-pulse'))
    ).toHaveLength(4);
  });

  it('renders user stats correctly when data is loaded', async () => {
    getUserStats.mockResolvedValue(mockUserStats);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // Total searches
      expect(screen.getByText('23')).toBeInTheDocument(); // Saved jobs
      expect(screen.getByText('8')).toBeInTheDocument(); // Applications sent
      expect(screen.getByText('65%')).toBeInTheDocument(); // Response rate
    });

    expect(screen.getByText('Total recherches')).toBeInTheDocument();
    expect(screen.getByText('Offres sauvegardées')).toBeInTheDocument();
    expect(screen.getByText('Candidatures envoyées')).toBeInTheDocument();
    expect(screen.getByText('Taux de réponse')).toBeInTheDocument();
  });

  it('renders default stats when user is not logged in', async () => {
    mockFirebaseAuth(null);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('renders default stats when API call fails', async () => {
    getUserStats.mockRejectedValue(new Error('Failed to fetch stats'));

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('displays correct colors for each stat type', async () => {
    getUserStats.mockResolvedValue(mockUserStats);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      const statElements = screen.getAllByText(
        /Total recherches|Offres sauvegardées|Candidatures envoyées|Taux de réponse/
      );
      expect(statElements).toHaveLength(4);
    });
  });

  it('shows recent activity section', async () => {
    getUserStats.mockResolvedValue(mockUserStats);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('Activité récente')).toBeInTheDocument();
      expect(screen.getByText('Vos dernières interactions avec les offres')).toBeInTheDocument();
      expect(screen.getByText('Voir tout')).toBeInTheDocument();
    });
  });

  it('calls getUserStats with correct user ID', async () => {
    getUserStats.mockResolvedValue(mockUserStats);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(getUserStats).toHaveBeenCalledWith(mockUser.uid);
    });
  });

  it('fetches stats only once on mount', async () => {
    getUserStats.mockResolvedValue(mockUserStats);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(getUserStats).toHaveBeenCalledTimes(1);
    });
  });

  it('refetches stats when userId prop changes', async () => {
    getUserStats.mockResolvedValue(mockUserStats);

    const { rerender } = render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(getUserStats).toHaveBeenCalledWith(mockUser.uid);
      expect(getUserStats).toHaveBeenCalledTimes(1);
    });

    rerender(<StatsOverview userId="user-456" />);

    await waitFor(() => {
      expect(getUserStats).toHaveBeenCalledTimes(2);
    });
  });

  it('handles empty stats gracefully', async () => {
    const emptyStats = {
      ...mockUserStats,
      totalSearches: 0,
      savedJobs: 0,
      applicationsSent: 0,
      responseRate: 0,
    };
    getUserStats.mockResolvedValue(emptyStats);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('displays correct stat values format', async () => {
    getUserStats.mockResolvedValue(mockUserStats);

    render(<StatsOverview userId="user-123" />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument(); // Searches number
      expect(screen.getByText('23')).toBeInTheDocument(); // Saved jobs number
      expect(screen.getByText('8')).toBeInTheDocument(); // Applications number
      expect(screen.getByText('65%')).toBeInTheDocument(); // Response rate with %
    });
  });
});
