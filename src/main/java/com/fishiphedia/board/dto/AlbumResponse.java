package com.fishiphedia.board.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class AlbumResponse {
    private Long id;
    private String imagePath;
    private String description;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    private String authorName;
    private Long authorId;
}