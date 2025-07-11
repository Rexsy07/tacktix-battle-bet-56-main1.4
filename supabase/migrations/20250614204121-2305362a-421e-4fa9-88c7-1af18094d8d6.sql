
-- First, let's check what status values are allowed and update the constraint
-- Drop the existing constraint that's causing issues
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;

-- Add a new constraint that allows the status values we're using
ALTER TABLE matches ADD CONSTRAINT matches_status_check 
CHECK (status IN ('open', 'pending', 'in_progress', 'active', 'completed', 'cancelled', 'disputed'));

-- Also check and fix game_mode constraint
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_game_mode_check;

-- Add constraint for game modes we're using
ALTER TABLE matches ADD CONSTRAINT matches_game_mode_check 
CHECK (game_mode IN ('search_destroy', 'hardpoint', 'domination', 'team_deathmatch', 'battle_royale', 'gunfight'));
