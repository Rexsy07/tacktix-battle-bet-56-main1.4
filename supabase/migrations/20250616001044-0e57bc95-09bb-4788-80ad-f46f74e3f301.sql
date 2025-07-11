
-- First, let's see what policies exist on the matches table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'matches';

-- Create the update policy with better logic for joining matches
CREATE POLICY "Users can update their matches or join as opponent" 
  ON public.matches 
  FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    auth.uid() = host_id OR
    (opponent_id IS NULL AND status = 'pending')
  )
  WITH CHECK (
    auth.uid() = created_by OR 
    auth.uid() = host_id OR
    (opponent_id IS NULL AND status = 'pending') OR
    (auth.uid() = opponent_id)
  );
