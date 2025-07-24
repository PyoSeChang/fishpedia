-- 고신뢰도 분류 결과 저장 테이블 생성 (비로그인 유저도 사용 가능)
CREATE TABLE classification_storage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,  -- NULL 허용으로 비로그인 유저도 사용 가능
    predicted_fish_name VARCHAR(255) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    image_path VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255),
    classification_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_confidence (confidence),
    INDEX idx_fish_name (predicted_fish_name),
    INDEX idx_classification_date (classification_date),
    INDEX idx_user_id (user_id)
);

-- 분류 저장소 폴더 구조 생성을 위한 참고 쿼리
-- (실제 폴더는 애플리케이션에서 생성)
-- classification_storage/
-- ├── 고등어/
-- ├── 갈치/
-- ├── 광어/
-- └── ...

-- 기존 fish 테이블에서 어종 목록 확인을 위한 쿼리
SELECT DISTINCT name FROM fish ORDER BY name;