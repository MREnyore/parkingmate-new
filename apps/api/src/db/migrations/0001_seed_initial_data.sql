-- Seed initial organization and admin user
-- This migration creates a default organization and admin user for initial setup

-- Insert default organization
INSERT INTO organizations (id, name, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'LIFE GYM',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Insert admin user
-- Note: The password_hash needs to be generated using bcrypt
-- The plain password is: OopsWrongSpot#1
-- This hash is generated with bcrypt rounds=10
INSERT INTO users (
  id,
  org_id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  status,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@parkingmate.com',
  '$2b$10$lcYVrVxt0WLGLZNzquqPp.U5dokgpxwks/LjcgI3r0fjWU.LiTgTa',
  'Parker',
  'Mate',
  'admin',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
