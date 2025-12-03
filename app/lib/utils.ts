
import * as cheerio from 'cheerio';

export function extractText(element: cheerio.Cheerio<any>): string {
    return element.text().trim().replace(/\s+/g, ' ');
}

export function getJson(text: string): any {
    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}
