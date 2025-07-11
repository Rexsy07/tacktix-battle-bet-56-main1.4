
-- Enable realtime for matches table
ALTER TABLE matches REPLICA IDENTITY FULL;

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
