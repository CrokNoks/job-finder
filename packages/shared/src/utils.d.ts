export declare const searchMappings: {
    linkedin: (query: {
        poste: string;
        technologies: string[];
        excludeTerms: string[];
        location?: string;
        remoteOnly: boolean;
    }) => string;
    indeed: (query: {
        poste: string;
        technologies: string[];
        excludeTerms: string[];
        location?: string;
        remoteOnly: boolean;
    }) => string;
    welcometothejungle: (query: {
        poste: string;
        technologies: string[];
        excludeTerms: string[];
        location?: string;
        remoteOnly: boolean;
    }) => string;
};
export declare const delay: (ms: number) => Promise<unknown>;
export declare const cleanText: (text: string) => string;
export declare const extractSalary: (text: string) => {
    min?: number;
    max?: number;
    range?: string;
};
export declare const extractTechnologies: (text: string, techList: string[]) => string[];
//# sourceMappingURL=utils.d.ts.map