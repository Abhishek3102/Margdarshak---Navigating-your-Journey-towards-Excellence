-- Run this command in the SQL Editor to force Supabase (PostgREST) to refresh its knowledge of your specific database columns.

NOTIFY pgrst, 'reload schema';

-- After running this, wait 5 seconds and try your App again.
