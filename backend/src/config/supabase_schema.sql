-- ============================================================================
-- SHRI SEERVI SAMAJ KONDA — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Fully relational, normalized, indexed, and compatible with MongoDB datasets.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    name VARCHAR(50) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '["view"]'::jsonb,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VILLAGE INFORMATION TABLE
CREATE TABLE IF NOT EXISTS public.village_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    community_name VARCHAR(255) NOT NULL DEFAULT 'Shri Seervi Samaj Konda',
    village VARCHAR(100) NOT NULL DEFAULT 'Konda',
    tehsil VARCHAR(100) NOT NULL DEFAULT 'Kukshi',
    district VARCHAR(100) NOT NULL DEFAULT 'Dhar',
    state VARCHAR(100) NOT NULL DEFAULT 'Madhya Pradesh',
    pin_code VARCHAR(20) NOT NULL DEFAULT '454335',
    country VARCHAR(100) DEFAULT 'India',
    community_center TEXT,
    purpose TEXT,
    religious_tradition TEXT,
    main_spiritual_seat TEXT,
    community_heritage TEXT,
    known_surnames JSONB DEFAULT '["Barfa", "Kag", "Bhayal", "Pawar", "Solanki", "Choyal", "Padiyar", "Gehlot", "Agalcha", "Lacheta", "Rathore", "Chouhan", "Shinada", "Sencha"]'::jsonb,
    major_celebrations JSONB DEFAULT '[]'::jsonb,
    history TEXT,
    mission TEXT,
    vision TEXT,
    about TEXT,
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    photo TEXT,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('super_admin', 'admin', 'editor', 'member', 'visitor')),
    is_email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expire TIMESTAMPTZ,
    reset_password_token VARCHAR(255),
    reset_password_expire TIMESTAMPTZ,
    otp VARCHAR(20),
    otp_expire TIMESTAMPTZ,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    village_id UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    site_name VARCHAR(255) DEFAULT 'Shri Seervi Samaj Konda',
    site_tagline VARCHAR(255) DEFAULT 'Unity • Heritage • Progress',
    primary_color VARCHAR(50) DEFAULT '#7A2525',
    secondary_color VARCHAR(50) DEFAULT '#C85A17',
    accent_color VARCHAR(50) DEFAULT '#C9A44C',
    contact_email VARCHAR(255) DEFAULT 'contact@seervisamajkonda.org',
    contact_phone VARCHAR(50) DEFAULT '+91 98765 43210',
    address TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    maintenance_mode BOOLEAN DEFAULT FALSE,
    allow_registrations BOOLEAN DEFAULT TRUE,
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FAMILIES TABLE
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    family_id VARCHAR(100) UNIQUE NOT NULL,
    photo TEXT,
    head_of_family VARCHAR(255) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    address TEXT,
    village VARCHAR(100) DEFAULT 'Konda',
    tehsil VARCHAR(100) DEFAULT 'Kukshi',
    district VARCHAR(100) DEFAULT 'Dhar',
    state VARCHAR(100) DEFAULT 'Madhya Pradesh',
    pin_code VARCHAR(20) DEFAULT '454335',
    mobile_number VARCHAR(50),
    whatsapp_number VARCHAR(50),
    number_of_members INTEGER DEFAULT 0,
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAMILY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150),
    photo TEXT,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE,
    age INTEGER,
    blood_group VARCHAR(20) DEFAULT 'Unknown',
    education VARCHAR(255),
    occupation VARCHAR(255),
    company VARCHAR(255),
    business VARCHAR(255),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    village VARCHAR(100) DEFAULT 'Konda',
    tehsil VARCHAR(100) DEFAULT 'Kukshi',
    district VARCHAR(100) DEFAULT 'Dhar',
    state VARCHAR(100) DEFAULT 'Madhya Pradesh',
    pin_code VARCHAR(20) DEFAULT '454335',
    marital_status VARCHAR(50) DEFAULT 'single' CHECK (marital_status IN ('single', 'married', 'widowed', 'divorced')),
    skills JSONB DEFAULT '[]'::jsonb,
    achievements JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB DEFAULT '{}'::jsonb,
    social_media JSONB DEFAULT '{}'::jsonb,
    documents JSONB DEFAULT '[]'::jsonb,
    is_head_of_family BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deceased')),
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMMITTEES TABLE
CREATE TABLE IF NOT EXISTS public.committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    photo TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp VARCHAR(50),
    bio TEXT,
    order_num INTEGER DEFAULT 0,
    term_start DATE,
    term_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    type VARCHAR(50) DEFAULT 'committee' CHECK (type IN ('committee', 'sangathan', 'sankal_panch', 'women_committee')),
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORGANIZATIONS TABLE
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL DEFAULT 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
    level VARCHAR(50) DEFAULT 'state' CHECK (level IN ('national', 'state', 'district', 'tehsil', 'gram')),
    state VARCHAR(100) DEFAULT 'मध्यप्रदेश',
    country VARCHAR(100) DEFAULT 'भारत',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. GRAM UNITS TABLE (अखिल भारतीय सिर्वी महासभा मध्यप्रदेश — कोणदा ग्राम इकाई)
