db = db.getSiblingDB('application');

db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    { role: 'readWrite', db: 'application' }
  ]
});

// Create collections
db.createCollection('users');
db.createCollection('organizations');
db.createCollection('events');
db.createCollection('volunteers');

// Add basic admin user
db.users.insertOne({
  email: 'admin@example.com',
  username: 'admin',
  password: '$2a$10$VES.rT5LaNyHi/VnJ8.UUOyJtQVnRVIJC4pJtQ1srMYXiurFsCsne', // hashed password for 'admin123'
  role: 'ADMIN',
  active: true,
  created_at: new Date(),
  updated_at: new Date()
});

print('MongoDB initialization completed'); 