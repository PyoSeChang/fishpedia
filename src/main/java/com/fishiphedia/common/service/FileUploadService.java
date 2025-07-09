package com.fishiphedia.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${file.upload.path}")
    private String uploadPath;

    public String uploadFile(MultipartFile file) throws IOException {
        // 업로드 디렉토리 생성
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 파일명 중복 방지를 위한 UUID 생성
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + fileExtension;

        // 파일 저장
        Path filePath = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        // 상대 경로 반환 (클라이언트에서 접근 가능한 경로)
        return "/uploads/fish/" + filename;
    }

    public void deleteFile(String filePath) {
        try {
            if (filePath != null && filePath.startsWith("/uploads/fish/")) {
                String filename = filePath.substring("/uploads/fish/".length());
                Path fullPath = Paths.get(uploadPath, filename);
                Files.deleteIfExists(fullPath);
            }
        } catch (IOException e) {
            // 로그만 남기고 예외는 던지지 않음
            System.err.println("파일 삭제 실패: " + filePath);
        }
    }
} 