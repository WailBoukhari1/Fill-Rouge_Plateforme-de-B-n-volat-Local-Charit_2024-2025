/**
 * MongoDB seed data import script
 * Run this file with the mongo shell:
 * mongo volunteer_platform_dev import-seed-data.js
 */

// Check if collections already have data
const hasData = 
  db.users.countDocuments() > 0 ||
  db.skills.countDocuments() > 0 ||
  db.achievements.countDocuments() > 0 ||
  db.volunteer_profiles.countDocuments() > 0 ||
  db.organizations.countDocuments() > 0 ||
  db.events.countDocuments() > 0 ||
  db.event_participations.countDocuments() > 0 ||
  db.event_feedbacks.countDocuments() > 0;

if (hasData) {
  print("WARNING: The database already contains data!");
  print("To continue with import, run db.dropDatabase() first, then run this script again.");
  quit();
}

// Load the JSON seed data
const seedData = {
  "users": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f01"),
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com",
      "password": "$2a$10$dJsvBmB7RugH0QE.ey9WXeeRgWYSEFtYnFCDYSVW1Zm5n7Q2X3xgW",
      "role": "ADMIN",
      "enabled": true,
      "emailVerified": true,
      "accountNonLocked": true,
      "createdAt": new Date("2023-01-01T00:00:00Z"),
      "updatedAt": new Date("2023-01-01T00:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f02"),
      "firstName": "Volunteer1",
      "lastName": "User",
      "email": "volunteer1@example.com",
      "password": "$2a$10$dJsvBmB7RugH0QE.ey9WXeeRgWYSEFtYnFCDYSVW1Zm5n7Q2X3xgW",
      "role": "VOLUNTEER",
      "enabled": true,
      "emailVerified": true,
      "accountNonLocked": true,
      "questionnaireCompleted": true,
      "createdAt": new Date("2023-01-01T00:00:00Z"),
      "updatedAt": new Date("2023-01-01T00:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f03"),
      "firstName": "Volunteer2",
      "lastName": "User",
      "email": "volunteer2@example.com",
      "password": "$2a$10$dJsvBmB7RugH0QE.ey9WXeeRgWYSEFtYnFCDYSVW1Zm5n7Q2X3xgW",
      "role": "VOLUNTEER",
      "enabled": true,
      "emailVerified": true,
      "accountNonLocked": true,
      "questionnaireCompleted": true,
      "createdAt": new Date("2023-01-01T00:00:00Z"),
      "updatedAt": new Date("2023-01-01T00:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f04"),
      "firstName": "Organization1",
      "lastName": "Manager",
      "email": "organization1@example.com",
      "password": "$2a$10$dJsvBmB7RugH0QE.ey9WXeeRgWYSEFtYnFCDYSVW1Zm5n7Q2X3xgW",
      "role": "ORGANIZATION",
      "enabled": true,
      "emailVerified": true,
      "accountNonLocked": true,
      "questionnaireCompleted": true,
      "createdAt": new Date("2023-01-01T00:00:00Z"),
      "updatedAt": new Date("2023-01-01T00:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f05"),
      "firstName": "Organization2",
      "lastName": "Manager",
      "email": "organization2@example.com",
      "password": "$2a$10$dJsvBmB7RugH0QE.ey9WXeeRgWYSEFtYnFCDYSVW1Zm5n7Q2X3xgW",
      "role": "ORGANIZATION",
      "enabled": true,
      "emailVerified": true,
      "accountNonLocked": true,
      "questionnaireCompleted": true,
      "createdAt": new Date("2023-01-01T00:00:00Z"),
      "updatedAt": new Date("2023-01-01T00:00:00Z")
    }
  ],
  "skills": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f10"),
      "name": "Teaching",
      "description": "Proficiency in teaching",
      "endorsements": []
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f11"),
      "name": "First Aid",
      "description": "Proficiency in first aid",
      "endorsements": []
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f12"),
      "name": "Web Development",
      "description": "Proficiency in web development",
      "endorsements": []
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f13"),
      "name": "Project Management",
      "description": "Proficiency in project management",
      "endorsements": []
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f14"),
      "name": "Photography",
      "description": "Proficiency in photography",
      "endorsements": []
    }
  ],
  "achievements": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f20"),
      "name": "First Time Volunteer",
      "description": "Awarded for first time volunteering",
      "iconUrl": "https://example.com/badges/badge1.png",
      "points": 20,
      "requiredEvents": 1,
      "requiredHours": 10,
      "category": "EDUCATION"
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f21"),
      "name": "5 Events Completed",
      "description": "Awarded for completing 5 events",
      "iconUrl": "https://example.com/badges/badge2.png",
      "points": 30,
      "requiredEvents": 5,
      "requiredHours": 15,
      "category": "HEALTH"
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f22"),
      "name": "10 Events Completed",
      "description": "Awarded for completing 10 events",
      "iconUrl": "https://example.com/badges/badge3.png",
      "points": 40,
      "requiredEvents": 10,
      "requiredHours": 20,
      "category": "ENVIRONMENT"
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f23"),
      "name": "50 Volunteer Hours",
      "description": "Awarded for contributing 50 volunteer hours",
      "iconUrl": "https://example.com/badges/badge4.png",
      "points": 50,
      "requiredEvents": 0,
      "requiredHours": 50,
      "category": "COMMUNITY"
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f24"),
      "name": "100 Volunteer Hours",
      "description": "Awarded for contributing 100 volunteer hours",
      "iconUrl": "https://example.com/badges/badge5.png",
      "points": 60,
      "requiredEvents": 0,
      "requiredHours": 100,
      "category": "ANIMAL_WELFARE"
    }
  ],
  "volunteer_profiles": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f30"),
      "userId": ObjectId("60a12c5b9df85e29a8e45f02"),
      "bio": "I'm a passionate volunteer with experience in Education",
      "phoneNumber": "+212501111111",
      "address": "1 Volunteer Street",
      "city": "Casablanca",
      "province": "Casablanca Province",
      "country": "Morocco",
      "approvalStatus": "APPROVED",
      "active": true,
      "emergencyContact": {
        "name": "Emergency Contact 1",
        "relationship": "Family",
        "phone": "+212601111111"
      },
      "preferredCategories": ["EDUCATION", "ENVIRONMENT"],
      "skills": [
        ObjectId("60a12c5b9df85e29a8e45f10"),
        ObjectId("60a12c5b9df85e29a8e45f11")
      ],
      "interests": ["Education", "Environment"],
      "availableDays": ["MONDAY", "WEDNESDAY", "SATURDAY"],
      "preferredTimeOfDay": "MORNING",
      "languages": ["Arabic", "French", "English"],
      "totalEventsAttended": 5,
      "totalHoursVolunteered": 20,
      "averageRating": 4.5,
      "numberOfRatings": 3,
      "reliabilityScore": 85.0,
      "impactScore": 75.0,
      "createdAt": new Date("2023-01-01T00:00:00Z"),
      "updatedAt": new Date("2023-06-01T00:00:00Z"),
      "lastActivityDate": new Date("2023-06-15T00:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f31"),
      "userId": ObjectId("60a12c5b9df85e29a8e45f03"),
      "bio": "I'm a passionate volunteer with experience in Health",
      "phoneNumber": "+212502222222",
      "address": "2 Volunteer Street",
      "city": "Rabat",
      "province": "Rabat Province",
      "country": "Morocco",
      "approvalStatus": "APPROVED",
      "active": true,
      "emergencyContact": {
        "name": "Emergency Contact 2",
        "relationship": "Friend",
        "phone": "+212602222222"
      },
      "preferredCategories": ["HEALTH", "COMMUNITY"],
      "skills": [
        ObjectId("60a12c5b9df85e29a8e45f12"),
        ObjectId("60a12c5b9df85e29a8e45f13")
      ],
      "interests": ["Health", "Community Development"],
      "availableDays": ["MONDAY", "WEDNESDAY", "SATURDAY"],
      "preferredTimeOfDay": "AFTERNOON",
      "languages": ["Arabic", "French"],
      "totalEventsAttended": 3,
      "totalHoursVolunteered": 15,
      "averageRating": 4.2,
      "numberOfRatings": 2,
      "reliabilityScore": 80.0,
      "impactScore": 70.0,
      "createdAt": new Date("2023-01-15T00:00:00Z"),
      "updatedAt": new Date("2023-06-01T00:00:00Z"),
      "lastActivityDate": new Date("2023-06-10T00:00:00Z")
    }
  ],
  "organizations": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f40"),
      "userId": ObjectId("60a12c5b9df85e29a8e45f04"),
      "name": "Organization 1",
      "description": "Organization 1 is dedicated to making a positive impact in our community through various social and environmental initiatives.",
      "mission": "Our mission is to create sustainable solutions for education challenges.",
      "vision": "A world where everyone has access to education resources and opportunities.",
      "website": "https://org1.example.com",
      "phoneNumber": "+212701111111",
      "address": "1 Organization Street",
      "city": "Casablanca",
      "province": "Casablanca Province",
      "country": "Morocco",
      "postalCode": "10100",
      "coordinates": [-7.5898, 33.9716],
      "focusAreas": ["Education", "Youth"],
      "socialMediaLinks": {
        "facebook": "https://facebook.com/org1",
        "twitter": "https://twitter.com/org1",
        "instagram": "https://instagram.com/org1",
        "linkedin": "https://linkedin.com/company/org1"
      },
      "registrationNumber": "REG10001",
      "taxId": "TAX10001",
      "type": "Non-Profit",
      "category": "Education",
      "size": "Small",
      "foundedYear": 2010,
      "verified": true,
      "verificationDate": new Date("2023-01-15T00:00:00Z"),
      "rating": 4.5,
      "numberOfRatings": 10,
      "totalEventsHosted": 8,
      "activeVolunteers": 15,
      "totalVolunteerHours": 120,
      "impactScore": 85.0,
      "roleStatus": "APPROVED",
      "acceptingVolunteers": true,
      "createdAt": new Date("2023-01-01T00:00:00Z"),
      "updatedAt": new Date("2023-06-01T00:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f41"),
      "userId": ObjectId("60a12c5b9df85e29a8e45f05"),
      "name": "Organization 2",
      "description": "Organization 2 is dedicated to making a positive impact in our community through various health initiatives.",
      "mission": "Our mission is to create sustainable solutions for healthcare challenges.",
      "vision": "A world where everyone has access to healthcare resources and opportunities.",
      "website": "https://org2.example.com",
      "phoneNumber": "+212702222222",
      "address": "2 Organization Street",
      "city": "Rabat",
      "province": "Rabat Province",
      "country": "Morocco",
      "postalCode": "10101",
      "coordinates": [-6.8498, 34.0209],
      "focusAreas": ["Healthcare", "Community"],
      "socialMediaLinks": {
        "facebook": "https://facebook.com/org2",
        "twitter": "https://twitter.com/org2",
        "instagram": "https://instagram.com/org2",
        "linkedin": "https://linkedin.com/company/org2"
      },
      "registrationNumber": "REG10002",
      "taxId": "TAX10002",
      "type": "NGO",
      "category": "Healthcare",
      "size": "Medium",
      "foundedYear": 2011,
      "verified": true,
      "verificationDate": new Date("2023-02-15T00:00:00Z"),
      "rating": 4.2,
      "numberOfRatings": 8,
      "totalEventsHosted": 6,
      "activeVolunteers": 12,
      "totalVolunteerHours": 90,
      "impactScore": 80.0,
      "roleStatus": "APPROVED",
      "acceptingVolunteers": true,
      "createdAt": new Date("2023-01-10T00:00:00Z"),
      "updatedAt": new Date("2023-06-05T00:00:00Z")
    }
  ],
  "events": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f50"),
      "title": "Education Workshop",
      "description": "This is a volunteer event focused on EDUCATION. Join us to make a difference!",
      "organizationId": ObjectId("60a12c5b9df85e29a8e45f40"),
      "location": "Community Center, Casablanca",
      "coordinates": [-7.5898, 33.9716],
      "startDate": new Date("2023-05-01T09:00:00Z"),
      "endDate": new Date("2023-05-01T13:00:00Z"),
      "status": "COMPLETED",
      "category": "EDUCATION",
      "maxParticipants": 15,
      "registeredParticipants": [
        ObjectId("60a12c5b9df85e29a8e45f02"),
        ObjectId("60a12c5b9df85e29a8e45f03")
      ],
      "waitlistEnabled": true,
      "maxWaitlistSize": 5,
      "contactPerson": "Organization1 Manager",
      "contactEmail": "organization1@example.com",
      "contactPhone": "+212701111111",
      "requiredSkills": ["Teaching", "Project Management"],
      "tags": ["EDUCATION", "Casablanca", "Family-Friendly"],
      "averageRating": 4.5,
      "numberOfRatings": 2,
      "createdAt": new Date("2023-04-01T00:00:00Z"),
      "updatedAt": new Date("2023-05-02T00:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f51"),
      "title": "Health Awareness Campaign",
      "description": "This is a volunteer event focused on HEALTH. Join us to make a difference!",
      "organizationId": ObjectId("60a12c5b9df85e29a8e45f41"),
      "location": "Public Park, Rabat",
      "coordinates": [-6.8498, 34.0209],
      "startDate": new Date("2023-07-15T09:00:00Z"),
      "endDate": new Date("2023-07-15T14:00:00Z"),
      "status": "ACTIVE",
      "category": "HEALTH",
      "maxParticipants": 20,
      "registeredParticipants": [
        ObjectId("60a12c5b9df85e29a8e45f02")
      ],
      "waitlistEnabled": false,
      "maxWaitlistSize": 0,
      "contactPerson": "Organization2 Manager",
      "contactEmail": "organization2@example.com",
      "contactPhone": "+212702222222",
      "requiredSkills": ["First Aid", "Web Development"],
      "tags": ["HEALTH", "Rabat", "Adults"],
      "averageRating": 0.0,
      "numberOfRatings": 0,
      "createdAt": new Date("2023-06-01T00:00:00Z"),
      "updatedAt": new Date("2023-06-01T00:00:00Z")
    }
  ],
  "event_participations": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f60"),
      "volunteerId": ObjectId("60a12c5b9df85e29a8e45f02"),
      "eventId": ObjectId("60a12c5b9df85e29a8e45f50"),
      "status": "ATTENDED",
      "registrationDate": new Date("2023-04-15T00:00:00Z"),
      "checkInTime": new Date("2023-05-01T08:55:00Z"),
      "checkOutTime": new Date("2023-05-01T13:05:00Z"),
      "hoursContributed": 4,
      "notes": "Participated enthusiastically",
      "createdAt": new Date("2023-04-15T00:00:00Z"),
      "updatedAt": new Date("2023-05-01T13:05:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f61"),
      "volunteerId": ObjectId("60a12c5b9df85e29a8e45f03"),
      "eventId": ObjectId("60a12c5b9df85e29a8e45f50"),
      "status": "ATTENDED",
      "registrationDate": new Date("2023-04-20T00:00:00Z"),
      "checkInTime": new Date("2023-05-01T09:10:00Z"),
      "checkOutTime": new Date("2023-05-01T13:00:00Z"),
      "hoursContributed": 4,
      "notes": "Helped with setup and cleanup",
      "createdAt": new Date("2023-04-20T00:00:00Z"),
      "updatedAt": new Date("2023-05-01T13:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f62"),
      "volunteerId": ObjectId("60a12c5b9df85e29a8e45f02"),
      "eventId": ObjectId("60a12c5b9df85e29a8e45f51"),
      "status": "REGISTERED",
      "registrationDate": new Date("2023-06-15T00:00:00Z"),
      "notes": "Looking forward to participating!",
      "createdAt": new Date("2023-06-15T00:00:00Z"),
      "updatedAt": new Date("2023-06-15T00:00:00Z")
    }
  ],
  "event_feedbacks": [
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f70"),
      "eventId": ObjectId("60a12c5b9df85e29a8e45f50"),
      "volunteerId": ObjectId("60a12c5b9df85e29a8e45f02"),
      "rating": 5,
      "comment": "This was a fantastic event. I would participate again!",
      "skillsLearned": ["Teaching", "Project Management"],
      "impactRating": 5,
      "organizationRating": 5,
      "anonymous": false,
      "submissionDate": new Date("2023-05-02T10:00:00Z"),
      "submittedAt": new Date("2023-05-02T10:00:00Z")
    },
    {
      "_id": ObjectId("60a12c5b9df85e29a8e45f71"),
      "eventId": ObjectId("60a12c5b9df85e29a8e45f50"),
      "volunteerId": ObjectId("60a12c5b9df85e29a8e45f03"),
      "rating": 4,
      "comment": "This was a good event. I would participate again!",
      "skillsLearned": ["Teaching", "First Aid"],
      "impactRating": 4,
      "organizationRating": 4,
      "anonymous": false,
      "submissionDate": new Date("2023-05-02T14:30:00Z"),
      "submittedAt": new Date("2023-05-02T14:30:00Z")
    }
  ]
};

