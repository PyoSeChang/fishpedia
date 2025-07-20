export interface FishingSpot {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  fishTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  facilities: string[];
  rating: number;
  imageUrl?: string;
  address?: string;
  openTime?: string;
  entryFee?: number;
  contact?: string;
  tips?: string[];
  bestSeason?: string[];
  reviews?: SpotReview[];
}

export interface SpotReview {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  images?: string[];
}

export interface SpotFilter {
  difficulty?: 'easy' | 'medium' | 'hard';
  fishType?: string;
  facilities?: string[];
  region?: string;
  rating?: number;
}

export interface SpotSearchParams {
  keyword?: string;
  filter?: SpotFilter;
  sort?: 'rating' | 'distance' | 'name';
  page?: number;
  limit?: number;
}