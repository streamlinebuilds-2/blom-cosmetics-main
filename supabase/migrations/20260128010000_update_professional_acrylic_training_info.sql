UPDATE public.courses
SET
  title = 'Professional Acrylic Training',
  description = 'Master the art of acrylic nail application with hands-on training. Choose your kit, book your dates, and secure your spot with a deposit.',
  price = 7600,
  duration = '5 Full Days (Intensive Training)',
  deposit_amount = 1800.00,
  available_dates = '[
    "March 2026 (19-23 Mar)",
    "May/June 2026 (29 May-2 Jun)"
  ]'::jsonb,
  packages = '[
    {
      "name": "Standard",
      "price": 7600,
      "kit_value": 3200,
      "features": [
        "Prep & Primer",
        "Sculpting Forms (x300)",
        "Top Coat",
        "Colour Acrylic 15g",
        "Nude Acrylic 56g",
        "White Acrylic 56g",
        "Crystal Clear Acrylic 56g",
        "250ml Nail Liquid",
        "100% Kolinsky Brush",
        "Dappen Dish",
        "Training Manual",
        "Lint-Free Wipes",
        "Nail Cleanser 30ml",
        "Hand File & Buffer",
        "Cuticle Pusher",
        "Lifelong mentorship and modern techniques"
      ],
      "popular": false
    },
    {
      "name": "Deluxe",
      "price": 9900,
      "kit_value": 5100,
      "features": [
        "Prep & Primer",
        "Sculpting Forms (x300)",
        "Top Coat",
        "Colour Acrylic 15g",
        "Nude Acrylic 56g",
        "White Acrylic 56g",
        "Crystal Clear Acrylic 56g",
        "500ml Nail Liquid",
        "100% Kolinsky Brush",
        "Dappen Dish",
        "Training Manual",
        "Lint-Free Wipes",
        "Nail Cleanser 200ml",
        "Hand File & Buffer",
        "Unicorn Cuticle Pusher",
        "LED Lamp (x1)",
        "Electric File (x1)",
        "Safety Bit",
        "Box of Nail Tips",
        "Nail Glue",
        "Lifelong mentorship and modern techniques"
      ],
      "popular": true
    }
  ]'::jsonb,
  key_details = '[
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
    },
    {
      "title": "Deposit",
      "items": [
        "R1800 non-refundable deposit required to book your spot"
      ]
    }
  ]'::jsonb
WHERE slug = 'professional-acrylic-training';
