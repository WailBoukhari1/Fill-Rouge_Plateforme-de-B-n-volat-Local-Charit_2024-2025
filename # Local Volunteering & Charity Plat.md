### **Specifications Document**  
**Local Volunteering and Charity Platform**  

---

### **1. Context and Objectives**  
**Context**:  
The platform aims to connect **local organizations** (associations, NGOs) with **volunteers** for volunteering events. It should be simple, intuitive, and offer a seamless user experience.  

**Objectives**:  
- Allow organizations to post volunteering events.  
- Enable volunteers to find and join events.  
- Simplify the management of registrations and user profiles.  
- Integrate Google Sign-In to streamline user registration.  

---

### **2. Main Features**  

#### **2.1. Authentication and User Management**  
- **Google Sign-In**:  
  - Use OAuth2 to let users log in with their Google accounts.  
  - Alternative: Traditional email/password registration.  
- **Roles**:  
  - **Volunteer**: Can search and join events.  
  - **Organization**: Can create and manage events.  
  - **Admin**: Validates organizations and moderates content.  
- **User Profiles**:  
  - **Volunteers**: Profile picture, skills, availability, event participation history.  
  - **Organizations**: Logo, description, contact details, “Verified” badge.  

#### **2.2. Event Management**  
- **Event Creation**:  
  - Title, description, date/time, location (Google Maps integration).  
  - Required skills (tags), number of volunteers needed.  
- **Search and Filters**:  
  - Filters by location (search radius), date, and skills.  
  - Display events as cards.  
- **Event Registration (RSVP)**:  
  - Volunteers can register with a single click.  
  - Participant limits for events.  

#### **2.3. Notifications**  
- **Email Alerts**:  
  - Event registration confirmation.  
  - Reminder 24 hours before the event.  
  - Notification of event cancellation or changes.  

#### **2.4. Dashboard**  
- **For Volunteers**:  
  - Upcoming events, participation history.  
- **For Organizations**:  
  - List of registered volunteers, event management tools.  
- **For Admin**:  
  - Organization validation, content moderation tools.  

---

### **3. Technologies**  

#### **Backend (Spring Boot)**  
- **Language**: Java 17+.  
- **Framework**: Spring Boot, Spring Security, Spring Data JPA.  
- **Database**: MongoDB.  
- **Authentication**: JWT + OAuth2 (Google).  
- **API**: RESTful API.  

#### **Frontend (Angular 17)**  
- **Framework**: Angular 17 (Standalone Components).  
- **UI Library**: Angular Material.  
- **State Management**: NgRx.  
- **Maps**: Google Maps integration.  

#### **Additional Tools**  
- **Email Sending**: SendGrid or Mailtrap.  
- **Deployment**: Docker + Docker Compose (optional).  

---

### **4. State Management with NgRx**  
- **Auth State**:  
  ```typescript  
  interface AuthState {
    user: User | null;
    token: string | null;
    isLoggedIn: boolean;
  }  
  ```  
- **Events State**:  
  ```typescript  
  interface EventsState {
    events: Event[];
    filters: { location: string; skills: string[] };
    loading: boolean;
  }  
  ```  
- **Volunteers State**:  
  ```typescript  
  interface VolunteersState {
    upcomingEvents: Event[];
    pastEvents: Event[];
  }  
  ```  

---

### **5. Design and User Experience**  
- **Homepage**:  
  - Search bar with filters.  
  - Carousel for popular events.  
  - Statistics (e.g., "500 Active Volunteers").  
- **Event Cards**:  
  - Image, title, date, location, required skills.  
  - "Register" button (disabled if event is full).  
- **Responsive Design**:  
  - Mobile and tablet compatibility.  

---

### **6. Security**  
- **Backend**:  
  - Input validation (e.g., event dates must be in the future).  
  - API rate-limiting.  
  - Role-based access control (e.g., only admins can validate organizations).  
- **Frontend**:  
  - Route guards for protected pages (e.g., `/dashboard`).  
  - User input sanitization (e.g., event descriptions).  

---

### **7. Timeline**  

#### **Phase 1 (4 Weeks)**  
- Authentication (Google + email/password).  
- Event creation and listing.  
- User profiles (volunteers and organizations).  

#### **Phase 2 (3 Weeks)**  
- Event RSVP system.  
- Email notifications.  
- Organization dashboard.  

#### **Phase 3 (2 Weeks)**  
- Google Maps integration for event locations.  
- UI/UX improvements.  
- Testing and bug fixes.  

---

### **8. Resources**  
- **Spring Boot Documentation**: [Spring Boot Docs](https://spring.io/projects/spring-boot).  
- **Angular Documentation**: [Angular Docs](https://angular.io/docs).  
- **NgRx**: [NgRx Docs](https://ngrx.io/guide/store).  

---

### **9. Deliverables**  
- **Source Code**: Backend (Spring Boot) + Frontend (Angular).  
- **Database**: SQL scripts for PostgreSQL.  
- **Documentation**: Installation and user guide.  

---