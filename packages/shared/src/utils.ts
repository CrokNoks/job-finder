export const searchMappings = {
  linkedin: (query: {
    poste: string;
    technologies: string[];
    excludeTerms: string[];
    location?: string;
    remoteOnly: boolean;
  }) => {
    const terms = [
      `site:linkedin.com/jobs`,
      `"${query.poste}"`,
      ...query.technologies.map(tech => tech),
      ...query.excludeTerms.map(term => `-${term}`),
    ];

    if (query.location) {
      terms.push(query.location);
    }

    if (query.remoteOnly) {
      terms.push('+remote', '+télétravail');
    }

    return terms.join(' ');
  },

  indeed: (query: {
    poste: string;
    technologies: string[];
    excludeTerms: string[];
    location?: string;
    remoteOnly: boolean;
  }) => {
    const terms = [
      `site:indeed.com`,
      `"${query.poste}"`,
      ...query.technologies.map(tech => tech),
      ...query.excludeTerms.map(term => `-${term}`),
    ];

    if (query.location) {
      terms.push(query.location);
    }

    if (query.remoteOnly) {
      terms.push('+remote', '+télétravail');
    }

    return terms.join(' ');
  },

  welcometothejungle: (query: {
    poste: string;
    technologies: string[];
    excludeTerms: string[];
    location?: string;
    remoteOnly: boolean;
  }) => {
    const terms = [
      `site:welcometothejungle.com`,
      `"${query.poste}"`,
      ...query.technologies.map(tech => tech),
      ...query.excludeTerms.map(term => `-${term}`),
    ];

    if (query.location) {
      terms.push(query.location);
    }

    if (query.remoteOnly) {
      terms.push('+remote', '+télétravail');
    }

    return terms.join(' ');
  },
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const cleanText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\sÀ-ÿ]/g, '')
    .trim();
};

export const extractSalary = (text: string): { min?: number; max?: number; range?: string } => {
  const salaryRegex = /(\d{2,5})\s*[€k]?\s*(-?\s*\d{2,5})?\s*[€k]?\s*(an|jour|mois|hour|heure|year|month|day)?/gi;
  const match = text.match(salaryRegex);
  
  if (!match) return {};
  
  const [fullMatch, minStr, maxStr] = match;
  const min = parseInt(minStr);
  const max = maxStr ? parseInt(maxStr) : undefined;
  
  let range = fullMatch;
  if (min && max) {
    range = `${min}€ - ${max}€`;
  } else if (min) {
    range = `à partir de ${min}€`;
  }
  
  return { min, max, range };
};

export const extractTechnologies = (text: string, techList: string[]): string[] => {
  const lowerText = text.toLowerCase();
  return techList.filter(tech => 
    lowerText.includes(tech.toLowerCase())
  );
};