
-- Fix the function to update player ratings in profiles
CREATE OR REPLACE FUNCTION public.update_player_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the rated player's average rating using correct column name
  UPDATE public.profiles 
  SET rating = (
    SELECT ROUND(AVG(rating))
    FROM public.player_ratings 
    WHERE rated_id = NEW.rated_id
  )
  WHERE id = NEW.rated_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger to update ratings
DROP TRIGGER IF EXISTS trigger_update_rating ON public.player_ratings;
CREATE TRIGGER trigger_update_rating
  AFTER INSERT OR UPDATE ON public.player_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_player_rating();
