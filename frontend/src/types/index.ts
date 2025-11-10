// This defines the shape of a single task object
export type Task = {
  id: number; // Supabase automatically creates this
  created_at: string; // Supabase automatically creates this
  user_id: string;
  title: string;
  description?: string | null; // The '?' means it's optional
  status?: string | null;
  deadline?: string | null;
  priority?: string | null;
};