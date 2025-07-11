
-- Create forum groups table
CREATE TABLE public.forum_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create forum messages table
CREATE TABLE public.forum_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES forum_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create forum group members table
CREATE TABLE public.forum_group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES forum_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create announcements table
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_published BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
  game_mode TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournament participants table
CREATE TABLE public.tournament_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'checked_in', 'eliminated', 'withdrawn')),
  UNIQUE(tournament_id, user_id)
);

-- Add team_players column to matches table to track team composition
ALTER TABLE public.matches ADD COLUMN team_players INTEGER DEFAULT 1;

-- Update bank details table for deposits
CREATE TABLE public.bank_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_name TEXT NOT NULL DEFAULT 'PAYSTACK-TITAN',
  account_number TEXT NOT NULL DEFAULT '9851479231',
  account_name TEXT NOT NULL DEFAULT 'CHIPPERCASH/EZE ONYINYECHI',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default bank details
INSERT INTO public.bank_details (bank_name, account_number, account_name) 
VALUES ('PAYSTACK-TITAN', '9851479231', 'CHIPPERCASH/EZE ONYINYECHI');

-- Enable RLS on all new tables
ALTER TABLE public.forum_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

-- RLS policies for forum_groups
CREATE POLICY "Users can view all forum groups" ON public.forum_groups FOR SELECT USING (true);
CREATE POLICY "Users can create forum groups" ON public.forum_groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own forum groups" ON public.forum_groups FOR UPDATE USING (auth.uid() = created_by);

-- RLS policies for forum_messages
CREATE POLICY "Users can view messages in groups they're members of" ON public.forum_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM forum_group_members WHERE group_id = forum_messages.group_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages to groups they're members of" ON public.forum_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM forum_group_members WHERE group_id = forum_messages.group_id AND user_id = auth.uid())
);

-- RLS policies for forum_group_members
CREATE POLICY "Users can view group members" ON public.forum_group_members FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.forum_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.forum_group_members FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for announcements
CREATE POLICY "Users can view published announcements" ON public.announcements FOR SELECT USING (is_published = true);
CREATE POLICY "Moderators can manage announcements" ON public.announcements FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true)
);

-- RLS policies for tournaments
CREATE POLICY "Users can view tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Moderators can manage tournaments" ON public.tournaments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true)
);

-- RLS policies for tournament_participants
CREATE POLICY "Users can view tournament participants" ON public.tournament_participants FOR SELECT USING (true);
CREATE POLICY "Users can join tournaments" ON public.tournament_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can withdraw from tournaments" ON public.tournament_participants FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for bank_details
CREATE POLICY "Users can view bank details" ON public.bank_details FOR SELECT USING (true);
CREATE POLICY "Only moderators can manage bank details" ON public.bank_details FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_moderator = true)
);
