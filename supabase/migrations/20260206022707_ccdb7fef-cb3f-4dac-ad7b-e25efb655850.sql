-- Drop the old unique constraint that only allows one row per day
ALTER TABLE public.content_calendar_days 
DROP CONSTRAINT IF EXISTS content_calendar_days_calendar_id_day_number_key;

-- Create new unique constraint that allows multiple posts per day (using post_number)
ALTER TABLE public.content_calendar_days 
ADD CONSTRAINT content_calendar_days_calendar_day_post_key 
UNIQUE (calendar_id, day_number, post_number);