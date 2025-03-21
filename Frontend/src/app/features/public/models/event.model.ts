export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: Date;
  time: string;
  location: string;
  fullAddress: string;
  capacity: number;
  spotsLeft: number;
  category: string;
  organizerName: string;
  organizerImage: string;
  organizerDescription: string;
} 