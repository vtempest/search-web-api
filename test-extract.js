import grab from 'grab-url';

// Test with HTML
const result = await grab('https://www.google.com/search?q=test&gbv=1', {
    headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html'
    },
    responseType: 'text'
});

console.log('Result type:', typeof result);
console.log('Result.data type:', typeof result.data);
console.log('Has "data" property:', 'data' in result);
console.log('Result.data is string:', typeof result.data === 'string');

// The extract function
function extractResponseData(response) {
    if (!response) return '';
    if (typeof response === 'string') return response;
    if ('data' in response) {
        const data = response.data;
        if (typeof data === 'string') return data;
        if (typeof data === 'object') return data;
        return data;
    }
    return response;
}

const extracted = extractResponseData(result);
console.log('Extracted type:', typeof extracted);
console.log('Extracted is string:', typeof extracted === 'string');
console.log('Extracted has indexOf:', typeof extracted?.indexOf === 'function');
