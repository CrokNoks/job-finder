"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTechnologies = exports.extractSalary = exports.cleanText = exports.delay = exports.searchMappings = void 0;
exports.searchMappings = {
    linkedin: (query) => {
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
    indeed: (query) => {
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
    welcometothejungle: (query) => {
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
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
const cleanText = (text) => {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\w\sÀ-ÿ]/g, '')
        .trim();
};
exports.cleanText = cleanText;
const extractSalary = (text) => {
    const salaryRegex = /(\d{2,5})\s*[€k]?\s*(-?\s*\d{2,5})?\s*[€k]?\s*(an|jour|mois|hour|heure|year|month|day)?/gi;
    const match = text.match(salaryRegex);
    if (!match)
        return {};
    const [fullMatch, minStr, maxStr] = match;
    const min = parseInt(minStr);
    const max = maxStr ? parseInt(maxStr) : undefined;
    let range = fullMatch;
    if (min && max) {
        range = `${min}€ - ${max}€`;
    }
    else if (min) {
        range = `à partir de ${min}€`;
    }
    return { min, max, range };
};
exports.extractSalary = extractSalary;
const extractTechnologies = (text, techList) => {
    const lowerText = text.toLowerCase();
    return techList.filter(tech => lowerText.includes(tech.toLowerCase()));
};
exports.extractTechnologies = extractTechnologies;
//# sourceMappingURL=utils.js.map