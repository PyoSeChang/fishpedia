-- FishLog 테이블에 img_path 컬럼 추가
ALTER TABLE fish_log ADD COLUMN img_path VARCHAR(500);

-- 컬럼 설명 추가
ALTER TABLE fish_log MODIFY COLUMN img_path VARCHAR(500) COMMENT '물고기 사진 파일 경로'; 