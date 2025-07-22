import api from './api';
import { BoardRequest, BoardResponse, BoardListResponse, CommentRequest, CommentResponse, BoardCategory } from '../types/BoardType';

export const boardService = {
  // 게시글 생성
  createBoard: async (boardData: BoardRequest): Promise<BoardResponse> => {
    const response = await api.post('/board', boardData);
    return response.data;
  },

  // 게시글 수정
  updateBoard: async (boardId: number, boardData: BoardRequest): Promise<BoardResponse> => {
    const response = await api.put(`/board/${boardId}`, boardData);
    return response.data;
  },

  // 게시글 삭제
  deleteBoard: async (boardId: number): Promise<void> => {
    await api.delete(`/board/${boardId}`);
  },

  // 게시글 상세 조회
  getBoard: async (boardId: number): Promise<BoardResponse> => {
    const response = await api.get(`/board/${boardId}`);
    return response.data;
  },

  // 게시글 목록 조회
  getBoards: async (
    category?: BoardCategory,
    keyword?: string,
    page: number = 0,
    size: number = 20
  ): Promise<BoardListResponse> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (keyword) params.append('keyword', keyword);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get(`/board?${params.toString()}`);
    return response.data;
  },

  // 게시글 목록 조회 (향상된 검색)
  getBoardsAdvanced: async (
    category?: BoardCategory,
    keyword?: string,
    title?: string,
    tags?: string,
    page: number = 0,
    size: number = 20
  ): Promise<BoardListResponse> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (keyword) params.append('keyword', keyword);
    if (title) params.append('title', title);
    if (tags) params.append('tags', tags);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await api.get(`/board?${params.toString()}`);
    return response.data;
  },

  // 댓글 생성
  createComment: async (boardId: number, commentData: CommentRequest): Promise<CommentResponse> => {
    const response = await api.post(`/board/${boardId}/comments`, commentData);
    return response.data;
  },

  // 댓글 수정
  updateComment: async (commentId: number, commentData: CommentRequest): Promise<CommentResponse> => {
    const response = await api.put(`/board/comments/${commentId}`, commentData);
    return response.data;
  },

  // 댓글 삭제
  deleteComment: async (commentId: number): Promise<void> => {
    await api.delete(`/board/comments/${commentId}`);
  },

  // 게시글의 댓글 목록 조회
  getComments: async (boardId: number): Promise<CommentResponse[]> => {
    const response = await api.get(`/board/${boardId}/comments`);
    return response.data;
  },

  // 게시글에 이미지 추가
  addImageToBoard: async (boardId: number, image: File, description?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('image', image);
    if (description) {
      formData.append('description', description);
    }

    const response = await api.post(`/board/${boardId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 게시글의 이미지 목록 조회
  getBoardImages: async (boardId: number): Promise<any[]> => {
    const response = await api.get(`/board/${boardId}/images`);
    return response.data;
  }
};