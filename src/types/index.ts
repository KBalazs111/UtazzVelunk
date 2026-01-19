// User
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Travel package
export interface TravelPackage {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  destination: string;
  country: string;
  continent: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  category: TravelCategory;
  images: string[];
  coverImage: string;
  included: string[];
  notIncluded: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  departureDate: Date;
  returnDate: Date;
  availableSpots: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TravelCategory = 
  | 'beach'
  | 'adventure'
  | 'cultural'
  | 'city'
  | 'nature'
  | 'cruise'
  | 'safari'
  | 'ski'
  | 'wellness';

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  activities: string[];
  meals: ('breakfast' | 'lunch' | 'dinner')[];
  accommodation?: string;
  image?: string;
}

// Booking
export interface Booking {
  id: string;
  userId: string;
  user?: User;
  packageId: string;
  package?: TravelPackage;
  status: BookingStatus;
  travelers: Traveler[];
  totalPrice: number;
  currency: string;
  specialRequests?: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  bookedAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed';

export interface Traveler {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  passportNumber?: string;
  specialNeeds?: string;
}

// AI Itinerary
export interface AIItineraryRequest {
  destination: string;
  country: string;
  duration: number;
  travelStyle: TravelStyle;
  interests: string[];
  groupType: GroupType;
  budget: BudgetLevel;
  startDate?: Date;
  specialRequirements?: string;
}

export type TravelStyle = 
  | 'relaxed'
  | 'balanced'
  | 'adventurous'
  | 'luxury';

export type GroupType = 
  | 'solo'
  | 'couple'
  | 'family'
  | 'friends'
  | 'business';

export type BudgetLevel = 
  | 'budget'
  | 'moderate'
  | 'premium'
  | 'luxury';

export interface AIItinerary {
  id: string;
  userId: string;
  request: AIItineraryRequest;
  title: string;
  summary: string;
  days: AIItineraryDay[];
  estimatedBudget: {
    min: number;
    max: number;
    currency: string;
  };
  tips: string[];
  bestTimeToVisit: string;
  createdAt: Date;
  updatedAt: Date;
  isSaved: boolean;
}

export interface AIItineraryDay {
  day: number;
  date?: string;
  title: string;
  description: string;
  morning: ActivityBlock;
  afternoon: ActivityBlock;
  evening: ActivityBlock;
  accommodation: {
    name: string;
    type: string;
    priceRange: string;
  };
  meals: MealRecommendation[];
  transportNotes?: string;
  image?: string;
}

export interface ActivityBlock {
  activity: string;
  description: string;
  duration: string;
  location?: string;
  cost?: string;
  tips?: string;
}

export interface MealRecommendation {
  type: 'breakfast' | 'lunch' | 'dinner';
  recommendation: string;
  cuisine: string;
  priceRange: string;
}

// Filter
export interface TravelFilters {
  search?: string;
  category?: TravelCategory;
  continent?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: {
    min: number;
    max: number;
  };
  difficulty?: string;
  departureMonth?: number;
  sortBy?: 'price' | 'rating' | 'duration' | 'departure';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard
export interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activePackages: number;
  pendingBookings: number;
  recentBookings: Booking[];
  popularPackages: TravelPackage[];
  bookingsByMonth: {
    month: string;
    count: number;
    revenue: number;
  }[];
}

// API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
