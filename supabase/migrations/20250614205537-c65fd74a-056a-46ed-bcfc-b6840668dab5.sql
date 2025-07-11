
-- Ensure the opponent_id column exists and is properly configured
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS opponent_id uuid REFERENCES auth.users(id);

-- Make sure the column allows NULL values (for matches without opponents yet)
ALTER TABLE public.matches 
ALTER COLUMN opponent_id DROP NOT NULL;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_matches_opponent_id ON public.matches(opponent_id);

-- Ensure the status constraint allows the values we're using
ALTER TABLE public.matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE public.matches ADD CONSTRAINT matches_status_check 
CHECK (status IN ('open', 'pending', 'in_progress', 'active', 'completed', 'cancelled', 'disputed'));
