package com.fishiphedia.board.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentRequest {
    private String content;
    private Long parentId;
}