-- ==========================================================
-- SHRI SEERVI SAMAJ KONDA — SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    state VARCHAR(100) DEFAULT 'मध्यप्रदेश',
    country VARCHAR(100) DEFAULT 'भारत',
    code VARCHAR(50) UNIQUE DEFAULT 'ABSM_MP',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Gram Units Table (e.g. Konda Gram Unit)
CREATE TABLE IF NOT EXISTS gram_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    village VARCHAR(100) DEFAULT 'कोणदा',
    tehsil VARCHAR(100) DEFAULT 'कुक्षी',
    district VARCHAR(100) DEFAULT 'धार',
    state VARCHAR(100) DEFAULT 'मध्यप्रदेश',
    country VARCHAR(100) DEFAULT 'भारत',
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    organization_name VARCHAR(255) DEFAULT 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
    formation_process VARCHAR(100) DEFAULT 'नवीन मनोनयन प्रक्रिया',
    selection_method VARCHAR(100) DEFAULT 'सर्वसम्मति से',
    official_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Formation Events Table
CREATE TABLE IF NOT EXISTS formation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gram_unit_id UUID REFERENCES gram_units(id) ON DELETE CASCADE,
    supervisor_name VARCHAR(255) DEFAULT 'हिरालालजी हम्मड कापसी',
    supervisor_role VARCHAR(255) DEFAULT 'नियुक्त पर्यवेक्षक',
    selection_type VARCHAR(100) DEFAULT 'सर्वसम्मति से',
    attendees TEXT[] DEFAULT ARRAY['सिर्वी समाज सकल पंच', 'समाज के नवयुवक', 'समाज के वरिष्ठजन'],
    formation_context TEXT,
    event_date DATE,
    venue VARCHAR(255) DEFAULT 'ग्राम कोणदा, तहसील कुक्षी, जिला धार',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Gram Unit Members (Office bearers, members, representatives)
CREATE TABLE IF NOT EXISTS gram_unit_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gram_unit_id UUID REFERENCES gram_units(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    father_or_husband_name VARCHAR(255),
    surname VARCHAR(100),
    category VARCHAR(50) NOT NULL CHECK (category IN ('office_bearer', 'member', 'representative')),
    designation VARCHAR(100) NOT NULL,
    representative_level VARCHAR(50) CHECK (representative_level IN ('tehsil', 'district', 'state', NULL)),
    order_index INTEGER DEFAULT 0,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Committee Table (General, Annapurna, Women, Sahayata Kosh)
CREATE TABLE IF NOT EXISTS committee (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    photo TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    whatsapp VARCHAR(20),
    bio TEXT,
    order_index INTEGER DEFAULT 0,
    term_start DATE,
    term_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    type VARCHAR(50) DEFAULT 'committee' CHECK (type IN ('committee', 'sangathan', 'sankal_panch', 'women_committee', 'annapurna_bhavan', 'sahayata_kosh')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'member', 'admin', 'super_admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Families Table
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_head_name VARCHAR(255) NOT NULL,
    gotra VARCHAR(100),
    address TEXT,
    village VARCHAR(100) DEFAULT 'कोणदा',
    contact_number VARCHAR(20),
    total_members INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. News & Announcements Table
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) DEFAULT 'सामान्य',
    author VARCHAR(100) DEFAULT 'सिर्वी समाज कोणदा',
    image TEXT,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255) DEFAULT 'कोणदा',
    image TEXT,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Blood Donors Table
CREATE TABLE IF NOT EXISTS blood_donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    village VARCHAR(100) DEFAULT 'कोणदा',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gram_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gram_unit_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_donors ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access for all active community records
CREATE POLICY "Public Read Organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public Read Gram Units" ON gram_units FOR SELECT USING (true);
CREATE POLICY "Public Read Formation Events" ON formation_events FOR SELECT USING (true);
CREATE POLICY "Public Read Gram Unit Members" ON gram_unit_members FOR SELECT USING (true);
CREATE POLICY "Public Read Committee" ON committee FOR SELECT USING (true);
CREATE POLICY "Public Read News" ON news FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Events" ON events FOR SELECT USING (true);
CREATE POLICY "Public Read Blood Donors" ON blood_donors FOR SELECT USING (is_available = true);