// Import data into collections
print("Importing users...");
db.users.insertMany(seedData.users);

print("Importing skills...");
db.skills.insertMany(seedData.skills);

print("Importing achievements...");
db.achievements.insertMany(seedData.achievements);

print("Importing volunteer profiles...");
db.volunteer_profiles.insertMany(seedData.volunteer_profiles);

print("Importing organizations...");
db.organizations.insertMany(seedData.organizations);

print("Importing events...");
db.events.insertMany(seedData.events);

print("Importing event participations...");
db.event_participations.insertMany(seedData.event_participations);

print("Importing event feedbacks...");
db.event_feedbacks.insertMany(seedData.event_feedbacks);

// Print summary
print("\nSeed data import complete!");
print("-----------------------------");
print("Total users: " + db.users.countDocuments());
print("Total skills: " + db.skills.countDocuments());
print("Total achievements: " + db.achievements.countDocuments());
print("Total volunteer profiles: " + db.volunteer_profiles.countDocuments());
print("Total organizations: " + db.organizations.countDocuments());
print("Total events: " + db.events.countDocuments());
print("Total event participations: " + db.event_participations.countDocuments());
print("Total event feedbacks: " + db.event_feedbacks.countDocuments());
print("\nYou can now use the following test accounts:");
print("Admin: admin@example.com / password");
print("Volunteer 1: volunteer1@example.com / password");
print("Volunteer 2: volunteer2@example.com / password");
print("Organization 1: organization1@example.com / password");
print("Organization 2: organization2@example.com / password");