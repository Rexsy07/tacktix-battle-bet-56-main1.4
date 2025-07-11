
-- Create table for storing match result evidence (screenshots/videos)
CREATE TABLE public.match_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evidence_url TEXT NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('image', 'video')),
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for match result submissions
CREATE TABLE public.match_result_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  result_type TEXT NOT NULL CHECK (result_type IN ('win', 'loss', 'draw')),
  winner_id UUID REFERENCES auth.users(id),
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Create table for player reports/disputes
CREATE TABLE public.player_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('cheating', 'toxic_behavior', 'poor_sportsmanship', 'no_show', 'other')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  resolution TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.match_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_result_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for match_evidence
CREATE POLICY "Users can view evidence for matches they participated in"
  ON public.match_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_evidence.match_id 
      AND (m.host_id = auth.uid() OR m.opponent_id = auth.uid() OR m.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can submit evidence for their matches"
  ON public.match_evidence FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_evidence.match_id 
      AND (m.host_id = auth.uid() OR m.opponent_id = auth.uid() OR m.created_by = auth.uid())
    )
  );

-- RLS Policies for match_result_submissions
CREATE POLICY "Users can view results for matches they participated in"
  ON public.match_result_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_result_submissions.match_id 
      AND (m.host_id = auth.uid() OR m.opponent_id = auth.uid() OR m.created_by = auth.uid())
    )
  );

CREATE POLICY "Users can submit results for their matches"
  ON public.match_result_submissions FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_result_submissions.match_id 
      AND (m.host_id = auth.uid() OR m.opponent_id = auth.uid() OR m.created_by = auth.uid())
    )
  );

-- RLS Policies for player_reports
CREATE POLICY "Users can view reports they made or reports about them"
  ON public.player_reports FOR SELECT
  USING (auth.uid() = reported_by OR auth.uid() = reported_user);

CREATE POLICY "Users can create reports"
  ON public.player_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reported_by AND
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = player_reports.match_id 
      AND (m.host_id = auth.uid() OR m.opponent_id = auth.uid() OR m.created_by = auth.uid())
    )
  );

-- Create storage bucket for match evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('match-evidence', 'match-evidence', true);

-- Storage policies for match evidence bucket
CREATE POLICY "Users can upload evidence for their matches"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'match-evidence' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view evidence"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'match-evidence');
