export interface CreateReviewRequest {
  product_id: string;
  rating: number;
  title: string;
  comment: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReviewsResponse {
  data: Review[];
  meta?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface ApproveReviewRequest {
  is_approved: boolean;
} 