CREATE TABLE IF NOT EXISTS public.gram_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    organization_name VARCHAR(255) DEFAULT 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
    unit_name VARCHAR(255) NOT NULL DEFAULT 'कोणदा ग्राम इकाई',
    unit_type VARCHAR(100) DEFAULT 'ग्राम इकाई',
    village VARCHAR(100) NOT NULL DEFAULT 'कोणदा',
    tehsil VARCHAR(100) NOT NULL DEFAULT 'कुक्षी',
    district VARCHAR(100) NOT NULL DEFAULT 'धार',
    state VARCHAR(100) NOT NULL DEFAULT 'मध्यप्रदेश',
    country VARCHAR(100) NOT NULL DEFAULT 'भारत',
    formation_context TEXT DEFAULT 'नवीन मनोनयन प्रक्रिया',
    supervisor VARCHAR(255) DEFAULT 'हिरालालजी हम्मड कापसी',
    selection_method VARCHAR(255) DEFAULT 'सर्वसम्मति से',
    participants JSONB DEFAULT '["सिर्वी समाज सकल पंच", "समाज के नवयुवक", "समाज के वरिष्ठजन"]'::jsonb,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. GRAM UNIT MEMBERS & REPRESENTATIVES TABLE
CREATE TABLE IF NOT EXISTS public.gram_unit_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    gram_unit_id UUID REFERENCES public.gram_units(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (category IN ('office_bearer', 'member', 'representative')),
    designation VARCHAR(255) NOT NULL DEFAULT 'सदस्य',
    representative_level VARCHAR(50) DEFAULT 'none' CHECK (representative_level IN ('gram', 'tehsil', 'district', 'state', 'none')),
    organization_name VARCHAR(255) DEFAULT 'अखिल भारतीय सिर्वी महासभा मध्यप्रदेश',
    gram_unit_name VARCHAR(255) DEFAULT 'कोणदा ग्राम इकाई',
    tehsil VARCHAR(100) DEFAULT 'कुक्षी',
    district VARCHAR(100) DEFAULT 'धार',
    state VARCHAR(100) DEFAULT 'मध्यप्रदेश',
    phone VARCHAR(50) DEFAULT '',
    photo TEXT DEFAULT '',
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FORMATION EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.formation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    gram_unit_id UUID REFERENCES public.gram_units(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'कोणदा ग्राम इकाई गठन',
    event_type VARCHAR(255) DEFAULT 'ग्राम इकाई गठन / नवीन मनोनयन',
    location VARCHAR(255) DEFAULT 'ग्राम कोणदा, तहसील कुक्षी, मध्यप्रदेश',
    supervisor VARCHAR(255) DEFAULT 'हिरालालजी हम्मड कापसी',
    selection_method VARCHAR(255) DEFAULT 'सर्वसम्मति से',
    participants JSONB DEFAULT '["सिर्वी समाज सकल पंच", "समाज के नवयुवक", "समाज के वरिष्ठजन"]'::jsonb,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_type VARCHAR(50) DEFAULT 'upcoming' CHECK (event_type IN ('upcoming', 'ongoing', 'past')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(255) NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    registration_required BOOLEAN DEFAULT FALSE,
    registered_users JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NEWS TABLE
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image TEXT,
    category VARCHAR(50) DEFAULT 'news' CHECK (category IN ('news', 'announcement', 'notice', 'obituary')),
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ALBUMS & GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image TEXT,
    event_ref UUID REFERENCES public.events(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255),
    description TEXT,
    url TEXT NOT NULL,
    thumbnail TEXT,
    album_id UUID REFERENCES public.albums(id) ON DELETE SET NULL,
    event_ref UUID REFERENCES public.events(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('form', 'rules', 'history', 'report', 'other')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    downloads_count INTEGER DEFAULT 0,
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    donor_name VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    purpose VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'online')),
    transaction_id VARCHAR(255),
    receipt_number VARCHAR(100),
    is_anonymous BOOLEAN DEFAULT FALSE,
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. LEKHA JOKHA TABLE (आय-व्यय लेखा-जोखा)
CREATE TABLE IF NOT EXISTS public.lekha_jokha (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL CHECK (category IN ('aaiji_kosh', 'annapurna_bhavan', 'mandir_nirman', 'dharmik_karya', 'pratibha_samman')),
    date DATE DEFAULT CURRENT_DATE,
    person_name VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'other')),
    receipt_number VARCHAR(100),
    notes TEXT,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. PANCH SETTLEMENTS TABLE (पंच निर्णय एवं समाधान)
CREATE TABLE IF NOT EXISTS public.panch_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    parties TEXT NOT NULL,
    settlement_date DATE DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    panchs TEXT,
    documents JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'resolved' CHECK (status IN ('resolved', 'pending', 'ongoing')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. SOCIAL INFO TABLE (सामाजिक नियम, सुधार व परंपराएं)
CREATE TABLE IF NOT EXISTS public.social_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('rules', 'history', 'customs', 'reforms', 'general')),
    attachments JSONB DEFAULT '[]'::jsonb,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
    school VARCHAR(255),
    college VARCHAR(255),
    course VARCHAR(255),
    year VARCHAR(50),
    cgpa VARCHAR(50),
    achievements JSONB DEFAULT '[]'::jsonb,
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    owner_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    logo TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. BLOOD DONORS TABLE
CREATE TABLE IF NOT EXISTS public.blood_donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
    blood_group VARCHAR(20) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    village VARCHAR(100) DEFAULT 'Konda',
    availability VARCHAR(50) DEFAULT 'available' CHECK (availability IN ('available', 'unavailable', 'on_request')),
    last_donation_date DATE,
    village_ref UUID REFERENCES public.village_information(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. MARRIAGE PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.marriage_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    candidate_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female')),
    date_of_birth DATE NOT NULL,
    age INTEGER,
    height VARCHAR(50),
    complexion VARCHAR(50),
    blood_group VARCHAR(20),
    education VARCHAR(255),
    occupation VARCHAR(255),
    income VARCHAR(100),
    work_location VARCHAR(255),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    surname VARCHAR(100),
    gotra VARCHAR(100),
    address TEXT,
    village VARCHAR(100) DEFAULT 'Konda',
    contact_number VARCHAR(50),
    photos JSONB DEFAULT '[]'::jsonb,
    biodata_file TEXT,
    expectations TEXT,
    approval_status VARCHAR(50) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_id VARCHAR(64) UNIQUE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_families_family_id ON public.families(family_id);
CREATE INDEX IF NOT EXISTS idx_families_surname ON public.families(surname);
CREATE INDEX IF NOT EXISTS idx_families_status ON public.families(status);

CREATE INDEX IF NOT EXISTS idx_family_members_family ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_names ON public.family_members(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_family_members_blood_group ON public.family_members(blood_group);
CREATE INDEX IF NOT EXISTS idx_family_members_status ON public.family_members(status);

CREATE INDEX IF NOT EXISTS idx_gram_unit_members_category ON public.gram_unit_members(gram_unit_id, category, representative_level);
CREATE INDEX IF NOT EXISTS idx_committees_type ON public.committees(type, is_active);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON public.events(event_type, start_date);
CREATE INDEX IF NOT EXISTS idx_news_status_published ON public.news(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_lekha_jokha_type_cat ON public.lekha_jokha(type, category, date DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blood_donors_group ON public.blood_donors(blood_group, availability);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.village_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gram_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gram_unit_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lekha_jokha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panch_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active public portal content
CREATE POLICY "Public Read Village Info" ON public.village_information FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Read Organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Public Read Gram Units" ON public.gram_units FOR SELECT USING (true);
CREATE POLICY "Public Read Gram Unit Members" ON public.gram_unit_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Formation Events" ON public.formation_events FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Committees" ON public.committees FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read News" ON public.news FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Albums" ON public.albums FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Documents" ON public.documents FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Social Info" ON public.social_info FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Lekha Jokha" ON public.lekha_jokha FOR SELECT USING (true);
CREATE POLICY "Public Read Panch Settlements" ON public.panch_settlements FOR SELECT USING (true);
CREATE POLICY "Public Read Businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Public Read Blood Donors" ON public.blood_donors FOR SELECT USING (availability = 'available' OR availability = 'on_request');
CREATE POLICY "Public Read Active Families" ON public.families FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Active Members" ON public.family_members FOR SELECT USING (status = 'active');

-- Service Role has full bypass for administrative management
