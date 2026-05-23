-- =====================================================
-- Poolcrest LLC - Database Schema
-- Version: 2.0
-- Generated from Django Models
-- =====================================================

-- Note: This schema is for reference and documentation.
-- Django will create the actual database tables through migrations.

-- =====================================================
-- Core User Tables
-- =====================================================

-- Users (Django Auth User extended)
CREATE TABLE auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'technician', 'customer')) DEFAULT 'customer',
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
    avatar_url TEXT,
    address TEXT,
    company_name VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    language_preference VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{}',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    customer_since DATE,
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    internal_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth_users(id) ON DELETE CASCADE,
    session_key VARCHAR(40) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- Property Management Tables
-- =====================================================

-- Customer Properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_name VARCHAR(255),
    property_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Address fields
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'US',
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    
    -- Pool information
    pool_type VARCHAR(20) DEFAULT 'chlorine',
    pool_size VARCHAR(20) DEFAULT 'medium',
    pool_volume_gallons INTEGER,
    pool_length_feet DECIMAL(5, 1),
    pool_width_feet DECIMAL(5, 1),
    pool_depth_shallow_feet DECIMAL(4, 1),
    pool_depth_deep_feet DECIMAL(4, 1),
    pool_features JSONB DEFAULT '[]',
    equipment_info JSONB DEFAULT '{}',
    
    -- Access information
    gate_code VARCHAR(20),
    access_instructions TEXT,
    key_location VARCHAR(255),
    parking_instructions TEXT,
    
    -- Property details
    is_primary BOOLEAN DEFAULT FALSE,
    is_rental BOOLEAN DEFAULT FALSE,
    has_pets BOOLEAN DEFAULT FALSE,
    pet_notes TEXT,
    
    -- Service preferences
    preferred_service_day VARCHAR(20),
    preferred_service_time VARCHAR(20),
    service_frequency VARCHAR(20) DEFAULT 'weekly',
    chemical_preferences JSONB DEFAULT '{}',
    
    -- Status and tracking
    is_active BOOLEAN DEFAULT TRUE,
    inactive_reason TEXT,
    last_service_date TIMESTAMP WITH TIME ZONE,
    next_service_date TIMESTAMP WITH TIME ZONE,
    total_services INTEGER DEFAULT 0,
    
    -- Common fields
    notes TEXT,
    internal_notes TEXT,
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    created_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    updated_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL
);

-- Property Photos
CREATE TABLE property_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    photo VARCHAR(255) NOT NULL,
    photo_type VARCHAR(50) DEFAULT 'pool_overview',
    caption VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    taken_date TIMESTAMP WITH TIME ZONE,
    created_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Property Notes
CREATE TABLE property_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    note_type VARCHAR(50) DEFAULT 'general',
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_alert BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Service Areas
CREATE TABLE service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    zip_codes JSONB DEFAULT '[]',
    travel_fee DECIMAL(10, 2) DEFAULT 0.00,
    price_modifier DECIMAL(4, 2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    max_properties INTEGER,
    current_properties INTEGER DEFAULT 0,
    service_days JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Service Area Technicians (Many-to-Many)
CREATE TABLE service_area_technicians (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_area_id UUID REFERENCES service_areas(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    UNIQUE(service_area_id, technician_id)
);

-- =====================================================
-- Service Management Tables
-- =====================================================

-- Services Catalog
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    base_price DECIMAL(10, 2) DEFAULT 0.00,
    duration_minutes INTEGER DEFAULT 60,
    status BOOLEAN DEFAULT TRUE,
    image VARCHAR(255),
    seasonal_availability VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Appointment Scheduling Tables
-- =====================================================

-- Appointments
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confirmation_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    
    -- Scheduling
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end_time TIMESTAMP WITH TIME ZONE,
    estimated_duration_minutes INTEGER DEFAULT 60,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Status and priority
    status VARCHAR(20) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    
    -- Confirmation
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    cancellation_reason TEXT,
    
    -- Rescheduling
    rescheduled_from_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    reschedule_count INTEGER DEFAULT 0,
    
    -- Service completion
    completion_notes TEXT,
    issues_found JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    before_photos JSONB DEFAULT '[]',
    after_photos JSONB DEFAULT '[]',
    
    -- Customer interaction
    customer_signature TEXT,
    customer_feedback TEXT,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    
    -- Financial
    base_price DECIMAL(10, 2) DEFAULT 0.00,
    additional_charges DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    
    -- Tracking
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_appointment_id UUID,
    requires_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    weather_conditions VARCHAR(50),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Common fields
    notes TEXT,
    internal_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    updated_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL
);

-- Additional Services (Many-to-Many)
CREATE TABLE appointment_additional_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE(appointment_id, service_id)
);

