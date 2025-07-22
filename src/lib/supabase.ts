
import { createClient } from '@supabase/supabase-js';

// These values MUST be set in your .env file.
// The application will not work without them.
const supabaseUrl = 'https://hvpbekkmegtfrzgztfoy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cGJla2ttZWd0ZnJ6Z3p0Zm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjEwOTQsImV4cCI6MjA2NzczNzA5NH0.p809R9euvoMGgAng4WNnzbd_QtJiwCZQb6PgVPSF8PA';

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and Anon Key are not set. Please update your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
