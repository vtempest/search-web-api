
export interface EngineResult {
    url?: string;
    link?: string;
    title: string;
    content: string;
    thumbnail?: string;
    engine?: string;
}

export interface Engine {
    name: string;
    categories?: string[];
    request: (query: string, params?: any) => Promise<any>;
    response: (response: any) => Promise<EngineResult[]>;
}
