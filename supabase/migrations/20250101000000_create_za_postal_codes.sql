-- Create za_postal_codes table for South African postal code lookup
CREATE TABLE IF NOT EXISTS za_postal_codes (
    id SERIAL PRIMARY KEY,
    suburb TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_za_postal_codes_suburb ON za_postal_codes(suburb);
CREATE INDEX IF NOT EXISTS idx_za_postal_codes_city ON za_postal_codes(city);
CREATE INDEX IF NOT EXISTS idx_za_postal_codes_province ON za_postal_codes(province);
CREATE INDEX IF NOT EXISTS idx_za_postal_codes_postal_code ON za_postal_codes(postal_code);

-- Create a composite index for suburb+city searches
CREATE INDEX IF NOT EXISTS idx_za_postal_codes_suburb_city ON za_postal_codes(suburb, city);

-- Enable Row Level Security (RLS)
ALTER TABLE za_postal_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for address autocomplete)
CREATE POLICY "Allow public read access to postal codes" ON za_postal_codes
    FOR SELECT USING (true);

-- Insert some sample data (you can import the full CSV later)
INSERT INTO za_postal_codes (suburb, city, province, postal_code) VALUES
('Sandton', 'Johannesburg', 'Gauteng', '2196'),
('Rosebank', 'Johannesburg', 'Gauteng', '2196'),
('Bryanston', 'Johannesburg', 'Gauteng', '2021'),
('Morningside', 'Sandton', 'Gauteng', '2057'),
('Fourways', 'Johannesburg', 'Gauteng', '2055'),
('Centurion', 'Pretoria', 'Gauteng', '0157'),
('Hatfield', 'Pretoria', 'Gauteng', '0083'),
('Sea Point', 'Cape Town', 'Western Cape', '8005'),
('Green Point', 'Cape Town', 'Western Cape', '8005'),
('Claremont', 'Cape Town', 'Western Cape', '7708'),
('Newlands', 'Cape Town', 'Western Cape', '7700'),
('Umhlanga', 'Umhlanga', 'KwaZulu-Natal', '4320'),
('Ballito', 'Ballito', 'KwaZulu-Natal', '4420'),
('Hillcrest', 'Hillcrest', 'KwaZulu-Natal', '3610'),
('Berea', 'Durban', 'KwaZulu-Natal', '4001'),
('Summerstrand', 'Port Elizabeth', 'Eastern Cape', '6001'),
('Richmond Hill', 'Port Elizabeth', 'Eastern Cape', '6001'),
('Bloemfontein', 'Bloemfontein', 'Free State', '9301'),
('Polokwane', 'Polokwane', 'Limpopo', '0700'),
('Nelspruit', 'Nelspruit', 'Mpumalanga', '1200')
ON CONFLICT DO NOTHING;
