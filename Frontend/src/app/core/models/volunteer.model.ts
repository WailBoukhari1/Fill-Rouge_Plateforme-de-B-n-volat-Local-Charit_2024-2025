export interface VolunteerStatistics {
    totalEventsAttended: number;
    totalHoursVolunteered: number;
    badges: Badge[];
    impactScore: number;
    skillsGained: string[];
    organizationsWorkedWith: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    earnedDate: Date;
}

export interface VolunteerHours {
    id: string;
    eventId: string;
    eventName: string;
    hours: number;
    date: Date;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    notes?: string;
}

export interface RecentActivity {
    id: string;
    icon: string;
    description: string;
    timestamp: Date;
    type: 'EVENT' | 'HOURS' | 'BADGE' | 'ACHIEVEMENT';
    relatedId?: string;
}