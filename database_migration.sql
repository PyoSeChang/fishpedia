-- FishLog 테이블에 img_path 컬럼 추가
ALTER TABLE fish_log ADD COLUMN img_path VARCHAR(500);

-- 컬럼 설명 추가
ALTER TABLE fish_log MODIFY COLUMN img_path VARCHAR(500) COMMENT '물고기 사진 파일 경로';

-- Comment 테이블에 parent_id 컬럼 추가 (대댓글 기능)
ALTER TABLE comment ADD COLUMN parent_id BIGINT;

-- parent_id 외래키 제약조건 추가
ALTER TABLE comment ADD CONSTRAINT fk_comment_parent 
    FOREIGN KEY (parent_id) REFERENCES comment(id) ON DELETE CASCADE;

-- FishLog 테이블에 certified 컬럼 추가 (검증 상태)
ALTER TABLE fish_log ADD COLUMN certified BOOLEAN NOT NULL DEFAULT FALSE;

-- 컬럼 설명 추가
ALTER TABLE fish_log MODIFY COLUMN certified BOOLEAN NOT NULL DEFAULT FALSE COMMENT '낚시 일지 검증 상태 (랭킹 등록 여부)';

-- RankingCollection 테이블 생성 (검증된 낚시 일지 기반 랭킹)
CREATE TABLE ranking_collection (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    fish_id BIGINT NOT NULL,
    highest_score INT NOT NULL DEFAULT 0 COMMENT '최고 점수',
    highest_length DOUBLE DEFAULT 0.0 COMMENT '최고 길이',
    total_score INT NOT NULL DEFAULT 0 COMMENT '총 점수',
    catch_count INT NOT NULL DEFAULT 0 COMMENT '잡은 횟수',
    UNIQUE KEY uk_user_fish (user_id, fish_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (fish_id) REFERENCES fish(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='검증된 낚시 일지 기반 랭킹 테이블'; 