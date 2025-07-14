package com.fishiphedia.board.controller;

import com.fishiphedia.board.dto.*;
import com.fishiphedia.board.entity.BoardCategory;
import com.fishiphedia.board.service.BoardService;
import com.fishiphedia.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BoardController {

    private final BoardService boardService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(
            @RequestBody BoardRequest request,
            @RequestHeader("Authorization") String token) {
        String loginId = jwtUtil.getLoginIdFromToken(token.substring(7));
        BoardResponse response = boardService.createBoard(request, loginId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<BoardResponse> updateBoard(
            @PathVariable Long boardId,
            @RequestBody BoardRequest request,
            @RequestHeader("Authorization") String token) {
        String loginId = jwtUtil.getLoginIdFromToken(token.substring(7));
        BoardResponse response = boardService.updateBoard(boardId, request, loginId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable Long boardId,
            @RequestHeader("Authorization") String token) {
        String loginId = jwtUtil.getLoginIdFromToken(token.substring(7));
        boardService.deleteBoard(boardId, loginId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<BoardResponse> getBoard(@PathVariable Long boardId) {
        BoardResponse response = boardService.getBoard(boardId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<BoardResponse>> getBoards(
            @RequestParam(required = false) BoardCategory category,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20, sort = "createAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<BoardResponse> response = boardService.getBoards(category, keyword, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{boardId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long boardId,
            @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String token) {
        String loginId = jwtUtil.getLoginIdFromToken(token.substring(7));
        CommentResponse response = boardService.createComment(boardId, request, loginId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String token) {
        String loginId = jwtUtil.getLoginIdFromToken(token.substring(7));
        CommentResponse response = boardService.updateComment(commentId, request, loginId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestHeader("Authorization") String token) {
        String loginId = jwtUtil.getLoginIdFromToken(token.substring(7));
        boardService.deleteComment(commentId, loginId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{boardId}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long boardId) {
        List<CommentResponse> response = boardService.getCommentsByBoardId(boardId);
        return ResponseEntity.ok(response);
    }
} 