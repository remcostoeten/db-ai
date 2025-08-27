-- Promote stoeten.remco.rs@gmail.com to admin role
UPDATE "user" 
SET 
    role = 'admin',
    updated_at = NOW()
WHERE 
    email = 'stoeten.remco.rs@gmail.com';

-- Verify the update
SELECT id, name, email, role, created_at, updated_at 
FROM "user" 
WHERE email = 'stoeten.remco.rs@gmail.com';
