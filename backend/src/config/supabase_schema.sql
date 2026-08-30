-- ============================================================================
-- SHRI SEERVI SAMAJ KONDA — COMPLETE PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Single, Canonical, Fully-Relational PostgreSQL Schema
-- Platform: Supabase PostgreSQL (Supports RLS, Dynamic RBAC, Auditing & Realtime)
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ROLES & PERMISSIONS TABLE (Dynamic RBAC)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,                          -- 'developer', 'super_admin', 'admin', 'treasurer', 'editor', 'member'
    display_name_en VARCHAR(100) NOT NULL,                     -- 'Developer / Super Admin', 'Treasurer / Cashier'
    display_name_hi VARCHAR(100) NOT NULL,                     -- 'डेवलपर / सुपर एडमिन', 'कोषाध्यक्ष / खजांची'
    permissions JSONB NOT NULL DEFAULT '["public:read"]'::jsonb, 
    -- Sample permissions: ["*", "families:read", "families:write", "donations:read", "donations:write", "news:write", "roles:manage"]
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,                      -- System roles cannot be deleted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS TABLE (Accounts, Staff, Family Heads & Developers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',                -- Cached role name for fast JWT lookups
    name VARCHAR(255) NOT NULL,                                -- Full name
    phone VARCHAR(20) UNIQUE NOT NULL,                         -- Primary login identifier
    email VARCHAR(255) UNIQUE,                                 -- Optional email
    password_hash VARCHAR(255) NOT NULL,                       -- Bcrypt password hash
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMPTZ,
    panchayat_family_id VARCHAR(50),                           -- Links to family if user is a Family Head
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);

-- ============================================================================
-- 3. VILLAGE INFORMATION TABLE (कोणदा गाँव एवं समाज इतिहास)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.village_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_name_en VARCHAR(255) NOT NULL DEFAULT 'Shri Seervi Samaj Konda',
    community_name_hi VARCHAR(255) NOT NULL DEFAULT 'श्री सीरवी समाज कोणदा',
    village_en VARCHAR(100) NOT NULL DEFAULT 'Konda',
    village_hi VARCHAR(100) NOT NULL DEFAULT 'कोणदा',
    tehsil_en VARCHAR(100) NOT NULL DEFAULT 'Kukshi',
    tehsil_hi VARCHAR(100) NOT NULL DEFAULT 'कुक्षी',
    district_en VARCHAR(100) NOT NULL DEFAULT 'Dhar',
    district_hi VARCHAR(100) NOT NULL DEFAULT 'धार',
    state_en VARCHAR(100) NOT NULL DEFAULT 'Madhya Pradesh',
    state_hi VARCHAR(100) NOT NULL DEFAULT 'मध्यप्रदेश',
    pin_code VARCHAR(20) NOT NULL DEFAULT '454335',
    country_en VARCHAR(100) DEFAULT 'India',
    country_hi VARCHAR(100) DEFAULT 'भारत',
    history_en TEXT,
    history_hi TEXT,
    spiritual_seat_en VARCHAR(255) DEFAULT 'Aai Mataji Bader & Akhand Jyot',
    spiritual_seat_hi VARCHAR(255) DEFAULT 'श्री आई माताजी बडेर एवं अखंड ज्योति',
    emergency_contacts JSONB DEFAULT '[]'::jsonb,
    known_gotras JSONB DEFAULT '["chouhan", "bhayal", "kag", "pawar", "solanki", "choyal", "padiyar", "gehlot", "agalcha", "lacheta", "rathore", "shinada", "barfa", "hammad", "sencha"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. FAMILIES TABLE (परिवार - जनगणना प्रपत्र हेडर)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    panchayat_family_id VARCHAR(50) UNIQUE NOT NULL,           -- "1", "2", "3" (Official Panchayat Census Number)
    gotra VARCHAR(100) NOT NULL,                               -- 'chouhan', 'bhayal', 'kag', 'pawar', etc.
    head_name VARCHAR(255) NOT NULL,                           -- Mukhiya Name: "Shantilal Mohan"
    head_mobile VARCHAR(20),                                   -- Mukhiya Phone: "7724878027"
    land_area_acres NUMERIC(8, 2) DEFAULT 0.00,                -- Agricultural Land: 3.00 (Acres)
    land_details_text VARCHAR(255),                            -- "03 Acres" / "03 एकड़"
    
    -- Address & Geography
    village VARCHAR(100) DEFAULT 'Konda',
    tehsil VARCHAR(100) DEFAULT 'Kukshi',
    district VARCHAR(100) DEFAULT 'Dhar',
    state VARCHAR(100) DEFAULT 'Madhya Pradesh',
    pin_code VARCHAR(20) DEFAULT '454335',
    faliya_or_ward VARCHAR(255),                               -- Local ward/faliya/neighborhood
    house_number VARCHAR(100),
    
    -- Metrics & Status
    total_members INTEGER DEFAULT 1,
    photo_url TEXT,
    qr_code_token VARCHAR(255) UNIQUE,                         -- Digital smart card token
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'migrated', 'inactive')),
    notes TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_families_panchayat_id ON public.families(panchayat_family_id);
