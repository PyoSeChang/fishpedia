-- 모든 분류 시도 로그 테이블 (오답노트 포함)
CREATE TABLE classification_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,  -- 비로그인 유저도 가능
    predicted_fish_name VARCHAR(255),  -- AI 예측 물고기명
    confidence DECIMAL(5,2),  -- 신뢰도 (0.00~100.00)
    is_fish_detected BOOLEAN DEFAULT FALSE,  -- 물고기 감지 여부
    image_path VARCHAR(500),  -- 이미지 저장 경로 (선택적)
    original_filename VARCHAR(255),  -- 원본 파일명
    classification_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- 사용자 피드백 관련 (오답노트)
    user_corrected_fish_name VARCHAR(255) NULL,  -- 사용자가 수정한 물고기명
    is_correct BOOLEAN NULL,  -- 사용자 피드백: 맞음/틀림 (NULL=피드백없음)
    user_feedback_date DATETIME NULL,  -- 사용자 피드백 날짜
    
    -- 낚시 일지 연결
    fish_log_id BIGINT NULL,  -- 연결된 낚시 일지 ID
    
    -- 인덱스
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (fish_log_id) REFERENCES fish_log(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_predicted_fish (predicted_fish_name),
    INDEX idx_confidence (confidence),
    INDEX idx_classification_date (classification_date),
    INDEX idx_is_correct (is_correct),
    INDEX idx_fish_log_id (fish_log_id)
);

-- 사용자 수정 이력 테이블 (오답노트 상세)
CREATE TABLE classification_correction_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    classification_log_id BIGINT NOT NULL,
    old_fish_name VARCHAR(255),  -- 이전 물고기명 (AI 예측 또는 이전 수정값)
    new_fish_name VARCHAR(255),  -- 새로운 물고기명 (사용자 수정값)
    correction_reason TEXT,  -- 수정 이유 (선택적)
    correction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (classification_log_id) REFERENCES classification_log(id) ON DELETE CASCADE,
    INDEX idx_classification_log_id (classification_log_id),
    INDEX idx_correction_date (correction_date)
);