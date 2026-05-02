import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://tdiohgpicenfhwyiytwu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkaW9oZ3BpY2VuZmh3eWl5dHd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTQ0NjYsImV4cCI6MjA5MzMzMDQ2Nn0.52JDFQac2OFucny6GZ7UUSgfHKZkZCDkZWJCflWGY4M';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