CREATE INDEX idx_families_gotra ON public.families(gotra);
CREATE INDEX idx_families_head_mobile ON public.families(head_mobile);
CREATE INDEX idx_families_status ON public.families(status);

-- ============================================================================
-- 5. FAMILY MEMBERS TABLE (पारिवारिक सदस्य रिकॉर्ड्स)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
    member_number INTEGER NOT NULL,                            -- S.No on Census sheet (1, 2, 3, 4...)
    
    -- Names
    first_name VARCHAR(150) NOT NULL,                          -- "Shantilal", "Urmila", "Anil"
    last_name VARCHAR(150),                                    -- "Chouhan"
    full_name VARCHAR(255) NOT NULL,                           -- "Shantilal Mohan Chouhan"
    
    -- Relationship & Lineage
    relation_to_head VARCHAR(50) NOT NULL CHECK (relation_to_head IN (
        'self',             -- Mukhiya
        'spouse',           -- Wife / Husband
        'son',              -- Son
        'daughter',         -- Daughter
        'daughter_in_law',  -- Bahu (Wife of Son)
        'son_in_law',       -- Damad
        'father',           -- Father
        'mother',           -- Mother
        'brother',          -- Brother
        'sister',           -- Sister
        'grandson',         -- Pota
        'granddaughter',    -- Poti
        'other'
    )),
    relative_relation_type VARCHAR(20) NOT NULL DEFAULT 'father' CHECK (relative_relation_type IN ('father', 'husband')),
    relative_name VARCHAR(255) NOT NULL,                       -- Father or Husband's Name: "Mohan", "Shantilal"
    parent_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    spouse_member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    is_head BOOLEAN DEFAULT FALSE,
    
    -- Demographic Details
    dob DATE,                                                  -- "1981-01-01"
    approximate_age INTEGER,
    gender VARCHAR(20) DEFAULT 'male' CHECK (gender IN ('male', 'female', 'other')),
    education VARCHAR(150),                                    -- "6th", "8th", "Graduate", "B.Tech", "10th", "12th"
    occupation VARCHAR(150),                                   -- "tailoring", "shopkeeper", "agriculture", "student", "homemaker", "service", "business"
    mobile_number VARCHAR(20),
    
    -- Directory & Social Flags
    blood_group VARCHAR(20) DEFAULT 'unknown' CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown')),
    is_blood_donor BOOLEAN DEFAULT FALSE,
    marital_status VARCHAR(50) DEFAULT 'married' CHECK (marital_status IN ('single', 'married', 'widowed', 'divorced')),
    is_matrimonial_profile BOOLEAN DEFAULT FALSE,
    
    -- Lifecycle Tracking
    life_status VARCHAR(50) DEFAULT 'active' CHECK (life_status IN ('active', 'married_out', 'moved_away', 'deceased')),
    photo_url TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_family_member_seq UNIQUE (family_id, member_number)
);

CREATE INDEX idx_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_members_full_name ON public.family_members(full_name);
CREATE INDEX idx_members_mobile ON public.family_members(mobile_number);
CREATE INDEX idx_members_blood_group ON public.family_members(blood_group);
CREATE INDEX idx_members_occupation ON public.family_members(occupation);
CREATE INDEX idx_members_spouse ON public.family_members(spouse_member_id);

