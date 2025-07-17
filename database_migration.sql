-- FishLog 테이블에 img_path 컬럼 추가
ALTER TABLE fish_log ADD COLUMN img_path VARCHAR(500);

-- 컬럼 설명 추가
ALTER TABLE fish_log MODIFY COLUMN img_path VARCHAR(500) COMMENT '물고기 사진 파일 경로';

-- Comment 테이블에 parent_id 컬럼 추가 (대댓글 기능)
ALTER TABLE comment ADD COLUMN parent_id BIGINT;

-- parent_id 외래키 제약조건 추가
ALTER TABLE comment ADD CONSTRAINT fk_comment_parent 
    FOREIGN KEY (parent_id) REFERENCES comment(id) ON DELETE CASCADE; 