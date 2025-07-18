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
        System.out.println("파일 업로드 시작 - 파일명: " + file.getOriginalFilename());
        System.out.println("파일 크기: " + file.getSize());
        System.out.println("업로드 경로: " + uploadPath);
        
        // 파일 유효성 검사
        if (file.isEmpty()) {
            throw new IOException("업로드할 파일이 비어있습니다.");
        }
        
        // 업로드 디렉토리 생성
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            System.out.println("업로드 디렉토리 생성: " + uploadDir.toAbsolutePath());
            Files.createDirectories(uploadDir);
        }

        // 파일 확장자 검증
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new IOException("파일명이 유효하지 않습니다.");
        }
        
        String fileExtension = "";
        if (originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        }
        
        // 허용된 확장자인지 확인
        if (!fileExtension.matches("\\.(jpg|jpeg|png|gif)")) {
            throw new IOException("지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif만 가능)");
        }
        
        // 파일명 중복 방지를 위한 UUID 생성
        String filename = UUID.randomUUID().toString() + fileExtension;

        // 파일 저장
        Path filePath = uploadDir.resolve(filename);
        System.out.println("파일 저장 경로: " + filePath.toAbsolutePath());
        
        Files.copy(file.getInputStream(), filePath);
        
        String returnPath = "/uploads/fish/" + filename;
        System.out.println("반환 경로: " + returnPath);
        
        return returnPath;
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