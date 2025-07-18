package com.fishiphedia.board.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CommentResponse {
    private Long id;
    private String content;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    private int depth;
    private String authorName;
    private Long authorId;
    private Long parentId;
    private List<CommentResponse> children;
}