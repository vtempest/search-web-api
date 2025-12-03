
import { google } from './app/engines/google.js';
import * as fs from 'fs';

async function test() {
    console.log('Testing Google Engine...');
    try {
        const requestResult = await google.request('test');
        fs.writeFileSync('google.html', requestResult);
        const results = await google.response(requestResult);
        console.log('Results:', results);
    } catch (error) {
        console.error('Error:', error);
    }
}

test();
