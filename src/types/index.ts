// Esta interface define o 'owner' (autor) de um post ou resposta
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  college?: string;
}

// Esta interface define uma 'reply' (resposta)
export interface ReplyResponse {
  id: number;
  content: string;
  created_at: string; // O JSON sempre envia datas como string
  post_id: number;
  owner_id: number;
  parent_reply_id: number | null;
  owner: UserResponse;
}

// Esta interface define um 'post' (que inclui uma lista de respostas)
export interface PostResponse {
  id: number;
  content: string;
  created_at: string;
  owner_id: number;
  owner: UserResponse;
  agree_count: number;
  disagree_count: number;
  replies: ReplyResponse[]; // Um post contém uma lista de respostas
}