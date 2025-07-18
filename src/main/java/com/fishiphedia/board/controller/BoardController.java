package com.fishiphedia.board.controller;

import com.fishiphedia.board.dto.*;
import com.fishiphedia.board.entity.BoardCategory;
import com.fishiphedia.board.service.BoardService;
import com.fishiphedia.common.service.FileUploadService;
import com.fishiphedia.common.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class BoardController {

    private final BoardService boardService;
    private final JwtUtil jwtUtil;
    private final FileUploadService fileUploadService;

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

    // 게시판용 이미지 업로드
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadImage(
            @RequestParam("image") MultipartFile image,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body("이미지 파일이 비어있습니다.");
            }
            
            log.info("게시판 이미지 업로드 시작 - 파일명: {}, 크기: {}", 
                image.getOriginalFilename(), image.getSize());
            
            String imagePath = fileUploadService.uploadFile(image);
            String fullUrl = "http://localhost:8081" + imagePath;
            
            log.info("게시판 이미지 업로드 성공: {}", fullUrl);
            return ResponseEntity.ok(fullUrl);
            
        } catch (Exception e) {
            log.error("게시판 이미지 업로드 실패", e);
            return ResponseEntity.badRequest().body("이미지 업로드에 실패했습니다: " + e.getMessage());
        }
    }
    
    // 게시글에 이미지 추가
    @PostMapping("/{boardId}/images")
    public ResponseEntity<AlbumResponse> addImageToBoard(
            @PathVariable Long boardId,
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "description", required = false) String description,
            @RequestHeader("Authorization") String token) {
        
        try {
            String loginId = jwtUtil.getLoginIdFromToken(token.substring(7));
            
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }
            
            log.info("보드 이미지 추가 시작 - Board ID: {}, 파일명: {}", 
                boardId, image.getOriginalFilename());
            
            String imagePath = fileUploadService.uploadFile(image);
            AlbumResponse response = boardService.addImageToBoard(boardId, imagePath, description, loginId);
            
            log.info("보드 이미지 추가 성공 - Album ID: {}", response.getId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("보드 이미지 추가 실패 - Board ID: {}", boardId, e);
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    // 게시글의 이미지 목록 조회
    @GetMapping("/{boardId}/images")
    public ResponseEntity<List<AlbumResponse>> getBoardImages(@PathVariable Long boardId) {
        try {
            List<AlbumResponse> response = boardService.getBoardImages(boardId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("보드 이미지 조회 실패 - Board ID: {}", boardId, e);
            return ResponseEntity.badRequest().body(null);
        }
    }
}