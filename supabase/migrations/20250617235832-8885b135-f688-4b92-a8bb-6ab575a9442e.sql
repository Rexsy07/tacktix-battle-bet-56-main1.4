
-- Add lobby_code and host_notes columns to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS host_notes TEXT,
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC DEFAULT 0;

-- Update the platform fee for existing matches (10% of entry fee)
UPDATE public.matches 
SET platform_fee = entry_fee * 0.10 
WHERE platform_fee = 0 OR platform_fee IS NULL;

-- Create a table for platform earnings
CREATE TABLE IF NOT EXISTS public.platform_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on platform_earnings
ALTER TABLE public.platform_earnings ENABLE ROW LEVEL SECURITY;

-- Create policies for platform_earnings (admin only access)
CREATE POLICY "Only admins can view platform earnings" 
  ON public.platform_earnings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_moderator = true
    )
  );

-- Create a trigger to automatically calculate platform fee on match creation/update
CREATE OR REPLACE FUNCTION public.calculate_platform_fee()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate 10% platform fee
  NEW.platform_fee = NEW.entry_fee * 0.10;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_platform_fee
  BEFORE INSERT OR UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_platform_fee();

-- Create a function to handle platform fee collection when match completes
CREATE OR REPLACE FUNCTION public.collect_platform_fee()
RETURNS TRIGGER AS $$
BEGIN
  -- Only collect fee when match status changes to completed and has a winner
  IF NEW.status = 'completed' AND NEW.winner_id IS NOT NULL AND OLD.status != 'completed' THEN
    INSERT INTO public.platform_earnings (match_id, amount)
    VALUES (NEW.id, NEW.platform_fee);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_collect_platform_fee
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.collect_platform_fee();

-- Add trigger to update updated_at timestamp
CREATE TRIGGER trigger_update_platform_earnings_updated_at
  BEFORE UPDATE ON public.platform_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles table to support full profile editing
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS favorite_game TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gaming_experience TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS preferred_game_modes TEXT[];

-- Enable users to update their own profiles
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Enable users to view their own profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow public viewing of basic profile info for leaderboards/matches
CREATE POLICY "Public can view basic profile info" 
  ON public.profiles 
  FOR SELECT 
  USING (true);
