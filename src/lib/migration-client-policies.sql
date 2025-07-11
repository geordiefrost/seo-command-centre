-- Migration: Add missing client management policies
-- Run this if you previously ran the main database.sql script
-- This adds only the missing policies for client CRUD operations

-- Add missing client management policies (these were added after the initial schema)
CREATE POLICY "All users can insert clients" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "All users can update clients" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "All users can delete clients" ON clients FOR DELETE TO authenticated USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE tablename = 'clients';