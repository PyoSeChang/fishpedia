package com.fishiphedia.board.dto;

import com.fishiphedia.board.entity.BoardCategory;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class BoardResponse {
    private Long id;
    private String title;
    private String content;
    private BoardCategory category;
    private String tags;
    private boolean pinned;
    private int readCount;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    private String authorName;
    private Long authorId;
    private List<AlbumResponse> images;
}