
-- Fix RLS policies for wallets table to allow users to manage their own wallets

-- First, let's drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can insert their own wallet" ON public.wallets;

-- Create proper RLS policies for wallets
CREATE POLICY "Users can view their own wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

-- Also ensure the handle_new_user_wallet function can insert wallets
CREATE POLICY "System can create wallets for new users" ON public.wallets
  FOR INSERT WITH CHECK (true);
