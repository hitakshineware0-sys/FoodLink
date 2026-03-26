export type UserRole = 'donor' | 'receiver' | 'volunteer' | 'ngo';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  rating: number;
  totalImpact: number;
  location?: Location;
}

export type DonationStatus = 'available' | 'claimed' | 'picked_up' | 'delivered' | 'expired';

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  foodType: string;
  quantity: string;
  location: Location;
  expiryTime: any; // Firestore Timestamp
  status: DonationStatus;
  safetyTips: string;
  createdAt: any; // Firestore Timestamp
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface VolunteerTask {
  id: string;
  donationId: string;
  volunteerId: string;
  status: TaskStatus;
  createdAt: any; // Firestore Timestamp
}

export interface Issue {
  id: string;
  reporterId: string;
  reporterName: string;
  relatedId: string; // ID of the donation, user, or task
  relatedType: 'donation' | 'user' | 'task';
  issueType: string;
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: any; // Firestore Timestamp
}

export interface GlobalStats {
  mealsSaved: number;
  peopleFed: number;
  co2Reduced: number;
  activeVolunteers: number;
  lastUpdated: any; // Firestore Timestamp
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  mealsSaved: number;
  peopleFed: number;
  co2Reduced: number;
}
