package com.fishiphedia.board.dto;

import com.fishiphedia.board.entity.BoardCategory;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardRequest {
    private String title;
    private String content; // HTML 콘텐츠 지원
    private BoardCategory category;
    private String tags;
    private boolean pinned;
}