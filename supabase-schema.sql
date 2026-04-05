-- ===================================================
-- Abdullah Shaikh Portfolio — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ===================================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  live_link TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  certificate_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level INTEGER DEFAULT 3 CHECK (level >= 1 AND level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  page_name TEXT,
  section TEXT,
  device_type TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  event_type TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL
);

-- CV Downloads table
CREATE TABLE IF NOT EXISTS cv_downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  device_type TEXT,
  browser TEXT
);

-- Active Visitors table (for live count)
CREATE TABLE IF NOT EXISTS active_visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL UNIQUE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  page_name TEXT
);

-- Enable Row Level Security (but allow all operations since no auth)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_visitors ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (no auth)
CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on certifications" ON certifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on skills" ON skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on analytics" ON analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cv_downloads" ON cv_downloads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on active_visitors" ON active_visitors FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for active_visitors
ALTER PUBLICATION supabase_realtime ADD TABLE active_visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE certifications;
ALTER PUBLICATION supabase_realtime ADD TABLE skills;
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;

-- ===================================================
-- Seed Data from CV
-- ===================================================

-- Seed Projects
INSERT INTO projects (title, description, tech_stack, live_link, order_index) VALUES
(
  'Eternal Elegance Global Awards — Online Voting Platform',
  'Developed a full-stack online voting platform with dynamic category and subcategory-based nominations. Implemented real-time vote computation and result display for improved transparency. Created a responsive React frontend with Node.js APIs and MongoDB for backend processing and storage.',
  ARRAY['React', 'Node.js', 'MongoDB', 'Express'],
  'https://nomination.eternaleleganceglobalawards.com',
  1
),
(
  'CollePredict.AI — Smart Career & Admission Guidance Platform',
  'Built an AI-driven career counseling and engineering admission prediction platform for Indian students. Integrated aptitude testing and profile-based guidance with CET/Diploma-aware admission logic. Developed a ChatGPT-like AI chatbot and ML-based college probability prediction with resume builder.',
  ARRAY['Python', 'React', 'Machine Learning', 'ChatGPT API'],
  NULL,
  2
);

-- Seed Certifications
INSERT INTO certifications (title, issuer, certificate_link) VALUES
('AI Engineer', 'Codebasics', 'https://oneroadmap.io/skills/ai/certificate/CERT-9F4A274d'),
('Python Using AI', 'AI For Teachers', 'https://certly.io/certificate/27431ebc'),
('Technical Paper Presentation', 'Thakur College of Engineering', NULL);

-- Seed Skills
INSERT INTO skills (name, category, level) VALUES
-- Languages
('Python', 'Languages', 3),
('JavaScript', 'Languages', 4),
('HTML', 'Languages', 5),
('CSS', 'Languages', 4),
('SQL', 'Languages', 3),
-- Frameworks & Libraries
('React', 'Frameworks', 4),
('Node.js', 'Frameworks', 4),
('Pandas', 'Frameworks', 3),
('NumPy', 'Frameworks', 3),
('Express.js', 'Frameworks', 4),
-- Tools & Platforms
('MySQL', 'Tools', 3),
('MongoDB', 'Tools', 4),
('Supabase', 'Tools', 3),
('Git & GitHub', 'Tools', 4),
('VS Code', 'Tools', 5),
-- Soft Skills
('Team Leadership', 'Soft Skills', 4),
('Communication', 'Soft Skills', 4),
('Stakeholder Management', 'Soft Skills', 3),
('Problem Solving', 'Soft Skills', 4);


-- Admin Auth Table for OTP Login
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT NOT NULL,
  current_otp TEXT,
  otp_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: In a real app password should be hashed, here we insert default admin
INSERT INTO admin_users (username, password_hash, phone) 
VALUES ('admin', 'admin123', '9967680816')
ON CONFLICT (username) DO NOTHING;

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- Site Settings Table (For dynamic profile images, etc)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