-- ============================================================================
-- 6. DONATIONS & YEARLY CHANDA TABLE (वार्षिक चंदा एवं दान व्यवस्था)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    
    -- Donor Snapshot
    donor_name VARCHAR(255) NOT NULL,                          -- "Shantilal Mohan Chouhan"
    panchayat_family_id VARCHAR(50),                           -- "1"
    gotra VARCHAR(100),                                        -- "chouhan"
    mobile_number VARCHAR(20),                                 -- "7724878027"
    
    -- Financials & Purpose
    financial_year INTEGER NOT NULL,                           -- 2024, 2025, 2026 (Year of Chanda)
    amount NUMERIC(12, 2) NOT NULL,                            -- 1100.00
    currency VARCHAR(10) DEFAULT 'INR',
    purpose VARCHAR(100) NOT NULL DEFAULT 'annual_chanda' CHECK (purpose IN (
        'annual_chanda',       -- Annual Samaj Membership Chanda
        'aaiji_kosh',           -- Shri Aaiji Sahayata Kosh
        'annapurna_bhavan',     -- Maa Annapurna Bhavan Construction Fund
        'mandir_nirman',        -- Temple Maintenance & Development
        'melava_utsav',         -- Annual Melava / Padyatra / Festival
        'education_fund',       -- Student Scholarship Fund
        'other'
    )),
    
    -- Payment Details (Cashier/Operator or Online Gateway)
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'cash' CHECK (payment_mode IN (
        'cash', 'upi_qr', 'bank_transfer', 'cheque', 'online_gateway'
    )),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (payment_status IN (
        'confirmed', 'pending', 'failed', 'refunded'
    )),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Physical Receipt Book & Treasurer Audit
    receipt_number VARCHAR(100) UNIQUE,                        -- "KONDA-2026-0001"
    receipt_book_number VARCHAR(100),                          -- Physical book serial (e.g. "Book-4")
    collected_by_name VARCHAR(255),                            -- "Kailash Agalcha (Treasurer)"
    collected_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Future Online Payment Gateway Metadata
    payment_gateway VARCHAR(50),                               -- 'razorpay', 'phonepe', etc.
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(255),
    
    -- Audit & Edit History
    edit_history JSONB DEFAULT '[]'::jsonb,                    -- Tracks [{ modified_at, modified_by, old_amount, new_amount, reason }]
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_family_id ON public.donations(family_id);
CREATE INDEX idx_donations_year ON public.donations(financial_year);
CREATE INDEX idx_donations_purpose ON public.donations(purpose);
CREATE INDEX idx_donations_receipt ON public.donations(receipt_number);
CREATE INDEX idx_donations_gateway_pid ON public.donations(gateway_payment_id);

-- ============================================================================
-- 7. COMMITTEES TABLE (कार्यकारिणी, महिला समिति, युवा संगठन, ग्राम इकाई)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.committees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,                                -- "Sunil Pannalal Bhayal"
    designation VARCHAR(255) NOT NULL,                         -- "President", "Secretary", "Treasurer", "Member"
    committee_type VARCHAR(50) NOT NULL CHECK (committee_type IN (
        'konda_gram_unit',    -- कोणदा ग्राम इकाई
        'women_committee',    -- श्री आई जी महिला समिती
        'sankal_panch',       -- सकल पंच
        'yuva_sangathan',     -- सिर्वी समाज युवा संगठन
        'sahayata_kosh',      -- श्री आई जी सहायता कोष समिति
        'bhavan_samiti',      -- माँ अन्नपूर्णा भवन समिति
        'executive_body'      -- सामान्य कार्यकारिणी
    )),
    phone VARCHAR(50),
    email VARCHAR(255),
    photo_url TEXT,
    order_priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_committees_type ON public.committees(committee_type, is_active);

-- ============================================================================
-- 8. NEWS & ANNOUNCEMENTS TABLE (समाचार एवं सूचनाएं)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(50) DEFAULT 'news' CHECK (category IN ('news', 'announcement', 'notice', 'obituary', 'social')),
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    author_name VARCHAR(255) DEFAULT 'Shri Seervi Samaj Konda',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_status ON public.news(status, published_at DESC);

