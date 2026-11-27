-- Migration: Fix news table category check constraint
-- Author: shriseervisamajkonda@gmail.com
-- Purpose: Update news_category_check to support all UI categories ('news', 'announcement', 'notice', 'emergency', 'update', 'obituary', 'social', 'general')

ALTER TABLE public.news DROP CONSTRAINT IF EXISTS news_category_check;

ALTER TABLE public.news ADD CONSTRAINT news_category_check 
CHECK (category IN ('news', 'announcement', 'notice', 'emergency', 'update', 'obituary', 'social', 'general'));
