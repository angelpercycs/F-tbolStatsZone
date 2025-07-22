
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });


export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
