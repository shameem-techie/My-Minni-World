import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig?.extra ?? {};

export const supabase = createClient(
    supabaseUrl ?? 'https://REPLACE_WITH_YOUR_PROJECT.supabase.co',
    supabaseAnonKey ?? 'REPLACE_WITH_YOUR_ANON_KEY',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    },
);

export default supabase;
