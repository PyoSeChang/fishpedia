package com.fishiphedia.board.service;

import com.fishiphedia.board.dto.*;
import com.fishiphedia.board.entity.Album;
import com.fishiphedia.board.entity.Board;
import com.fishiphedia.board.entity.BoardCategory;
import com.fishiphedia.board.entity.Comment;
import com.fishiphedia.board.repository.AlbumRepository;
import com.fishiphedia.board.repository.BoardRepository;
import com.fishiphedia.board.repository.CommentRepository;
import com.fishiphedia.user.entity.User;
import com.fishiphedia.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardServiceImpl implements BoardService {

    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final AlbumRepository albumRepository;
    private final UserService userService;

    @Override
    public BoardResponse createBoard(BoardRequest request, String loginId) {
        User user = userService.findByLoginId(loginId);
        
        Board board = new Board();
        board.setUser(user);
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        board.setCategory(request.getCategory());
        board.setTags(request.getTags());
        board.setPinned(request.isPinned());
        
        Board savedBoard = boardRepository.save(board);
        return convertToResponse(savedBoard);
    }

    @Override
    public BoardResponse updateBoard(Long boardId, BoardRequest request, String loginId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        if (!board.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("Access denied");
        }
        
        board.setTitle(request.getTitle());
        board.setContent(request.getContent());
        board.setCategory(request.getCategory());
        board.setTags(request.getTags());
        board.setPinned(request.isPinned());
        
        Board savedBoard = boardRepository.save(board);
        return convertToResponse(savedBoard);
    }

    @Override
    public void deleteBoard(Long boardId, String loginId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        if (!board.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("Access denied");
        }
        
        boardRepository.delete(board);
    }

    @Override
    @Transactional(readOnly = true)
    public BoardResponse getBoard(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        board.setReadCount(board.getReadCount() + 1);
        boardRepository.save(board);
        
        return convertToResponse(board);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BoardResponse> getBoards(BoardCategory category, String keyword, Pageable pageable) {
        Page<Board> boards;
        
        if (category != null && keyword != null && !keyword.trim().isEmpty()) {
            boards = boardRepository.findByCategoryAndKeyword(category, keyword, pageable);
        } else if (category != null) {
            boards = boardRepository.findByCategory(category, pageable);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            boards = boardRepository.findByKeyword(keyword, pageable);
        } else {
            boards = boardRepository.findAll(pageable);
        }
        
        return boards.map(this::convertToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BoardResponse> getBoards(BoardCategory category, String keyword, String title, String tags, Pageable pageable) {
        // 새로운 검색 방식이 사용되지 않으면 기존 방식으로 처리
        if ((title == null || title.trim().isEmpty()) && (tags == null || tags.trim().isEmpty())) {
            return getBoards(category, keyword, pageable);
        }
        
        Page<Board> boards;
        
        // 태그 파싱 (최대 5개까지 지원)
        String[] tagArray = null;
        if (tags != null && !tags.trim().isEmpty()) {
            tagArray = Arrays.stream(tags.split(","))
                    .map(String::trim)
                    .filter(tag -> !tag.isEmpty())
                    .limit(5)
                    .toArray(String[]::new);
        }
        
        // 파라미터에 따른 검색 분기
        if (category != null) {
            // 카테고리가 있는 경우
            boards = boardRepository.findByCategoryAndTitleAndTags(
                    category,
                    title != null && !title.trim().isEmpty() ? title : null,
                    tags != null && !tags.trim().isEmpty() ? tags : null,
                    tagArray != null && tagArray.length > 0 ? tagArray[0] : null,
                    tagArray != null && tagArray.length > 1 ? tagArray[1] : null,
                    tagArray != null && tagArray.length > 2 ? tagArray[2] : null,
                    tagArray != null && tagArray.length > 3 ? tagArray[3] : null,
                    tagArray != null && tagArray.length > 4 ? tagArray[4] : null,
                    pageable
            );
        } else {
            // 카테고리가 없는 경우
            boards = boardRepository.findByTitleAndTags(
                    title != null && !title.trim().isEmpty() ? title : null,
                    tags != null && !tags.trim().isEmpty() ? tags : null,
                    tagArray != null && tagArray.length > 0 ? tagArray[0] : null,
                    tagArray != null && tagArray.length > 1 ? tagArray[1] : null,
                    tagArray != null && tagArray.length > 2 ? tagArray[2] : null,
                    tagArray != null && tagArray.length > 3 ? tagArray[3] : null,
                    tagArray != null && tagArray.length > 4 ? tagArray[4] : null,
                    pageable
            );
        }
        
        return boards.map(this::convertToResponse);
    }

    @Override
    public CommentResponse createComment(Long boardId, CommentRequest request, String loginId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        User user = userService.findByLoginId(loginId);
        
        Comment comment = new Comment();
        comment.setBoard(board);
        comment.setUser(user);
        comment.setContent(request.getContent());
        
        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
            comment.setDepth(parent.getDepth() + 1);
        } else {
            comment.setDepth(0);
        }
        
        Comment savedComment = commentRepository.save(comment);
        return convertToCommentResponse(savedComment);
    }

    @Override
    public CommentResponse updateComment(Long commentId, CommentRequest request, String loginId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("Access denied");
        }
        
        comment.setContent(request.getContent());
        Comment savedComment = commentRepository.save(comment);
        return convertToCommentResponse(savedComment);
    }

    @Override
    public void deleteComment(Long commentId, String loginId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUser().getLoginId().equals(loginId)) {
            throw new RuntimeException("Access denied");
        }
        
        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByBoardId(Long boardId) {
        List<Comment> comments = commentRepository.findByBoardIdOrderByCreateAtAsc(boardId);
        
        Map<Long, CommentResponse> commentMap = comments.stream()
                .collect(Collectors.toMap(
                        Comment::getId,
                        this::convertToCommentResponse
                ));
        
        List<CommentResponse> rootComments = new ArrayList<>();
        
        for (Comment comment : comments) {
            CommentResponse commentResponse = commentMap.get(comment.getId());
            
            if (comment.getParent() == null) {
                rootComments.add(commentResponse);
            } else {
                CommentResponse parentResponse = commentMap.get(comment.getParent().getId());
                if (parentResponse != null) {
                    if (parentResponse.getChildren() == null) {
                        parentResponse.setChildren(new ArrayList<>());
                    }
                    parentResponse.getChildren().add(commentResponse);
                }
            }
        }
        
        return rootComments;
    }

    private BoardResponse convertToResponse(Board board) {
        BoardResponse response = new BoardResponse();
        response.setId(board.getId());
        response.setTitle(board.getTitle());
        response.setContent(board.getContent());
        response.setCategory(board.getCategory());
        response.setTags(board.getTags());
        response.setPinned(board.isPinned());
        response.setReadCount(board.getReadCount());
        response.setCreateAt(board.getCreateAt());
        response.setUpdateAt(board.getUpdateAt());
        response.setAuthorName(board.getUser().getUserInfo().getName());
        response.setAuthorId(board.getUser().getId());
        
        // 이미지 목록 추가
        List<Album> albums = albumRepository.findByBoardId(board.getId());
        List<AlbumResponse> images = albums.stream()
                .map(this::convertToAlbumResponse)
                .collect(Collectors.toList());
        response.setImages(images);
        
        return response;
    }

    private CommentResponse convertToCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setCreateAt(comment.getCreateAt());
        response.setUpdateAt(comment.getUpdateAt());
        response.setDepth(comment.getDepth());
        response.setAuthorName(comment.getUser().getUserInfo().getName());
        response.setAuthorId(comment.getUser().getId());
        response.setParentId(comment.getParent() != null ? comment.getParent().getId() : null);
        return response;
    }
    
    @Override
    public AlbumResponse addImageToBoard(Long boardId, String imagePath, String description, String loginId) {
        User user = userService.findByLoginId(loginId);
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));
        
        Album album = new Album();
        album.setBoard(board);
        album.setUser(user);
        album.setImagePath(imagePath);
        album.setDescription(description);
        
        Album savedAlbum = albumRepository.save(album);
        return convertToAlbumResponse(savedAlbum);
    }
    
    @Override
    public List<AlbumResponse> getBoardImages(Long boardId) {
        List<Album> albums = albumRepository.findByBoardId(boardId);
        return albums.stream()
                .map(this::convertToAlbumResponse)
                .collect(Collectors.toList());
    }
    
    private AlbumResponse convertToAlbumResponse(Album album) {
        return AlbumResponse.builder()
                .id(album.getId())
                .imagePath(album.getImagePath())
                .description(album.getDescription())
                .createAt(album.getCreateAt())
                .updateAt(album.getUpdateAt())
                .authorName(album.getUser().getUserInfo().getName())
                .authorId(album.getUser().getId())
                .build();
    }
} 