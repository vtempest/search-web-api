
export function extractText(element: any): string {
    const text = element.textContent || element.innerText || '';
    return text.trim().replace(/\s+/g, ' ');
}

export function getJson(text: string): any {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}
