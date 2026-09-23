export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
}
