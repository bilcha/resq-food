-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    google_place_id TEXT,
    google_rating DECIMAL(2, 1),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    image_url TEXT,
    available_from TIMESTAMP WITH TIME ZONE,
    available_until TIMESTAMP WITH TIME ZONE,
    quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_businesses_firebase_uid ON businesses(firebase_uid);
CREATE INDEX idx_businesses_location ON businesses(latitude, longitude);
CREATE INDEX idx_businesses_active ON businesses(is_active);
CREATE INDEX idx_listings_business_id ON listings(business_id);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_active_approved ON listings(is_active, is_approved);
CREATE INDEX idx_listings_available_times ON listings(available_from, available_until);

-- Create RLS (Row Level Security) policies
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policy for businesses: users can only see active businesses
CREATE POLICY "Public can view active businesses" ON businesses
    FOR SELECT USING (is_active = true);

-- Policy for businesses: users can only update their own business
CREATE POLICY "Users can update own business" ON businesses
    FOR UPDATE USING (firebase_uid = auth.uid());

-- Policy for listings: public can view active and approved listings
CREATE POLICY "Public can view active approved listings" ON listings
    FOR SELECT USING (is_active = true AND is_approved = true);

-- Policy for listings: businesses can manage their own listings
CREATE POLICY "Businesses can manage own listings" ON listings
    FOR ALL USING (
        business_id IN (
            SELECT id FROM businesses WHERE firebase_uid = auth.uid()
        )
    );

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Create RLS policy for storage
CREATE POLICY "Public can view images" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 