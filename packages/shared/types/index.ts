export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