-- Recurring Appointments
CREATE TABLE recurring_appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    frequency VARCHAR(20) DEFAULT 'weekly',
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31),
    preferred_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    last_generated_date DATE,
    total_appointments_created INTEGER DEFAULT 0,
    assigned_technician_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    auto_confirm BOOLEAN DEFAULT TRUE,
    skip_holidays BOOLEAN DEFAULT TRUE,
    created_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Appointment Check-ins
CREATE TABLE appointment_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    technician_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_in_location JSONB DEFAULT '{}',
    check_out_time TIMESTAMP WITH TIME ZONE,
    check_out_location JSONB DEFAULT '{}',
    mileage DECIMAL(6, 1),
    created_by_id UUID REFERENCES auth_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON auth_users(email);
CREATE INDEX idx_users_is_active ON auth_users(is_active);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- Property indexes
CREATE INDEX idx_properties_customer ON properties(customer_id);
CREATE INDEX idx_properties_code ON properties(property_code);
CREATE INDEX idx_properties_zip ON properties(zip_code);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_properties_next_service ON properties(next_service_date);

-- Appointment indexes
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_technician ON appointments(technician_id);
CREATE INDEX idx_appointments_property ON appointments(property_id);
CREATE INDEX idx_appointments_confirmation ON appointments(confirmation_code);

-- Service indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);

-- =====================================================
-- Views for Reporting
-- =====================================================

-- Active appointments view
CREATE VIEW v_active_appointments AS
SELECT 
    a.*,
    c.full_name as customer_name,
    t.full_name as technician_name,
    p.display_name as property_name,
    s.name as service_name
FROM appointments a
LEFT JOIN user_profiles c ON a.customer_id = c.id
LEFT JOIN user_profiles t ON a.technician_id = t.id
LEFT JOIN properties p ON a.property_id = p.id
LEFT JOIN services s ON a.service_id = s.id
WHERE a.is_deleted = FALSE
    AND a.status NOT IN ('cancelled', 'completed');

-- Property service history view
CREATE VIEW v_property_service_history AS
SELECT 
    p.id as property_id,
    p.property_name,
    p.address_line1,
    COUNT(a.id) as total_services,
    MAX(a.scheduled_date) as last_service,
    AVG(a.customer_rating) as avg_rating
FROM properties p
LEFT JOIN appointments a ON p.id = a.property_id
WHERE p.is_deleted = FALSE
    AND a.status = 'completed'
GROUP BY p.id, p.property_name, p.address_line1;

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON auth_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Sample Data (Optional)
-- =====================================================

-- Sample services
/*
INSERT INTO services (name, description, category, base_price, duration_minutes) VALUES
    ('Weekly Pool Cleaning', 'Complete pool cleaning and chemical balance', 'cleaning', 75.00, 45),
    ('Bi-Weekly Pool Service', 'Pool cleaning every two weeks', 'cleaning', 65.00, 45),
    ('Chemical Balance Check', 'Test and adjust pool chemistry', 'chemical', 50.00, 30),
    ('Pool Equipment Inspection', 'Full inspection of pump, filter, and heater', 'inspection', 125.00, 60),
    ('Emergency Service', 'Same-day emergency pool service', 'emergency', 150.00, 60),
    ('Pool Opening', 'Seasonal pool opening service', 'seasonal', 250.00, 120),
    ('Pool Closing', 'Winterize and close pool for season', 'seasonal', 225.00, 120),
    ('Filter Cleaning', 'Deep clean pool filter system', 'maintenance', 95.00, 60),
    ('Pump Repair', 'Diagnose and repair pool pump issues', 'repair', 175.00, 90),
    ('Leak Detection', 'Find and identify pool leaks', 'inspection', 200.00, 120);
*/
