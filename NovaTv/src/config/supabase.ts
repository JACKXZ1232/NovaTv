import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://wbmblunvgecvjfrfzsot.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibWJsdW52Z2VjdmpmcmZ6c290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjg5OTIsImV4cCI6MjA5NzY0NDk5Mn0.heMVncLo6rX4LdQO-UijudO68EmawOpmEjfaq5AEJnM'
);
