
-- Update the game mode constraint to include all the modes we're using
ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_game_mode_check;

ALTER TABLE matches ADD CONSTRAINT matches_game_mode_check 
CHECK (game_mode IN ('search_destroy', 'hardpoint', 'domination', 'team_deathmatch', 'battle_royale', 'gunfight'));
