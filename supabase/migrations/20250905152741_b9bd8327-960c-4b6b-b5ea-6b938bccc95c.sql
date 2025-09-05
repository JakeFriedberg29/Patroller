-- Link all existing auth users to their corresponding database records
-- This fixes login redirection issues for all seed users

UPDATE users SET auth_user_id = '50823d74-604a-4dbc-a770-dd27fca39f41', status = 'active', email_verified = true 
WHERE email = 'james.wilson@megacorp.com' AND auth_user_id IS NULL;

UPDATE users SET auth_user_id = '6d084c09-4335-470d-8bc3-8364b9241db3', status = 'active', email_verified = true 
WHERE email = 'mike.chen@megacorp.com' AND auth_user_id IS NULL;

UPDATE users SET auth_user_id = 'a4e7b4c3-19d7-48ff-8f9f-347e890dd652', status = 'active', email_verified = true 
WHERE email = 'emily.rodriguez@example.com' AND auth_user_id IS NULL;

UPDATE users SET auth_user_id = '639fc53c-34f3-492d-84b4-34b1d7b6405a', status = 'active', email_verified = true 
WHERE email = 'emily.rodriguez@megacorp.com' AND auth_user_id IS NULL;

UPDATE users SET auth_user_id = '92c4f299-3c8b-4b48-883c-dbf013788a7f', status = 'active', email_verified = true 
WHERE email = 'sarah.johnson@example.com' AND auth_user_id IS NULL;

UPDATE users SET auth_user_id = 'b1b4b020-f63f-457e-a462-5d584b7e8f7e', status = 'active', email_verified = true 
WHERE email = 'lisa.thompson@megacorp.com' AND auth_user_id IS NULL;

UPDATE users SET auth_user_id = '170f849e-bdd9-477a-96fb-df2ba326a177', status = 'active', email_verified = true 
WHERE email = 'mike.chen@example.com' AND auth_user_id IS NULL;

UPDATE users SET auth_user_id = '74262990-a23a-44ce-af03-fb94801b224e', status = 'active', email_verified = true 
WHERE email = 'robert.davis@megacorp.com' AND auth_user_id IS NULL;