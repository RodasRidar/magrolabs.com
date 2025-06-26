export interface CreateReviewRequest {
  product_id: string;
  rating: number;
  title: string;
  comment: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  review: string;
  stars: number;
  isAproved?: boolean;
  created_at: string;
  updated_at: string;
  is_delete: boolean;
  is_static?: boolean;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  product?: {
    id: string;
    name: string;
  };
}

export interface ReviewsResponse {
  data: {
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
    reviews: Review[];
  };
  status: string;
}

export interface ApproveReviewRequest {
  is_approved: boolean;
} 