import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  mockJobListing,
  mockUser,
  mockToast,
  mockFirebaseAuth,
  mockFetchResponse,
} from '../../utils/test-utils';
import { JobCard } from '../JobCard';

// Mock the API functions
jest.mock('@/lib/api', () => ({
  saveJob: jest.fn(),
  unsaveJob: jest.fn(),
}));

describe('JobCard', () => {
  const { saveJob, unsaveJob } = require('@/lib/api');

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirebaseAuth(mockUser);

    // Mock toast
    const { default: toast } = require('react-hot-toast');
    Object.assign(toast, mockToast);
  });

  it('renders job information correctly', () => {
    render(<JobCard job={mockJobListing} />);

    expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Remote')).toBeInTheDocument();
    expect(screen.getByText('CDI')).toBeInTheDocument();
    expect(screen.getByText('60k-80k€')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('displays technologies correctly', () => {
    render(<JobCard job={mockJobListing} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('formats posted time correctly', () => {
    const recentJob = {
      ...mockJobListing,
      postedAt: new Date().toISOString(),
    };
    render(<JobCard job={recentJob} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('opens job URL when apply button is clicked', () => {
    global.open = jest.fn();
    render(<JobCard job={mockJobListing} />);

    const applyButton = screen.getByText('Apply');
    fireEvent.click(applyButton);

    expect(global.open).toHaveBeenCalledWith(mockJobListing.url, '_blank', 'noopener,noreferrer');
  });

  it('shows login error when saving without user', () => {
    mockFirebaseAuth(null);
    render(<JobCard job={mockJobListing} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    expect(mockToast.error).toHaveBeenCalledWith('Please login to save jobs');
  });

  it('saves job when save button is clicked', async () => {
    saveJob.mockResolvedValue(undefined);
    render(<JobCard job={mockJobListing} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveJob).toHaveBeenCalledWith(mockUser.uid, mockJobListing.id);
      expect(mockToast.success).toHaveBeenCalledWith('Job saved successfully');
    });

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('unsaves job when already saved', async () => {
    unsaveJob.mockResolvedValue(undefined);
    render(<JobCard job={mockJobListing} saved={true} />);

    const saveButton = screen.getByText('Saved');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(unsaveJob).toHaveBeenCalledWith(mockUser.uid, mockJobListing.id);
      expect(mockToast.success).toHaveBeenCalledWith('Job removed from saved');
    });

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('handles save errors gracefully', async () => {
    saveJob.mockRejectedValue(new Error('Save failed'));
    render(<JobCard job={mockJobListing} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Failed to save job');
    });
  });

  it('displays correct source colors and labels', () => {
    const testCases = [
      { source: 'linkedin', label: 'LinkedIn', color: 'bg-blue-500' },
      { source: 'indeed', label: 'Indeed', color: 'bg-blue-600' },
      { source: 'welcometothejungle', label: 'Welcome to the Jungle', color: 'bg-orange-500' },
    ];

    testCases.forEach(({ source, label, color }) => {
      const { container } = render(<JobCard job={{ ...mockJobListing, source }} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(container.querySelector(`.${color}`)).toBeInTheDocument();
    });
  });

  it('limits displayed technologies and shows count', () => {
    const jobWithManyTechs = {
      ...mockJobListing,
      technologies: Array(12)
        .fill(null)
        .map((_, i) => `Tech${i + 1}`),
    };

    render(<JobCard job={jobWithManyTechs} />);

    expect(screen.getByText('Tech1')).toBeInTheDocument();
    expect(screen.getByText('Tech8')).toBeInTheDocument();
    expect(screen.getByText('+4 more')).toBeInTheDocument();
    expect(screen.queryByText('Tech9')).not.toBeInTheDocument();
  });

  it('truncates description correctly', () => {
    const longDescription = 'A'.repeat(200);
    const jobWithLongDesc = {
      ...mockJobListing,
      description: longDescription,
    };

    render(<JobCard job={jobWithLongDesc} />);

    const descriptionElement = screen.getByText((content, element) => {
      return (
        element?.tagName.toLowerCase() === 'p' &&
        content?.includes('A') &&
        content.length < longDescription.length
      );
    });

    expect(descriptionElement).toBeInTheDocument();
  });
});
