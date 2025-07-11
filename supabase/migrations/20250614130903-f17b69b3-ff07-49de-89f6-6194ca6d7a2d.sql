
-- First, let's add missing columns to the matches table to support the matchmaking system
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS host_id uuid REFERENCES auth.users(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS opponent_id uuid REFERENCES auth.users(id);
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS bet_amount numeric DEFAULT 0;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS map_name text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS lobby_code text;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS team_size text DEFAULT '1v1';
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_vip_match boolean DEFAULT false;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS match_started boolean DEFAULT false;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS match_started_at timestamp with time zone;

-- Create wallets table for user balances
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Add admin_notes column to disputes table
ALTER TABLE public.disputes ADD COLUMN IF NOT EXISTS admin_notes text;

-- Create match_result_submissions table for tracking match results
CREATE TABLE IF NOT EXISTS public.match_result_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  submitted_by uuid REFERENCES auth.users(id) NOT NULL,
  result_type text NOT NULL CHECK (result_type IN ('win', 'loss', 'draw', 'dispute')),
  winner_id uuid REFERENCES auth.users(id),
  proof_urls text[],
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_result_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for wallets
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for match result submissions
CREATE POLICY "Users can view match results they're involved in" ON public.match_result_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = match_id 
      AND (host_id = auth.uid() OR opponent_id = auth.uid())
    )
  );

CREATE POLICY "Users can submit results for their matches" ON public.match_result_submissions
  FOR INSERT WITH CHECK (
    auth.uid() = submitted_by 
    AND EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = match_id 
      AND (host_id = auth.uid() OR opponent_id = auth.uid())
    )
  );

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create wallet for new users
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();

-- Update matches table to use proper foreign keys
UPDATE public.matches SET host_id = created_by WHERE host_id IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_host_id ON public.matches(host_id);
CREATE INDEX IF NOT EXISTS idx_matches_opponent_id ON public.matches(opponent_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
