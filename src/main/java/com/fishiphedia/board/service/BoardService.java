package com.fishiphedia.board.service;

import com.fishiphedia.board.dto.*;
import com.fishiphedia.board.entity.BoardCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BoardService {
    
    // 게시글 등록
    BoardResponse createBoard(BoardRequest request, String loginId);

    // 게시글 수정
    BoardResponse updateBoard(Long boardId, BoardRequest request, String loginId);

    // 게시글 삭제
    void deleteBoard(Long boardId, String loginId);

    // 게시글 보기
    BoardResponse getBoard(Long boardId);

    // 게시글 모아보기 (Board List, Pagaeable, 제목 or 내용 or 태그로 검색)
    Page<BoardResponse> getBoards(BoardCategory category, String keyword, Pageable pageable);
    
    // 게시글 모아보기 (향상된 검색 - 제목, 태그 분리 검색)
    Page<BoardResponse> getBoards(BoardCategory category, String keyword, String title, String tags, Pageable pageable);

    // 댓글 달기
    CommentResponse createComment(Long boardId, CommentRequest request, String loginId);

    // 댓글 수정
    CommentResponse updateComment(Long commentId, CommentRequest request, String loginId);

    // 댓글 삭제
    void deleteComment(Long commentId, String loginId);
    
    // 게시글의 댓글 목록 조회
    List<CommentResponse> getCommentsByBoardId(Long boardId);
    
    // 게시글에 이미지 추가
    AlbumResponse addImageToBoard(Long boardId, String imagePath, String description, String loginId);
    
    // 게시글의 이미지 목록 조회
    List<AlbumResponse> getBoardImages(Long boardId);
} 