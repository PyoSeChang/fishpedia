export enum BoardCategory {
  NOTICE = 'NOTICE',
  FREE = 'FREE',
  QUESTION = 'QUESTION',
  TIP = 'TIP',
  REVIEW = 'REVIEW'
}

export interface BoardRequest {
  title: string;
  content: string;
  category: BoardCategory;
  tags?: string;
  pinned?: boolean;
}

export interface BoardResponse {
  id: number;
  title: string;
  content: string;
  category: BoardCategory;
  tags?: string;
  pinned: boolean;
  readCount: number;
  createAt: string;
  updateAt?: string;
  authorName: string;
  authorId: number;
}

export interface CommentRequest {
  content: string;
  parentId?: number;
}

export interface CommentResponse {
  id: number;
  content: string;
  createAt: string;
  updateAt?: string;
  depth: number;
  authorName: string;
  authorId: number;
  parentId?: number;
  children?: CommentResponse[];
}

export interface BoardListResponse {
  content: BoardResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}