-- ============================================================================
-- 9. EVENTS TABLE (कार्यक्रम एवं महोत्सव)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_type VARCHAR(50) DEFAULT 'upcoming' CHECK (event_type IN ('upcoming', 'ongoing', 'past')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(255) NOT NULL DEFAULT 'Shri Aaiji Bader Parisar, Konda',
    images JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON public.events(event_type, start_date);

-- ============================================================================
-- 10. GALLERY & ALBUMS TABLE (फोटो गैलरी)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    photo_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
    title VARCHAR(255),
    photo_url TEXT NOT NULL,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. DOCUMENTS TABLE (परिपत्र, नियम एवं फॉर्म्स)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) DEFAULT 'pdf',
    category VARCHAR(50) DEFAULT 'circular' CHECK (category IN ('circular', 'census_form', 'rules', 'history', 'report', 'other')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    downloads_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. LEKHA JOKHA TABLE (आय-व्यय लेखा-जोखा)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.lekha_jokha (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL CHECK (category IN ('aaiji_kosh', 'annapurna_bhavan', 'mandir_nirman', 'dharmik_karya', 'pratibha_samman', 'general')),
    entry_date DATE DEFAULT CURRENT_DATE,
    person_name VARCHAR(255),
    payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque', 'other')),
    receipt_or_bill_no VARCHAR(100),
    notes TEXT,
    recorded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lekha_jokha ON public.lekha_jokha(entry_type, category, entry_date DESC);

-- ============================================================================
-- 13. PANCH SETTLEMENTS TABLE (पंच निर्णय एवं समाधान)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.panch_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- ============================================================================
-- 14. BLOOD DONORS DIRECTORY TABLE (रक्तदान निर्देशिका)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.blood_donors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    blood_group VARCHAR(10) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    phone VARCHAR(20) NOT NULL,
    village VARCHAR(100) DEFAULT 'Konda',
    last_donated_date DATE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_blood_donors_bg ON public.blood_donors(blood_group, is_available);

-- ============================================================================
-- 15. MARRIAGE PROFILES TABLE (वैवाहिक बायोडाटा निर्देशिका)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.marriage_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES public.family_members(id) ON DELETE SET NULL,
    candidate_name VARCHAR(255) NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female')),
    dob DATE NOT NULL,
    height VARCHAR(50),
    education VARCHAR(255) NOT NULL,
    occupation VARCHAR(255) NOT NULL,
    income_details VARCHAR(100),
    gotra VARCHAR(100) NOT NULL,
    nanihal_gotra VARCHAR(100),
    father_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    address TEXT,
    photo_urls JSONB DEFAULT '[]'::jsonb,
    biodata_pdf_url TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'married', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 16. AUDIT & ACTIVITY LOGS TABLE (सुरक्षा एवं ऑडिट लॉग्स)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,                             -- 'DONATION_CREATE', 'FAMILY_UPDATE', 'ROLE_CHANGE'
    module VARCHAR(50) NOT NULL,                              -- 'donations', 'families', 'users'
    target_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_date ON public.activity_logs(created_at DESC);

-- ============================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lekha_jokha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.panch_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marriage_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ ACCESS (Curated active public records)
CREATE POLICY "Public Read Village Info" ON public.village_information FOR SELECT USING (true);
CREATE POLICY "Public Read Active Families" ON public.families FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Active Family Members" ON public.family_members FOR SELECT USING (life_status = 'active');
CREATE POLICY "Public Read Active Committees" ON public.committees FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Published News" ON public.news FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Published Events" ON public.events FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Active Albums" ON public.albums FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Gallery Photos" ON public.gallery_photos FOR SELECT USING (true);
CREATE POLICY "Public Read Active Documents" ON public.documents FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Available Blood Donors" ON public.blood_donors FOR SELECT USING (is_available = true);
CREATE POLICY "Public Read Active Marriage Profiles" ON public.marriage_profiles FOR SELECT USING (status = 'active');
CREATE POLICY "Public Read Lekha Jokha" ON public.lekha_jokha FOR SELECT USING (true);
CREATE POLICY "Public Read Panch Settlements" ON public.panch_settlements FOR SELECT USING (status = 'resolved');

-- SERVICE ROLE (Full bypass for backend Express API with service key)
