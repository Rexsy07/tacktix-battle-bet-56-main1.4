
-- Fix the platform_earnings RLS policy to allow system inserts
DROP POLICY IF EXISTS "Only admins can view platform earnings" ON public.platform_earnings;

-- Create new policies for platform_earnings
CREATE POLICY "Only admins can view platform earnings" 
  ON public.platform_earnings 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_moderator = true
    )
  );

-- Allow system to insert platform earnings (for triggers)
CREATE POLICY "System can insert platform earnings" 
  ON public.platform_earnings 
  FOR INSERT 
  WITH CHECK (true);

-- Allow admins to manage platform earnings
CREATE POLICY "Admins can manage platform earnings" 
  ON public.platform_earnings 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_moderator = true
    )
  );

-- Update matches RLS policy to allow moderators to update any match
CREATE POLICY "Moderators can update any match" 
  ON public.matches 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_moderator = true
    )
  );

-- Allow moderators to update transactions (for deposit approval/rejection)
CREATE POLICY "Moderators can update transactions" 
  ON public.transactions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_moderator = true
    )
  );
