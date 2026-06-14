-- ============================================================================
-- Seed an initial admin user (runs last, after the schema migrations).
--
-- Login at /login with:
--     email:    admin@a7madd.com
--     password: admin123
--
-- CHANGE THIS PASSWORD AFTER FIRST LOGIN. The hash below is bcrypt(admin123).
-- To rotate: `node -e "console.log(require('bcryptjs').hashSync('NEWPASS',10))"`
-- then UPDATE users SET password_hash = '<hash>' WHERE email = 'admin@a7madd.com';
-- ============================================================================

INSERT INTO users (email, name, password_hash, role)
VALUES (
  'admin@a7madd.com',
  'Administrator',
  '$2b$10$BVBgiaEO0GlTbIfMsBB66.QncrF3uF5Nm1fV6PrnxN0svzYKNrbFy',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
