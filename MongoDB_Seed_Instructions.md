# Manual MongoDB Seed Data Import Guide

This guide explains how to manually import the seed data into your MongoDB database when needed.

## Prerequisites

1. MongoDB installed (local or remote)
2. MongoDB command-line tools installed (mongoimport)
3. Access to your MongoDB database

## Seed Data File

The seed data is provided in the file: `Backend/src/main/resources/db/seed-data.json`

This file contains 10 items for each of the following collections:
- users
- skills
- achievements
- volunteer_profiles
- organizations
- events
- event_participations
- event_feedbacks

All items have proper relationships and connections between them.

## Import Steps

### Option 1: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Select your database (e.g., `volunteer_platform_dev`)
4. For each collection:
   - Click on the collection (or create it if it doesn't exist)
   - Click on "Add Data" → "Import File"
   - Select the JSON file (you'll need to extract each collection's data to separate files)
   - Import the data

### Option 2: Using mongoimport (Command Line)

1. Open a terminal
2. Use the following commands to import each collection:

```bash
# First, create a separate JSON file for each collection
# Extract users
jq '.users' Backend/src/main/resources/db/seed-data.json > users.json

# Extract skills
jq '.skills' Backend/src/main/resources/db/seed-data.json > skills.json

# Extract achievements
jq '.achievements' Backend/src/main/resources/db/seed-data.json > achievements.json

# Extract volunteer_profiles
jq '.volunteer_profiles' Backend/src/main/resources/db/seed-data.json > volunteer_profiles.json

# Extract organizations
jq '.organizations' Backend/src/main/resources/db/seed-data.json > organizations.json

# Extract events
jq '.events' Backend/src/main/resources/db/seed-data.json > events.json

# Extract event_participations
jq '.event_participations' Backend/src/main/resources/db/seed-data.json > event_participations.json

# Extract event_feedbacks
jq '.event_feedbacks' Backend/src/main/resources/db/seed-data.json > event_feedbacks.json

# Import each collection
mongoimport --db volunteer_platform_dev --collection users --file users.json --jsonArray
mongoimport --db volunteer_platform_dev --collection skills --file skills.json --jsonArray
mongoimport --db volunteer_platform_dev --collection achievements --file achievements.json --jsonArray
mongoimport --db volunteer_platform_dev --collection volunteer_profiles --file volunteer_profiles.json --jsonArray
mongoimport --db volunteer_platform_dev --collection organizations --file organizations.json --jsonArray
mongoimport --db volunteer_platform_dev --collection events --file events.json --jsonArray
mongoimport --db volunteer_platform_dev --collection event_participations --file event_participations.json --jsonArray
mongoimport --db volunteer_platform_dev --collection event_feedbacks --file event_feedbacks.json --jsonArray
```

### Option 3: Using MongoDB Shell

1. Open a terminal
2. Connect to your MongoDB database using the mongo shell:

```bash
mongosh volunteer_platform_dev Backend/src/main/resources/db/import-seed-data.js
```

3. Use the following commands to import the data:

```javascript
// Load the JSON file
const seedData = JSON.parse(cat("Backend/src/main/resources/db/seed-data.json"));

// Insert each collection
db.users.insertMany(seedData.users);
db.skills.insertMany(seedData.skills);
db.achievements.insertMany(seedData.achievements);
db.volunteer_profiles.insertMany(seedData.volunteer_profiles);
db.organizations.insertMany(seedData.organizations);
db.events.insertMany(seedData.events);
db.event_participations.insertMany(seedData.event_participations);
db.event_feedbacks.insertMany(seedData.event_feedbacks);
```

## Verifying the Import

After importing, verify that the data was correctly imported:

```bash
mongo volunteer_platform_dev

# Check counts for each collection
db.users.countDocuments()
db.skills.countDocuments()
db.achievements.countDocuments()
db.volunteer_profiles.countDocuments()
db.organizations.countDocuments()
db.events.countDocuments()
db.event_participations.countDocuments()
db.event_feedbacks.countDocuments()
```

## Test Accounts

After importing, you can test the application with these accounts:

### Admin User
- Email: admin@example.com
- Password: Pa$$w0rd!

### Volunteer Users
- Email: volunteer1@example.com, volunteer2@example.com, etc.
- Password: Pa$$w0rd!

### Organization Users
- Email: organization1@example.com, organization2@example.com, etc.
- Password: Pa$$w0rd!

## Important Notes

1. The seed data is designed to be imported all at once to maintain relationships.
2. If you need to clear the database and start fresh, use:
   ```
   db.dropDatabase()
   ```
3. The ObjectIDs in the seed file are predefined to ensure proper relationships.
4. Import the collections in the provided order to ensure references are resolved correctly. 