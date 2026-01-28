UPDATE public.courses
SET
  key_details = '[
    {
      "title": "Course Overview",
      "items": [
        "Duration: 5 Full Days (Intensive Training)",
        "Goal: To empower, uplift, and equip you with the skills to succeed in the nail industry"
      ]
    },
    {
      "title": "Training Location",
      "items": [
        "34 Horingbek Avenue, Helikonpark, Randfontein, Gauteng"
      ]
    },
    {
      "title": "What You Need to Bring",
      "items": [
        "Your own refreshments and lunch (coffee and tea will be provided daily)",
        "A practice hand (preferably a Habbil Hand - this is essential)",
        "An electric file (e-file) and a safety bit",
        "Two hand models: Day 4 model required for practical work; Day 5 model required for assessment"
      ]
    },
    {
      "title": "Exclusive Student Discount",
      "items": [
        "We have a shop inside the training studio",
        "10% discount on all product purchases during your training"
      ]
    },
    {
      "title": "Training Times - March 2026",
      "items": [
        "19 March 2026 (08:30-16:00)",
        "20 March 2026 (08:30-16:00)",
        "21 March 2026 (09:00-15:00)",
        "22 March 2026 (08:30-15:00)",
        "23 March 2026 (08:30-16:00)"
      ]
    },
    {
      "title": "Training Times - May/June 2026",
      "items": [
        "29 May 2026 (08:30-16:00)",
        "30 May 2026 (08:30-16:00)",
        "31 May 2026 (09:00-15:00)",
        "1 June 2026 (08:30-15:00)",
        "2 June 2026 (08:30-16:00)"
      ]
    }
  ]'::jsonb
WHERE slug = 'professional-acrylic-training';
