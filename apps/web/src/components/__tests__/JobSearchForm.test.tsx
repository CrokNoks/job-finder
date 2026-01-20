import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { JobSearchForm } from '../JobSearchForm';
import { mockUser, mockToast, mockFirebaseAuth, mockFetchResponse } from '../../utils/test-utils';

// Mock the API functions
jest.mock('@/lib/api', () => ({
  searchJobs: jest.fn(),
  saveSearchHistory: jest.fn(),
}));

describe('JobSearchForm', () => {
  const { searchJobs, saveSearchHistory } = require('@/lib/api');

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirebaseAuth(mockUser);

    // Mock toast
    const { default: toast } = require('react-hot-toast');
    Object.assign(toast, mockToast);

    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('renders form fields correctly', () => {
    render(<JobSearchForm />);

    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn Jobs')).toBeInTheDocument();
    expect(screen.getByLabelText('Indeed')).toBeInTheDocument();
    expect(screen.getByLabelText('Welcome to the Jungle')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('ex: développeur react, designer UX...')
    ).toBeInTheDocument();
  });

  it('requires at least one source and a job title', async () => {
    render(<JobSearchForm />);

    const submitButton = screen.getByText('Lancer la recherche');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Le poste est requis')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    searchJobs.mockResolvedValue([{ id: 'job1', title: 'Developer' }]);
    saveSearchHistory.mockResolvedValue(undefined);

    render(<JobSearchForm />);

    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'React Developer' } });

    const submitButton = screen.getByText('Lancer la recherche');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: ['linkedin', 'indeed', 'welcometothejungle'],
          poste: 'React Developer',
          technologies: [],
          excludeTerms: [],
          remoteOnly: false,
        })
      );
    });
  });

  it('toggles advanced options', () => {
    render(<JobSearchForm />);

    const toggleButton = screen.getByText('Afficher les options avancées');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);

    expect(screen.getByText('Masquer les options avancées')).toBeInTheDocument();
    expect(screen.getByText('Technologies')).toBeInTheDocument();
    expect(screen.getByText('Localisation')).toBeInTheDocument();
  });

  it('adds and removes technologies', async () => {
    render(<JobSearchForm />);

    const toggleButton = screen.getByText('Afficher les options avancées');
    fireEvent.click(toggleButton);

    const techInput = screen.getByPlaceholderText('Ajouter une technologie');
    const addButton = screen.getByText('Ajouter');

    // Add technology
    fireEvent.change(techInput, { target: { value: 'React' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    // Remove technology
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('React')).not.toBeInTheDocument();
    });
  });

  it('adds technology on Enter key press', async () => {
    render(<JobSearchForm />);

    const toggleButton = screen.getByText('Afficher les options avancées');
    fireEvent.click(toggleButton);

    const techInput = screen.getByPlaceholderText('Ajouter une technologie');

    fireEvent.change(techInput, { target: { value: 'TypeScript' } });
    fireEvent.keyPress(techInput, { key: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
  });

  it('adds and removes exclude terms', async () => {
    render(<JobSearchForm />);

    const toggleButton = screen.getByText('Afficher les options avancées');
    fireEvent.click(toggleButton);

    const termInput = screen.getByPlaceholderText('Ajouter un terme à exclure');
    const addButton = screen.getByText('Ajouter');

    // Add exclude term
    fireEvent.change(termInput, { target: { value: 'stage' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('stage')).toBeInTheDocument();
    });

    // Remove exclude term
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('stage')).not.toBeInTheDocument();
    });
  });

  it('handles remote only checkbox', async () => {
    render(<JobSearchForm />);

    const toggleButton = screen.getByText('Afficher les options avancées');
    fireEvent.click(toggleButton);

    const remoteCheckbox = screen.getByLabelText('Télétravail uniquement');
    fireEvent.click(remoteCheckbox);

    const submitButton = screen.getByText('Lancer la recherche');
    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'Developer' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          remoteOnly: true,
        })
      );
    });
  });

  it('handles salary min input', async () => {
    render(<JobSearchForm />);

    const toggleButton = screen.getByText('Afficher les options avancées');
    fireEvent.click(toggleButton);

    const salaryInput = screen.getByPlaceholderText('ex: 45000');
    fireEvent.change(salaryInput, { target: { value: '60000' } });

    const submitButton = screen.getByText('Lancer la recherche');
    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'Developer' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          salaryMin: 60000,
        })
      );
    });
  });

  it('handles search errors gracefully', async () => {
    searchJobs.mockRejectedValue(new Error('Search failed'));

    render(<JobSearchForm />);

    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'Developer' } });

    const submitButton = screen.getByText('Lancer la recherche');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Erreur lors de la recherche. Veuillez réessayer.'
      );
    });
  });

  it('saves search history when user is logged in', async () => {
    searchJobs.mockResolvedValue([{ id: 'job1' }, { id: 'job2' }]);
    saveSearchHistory.mockResolvedValue(undefined);

    render(<JobSearchForm />);

    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'Developer' } });

    const submitButton = screen.getByText('Lancer la recherche');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(saveSearchHistory).toHaveBeenCalledWith(mockUser.uid, expect.any(Object), 2);
    });
  });

  it('continues search even if history saving fails', async () => {
    searchJobs.mockResolvedValue([{ id: 'job1' }]);
    saveSearchHistory.mockRejectedValue(new Error('History save failed'));

    render(<JobSearchForm />);

    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'Developer' } });

    const submitButton = screen.getByText('Lancer la recherche');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalled();
      expect(window.location.href).toContain('/jobs?q=');
    });
  });

  it('redirects to results page with search query', async () => {
    searchJobs.mockResolvedValue([{ id: 'job1' }]);

    render(<JobSearchForm />);

    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'Developer' } });

    const submitButton = screen.getByText('Lancer la recherche');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.location.href).toContain('/jobs?q=');
    });
  });

  it('deselects sources correctly', async () => {
    render(<JobSearchForm />);

    const linkedinCheckbox = screen.getByLabelText('LinkedIn Jobs');
    const indeedCheckbox = screen.getByLabelText('Indeed');
    const welcomeCheckbox = screen.getByLabelText('Welcome to the Jungle');

    // Deselect LinkedIn and Indeed
    fireEvent.click(linkedinCheckbox);
    fireEvent.click(indeedCheckbox);

    const titleInput = screen.getByPlaceholderText('ex: développeur react, designer UX...');
    fireEvent.change(titleInput, { target: { value: 'Developer' } });

    const submitButton = screen.getByText('Lancer la recherche');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(searchJobs).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: ['welcometothejungle'],
        })
      );
    });
  });

  it('disables submit button when no sources are selected', () => {
    render(<JobSearchForm />);

    const linkedinCheckbox = screen.getByLabelText('LinkedIn Jobs');
    const indeedCheckbox = screen.getByLabelText('Indeed');
    const welcomeCheckbox = screen.getByLabelText('Welcome to the Jungle');

    // Deselect all sources
    fireEvent.click(linkedinCheckbox);
    fireEvent.click(indeedCheckbox);
    fireEvent.click(welcomeCheckbox);

    const submitButton = screen.getByText('Lancer la recherche');
    expect(submitButton).toBeDisabled();
  });
});
