-- Content Bank v2 Migration
-- Adds new columns for post categories and psychology triggers

-- First, add new columns to content_calendar_days for the bank structure
ALTER TABLE public.content_calendar_days 
ADD COLUMN IF NOT EXISTS post_category TEXT DEFAULT 'clickbait',
ADD COLUMN IF NOT EXISTS post_number INTEGER DEFAULT 1;

-- Create comment explaining post categories
COMMENT ON COLUMN public.content_calendar_days.post_category IS 'Post category: clickbait, engagement, authority, thread, sales, relatable';

-- Add unhinged_mode column to content_calendars
ALTER TABLE public.content_calendars
ADD COLUMN IF NOT EXISTS unhinged_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audience_level TEXT DEFAULT 'intermediate';

-- Update comment on calendars
COMMENT ON COLUMN public.content_calendars.unhinged_mode IS 'When true, generates bolder, more controversial content';
COMMENT ON COLUMN public.content_calendars.audience_level IS 'beginner, intermediate, or advanced';