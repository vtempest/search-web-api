
export interface EngineResult {
    url?: string;
    link?: string;
    title: string;
    content: string;
    thumbnail?: string;
    engine?: string;
    iframe_src?: string;
    author?: string;
    latitude?: number;
    longitude?: number;
    img_src?: string;
    publishedDate?: string;
    category?: string;
    template?: string;
}

export interface Engine {
    name: string;
    categories?: string[];
    request: (query: string, params?: any) => Promise<any>;
    response: (response: any) => Promise<EngineResult[]>;
}

/**
 * Extract the actual data from a grab-url response
 * grab-url returns { data: actualContent, error?: string } or just the data directly
 */
export function extractResponseData(response: any): any {
    // If response is null/undefined, return empty string
    if (!response) return '';

    // If response is already a string, return it
    if (typeof response === 'string') return response;

    // If response has an error property, it's an error response
    if (typeof response === 'object' && 'error' in response) {
        // Return empty string/object to allow graceful handling
        return '';
    }

    // If response has a data property, extract it
    if ('data' in response) {
        return response.data;
    }

    // Otherwise return the response as-is (for JSON responses that are already spread)
    return response;
}
