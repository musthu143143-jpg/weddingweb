-- Add the interactive opening field to an existing Templates table.
-- Run this once in Supabase SQL Editor for projects created before opening
-- animations were added. It is safe to run more than once.
alter table if exists public.templates
  add column if not exists opening text;
