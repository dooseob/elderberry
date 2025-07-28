package com.globalcarelink.agents.cleanup;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

/**
 * 중복 파일 탐지 및 정리 도구
 * - docs/* 와 src/main/resources/agents/* 디렉토리 간 중복 파일 찾기
 * - 파일 내용 기반 중복 검사
 * - 정리 권장사항 제시
 */
@Slf4j
@Component
public class DuplicateFileDetector {
    
    private final Map<String, List<FileInfo>> filesByHash = new ConcurrentHashMap<>();
    private final Map<String, List<FileInfo>> filesByName = new ConcurrentHashMap<>();
    
    /**
     * 중복 파일 검사 실행
     */
    public DuplicateAnalysisResult detectDuplicates() {
        log.info("중복 파일 검사 시작");
        
        clear();
        
        // 주요 디렉토리 스캔
        scanDirectory(Paths.get("docs"));
        scanDirectory(Paths.get("src/main/resources/agents"));
        scanDirectory(Paths.get("src/main/java/com/globalcarelink/agents"));
        
        // 중복 분석
        DuplicateAnalysisResult result = analyzeDuplicates();
        
        log.info("중복 파일 검사 완료: {}개 중복 그룹 발견", result.getDuplicateGroups().size());
        
        return result;
    }
    
    /**
     * 디렉토리 스캔
     */
    private void scanDirectory(Path directory) {
        if (!Files.exists(directory)) {
            log.warn("디렉토리가 존재하지 않습니다: {}", directory);
            return;
        }
        
        try (Stream<Path> paths = Files.walk(directory)) {
            paths.filter(Files::isRegularFile)
                .filter(this::shouldScanFile)
                .forEach(this::processFile);
                
        } catch (IOException e) {
            log.error("디렉토리 스캔 실패: {}", directory, e);
        }
    }
    
    /**
     * 파일 스캔 여부 결정
     */
    private boolean shouldScanFile(Path path) {
        String fileName = path.getFileName().toString().toLowerCase();
        String pathStr = path.toString().toLowerCase();
        
        // 스캔할 파일 유형
        boolean isTargetFile = fileName.endsWith(".md") ||
                              fileName.endsWith(".js") ||
                              fileName.endsWith(".java") ||
                              fileName.endsWith(".json") ||
                              fileName.endsWith(".yml") ||
                              fileName.endsWith(".yaml");
        
        // 제외할 디렉토리
        boolean isExcluded = pathStr.contains("node_modules") ||
                            pathStr.contains("target") ||
                            pathStr.contains("build") ||
                            pathStr.contains(".git");
        
        return isTargetFile && !isExcluded;
    }
    
    /**
     * 파일 처리
     */
    private void processFile(Path path) {
        try {
            String content = Files.readString(path);
            String hash = calculateHash(content);
            String fileName = path.getFileName().toString();
            
            FileInfo fileInfo = new FileInfo(path, hash, content.length(), fileName);
            
            // 해시별 그룹화
            filesByHash.computeIfAbsent(hash, k -> new ArrayList<>()).add(fileInfo);
            
            // 파일명별 그룹화
            filesByName.computeIfAbsent(fileName.toLowerCase(), k -> new ArrayList<>()).add(fileInfo);
            
        } catch (IOException e) {
            log.error("파일 처리 실패: {}", path, e);
        }
    }
    
    /**
     * 파일 해시 계산
     */
    private String calculateHash(String content) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(content.getBytes());
            
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("MD5 알고리즘을 찾을 수 없습니다", e);
        }
    }
    
    /**
     * 중복 분석
     */
    private DuplicateAnalysisResult analyzeDuplicates() {
        List<DuplicateGroup> duplicateGroups = new ArrayList<>();
        Set<String> processedHashes = new HashSet<>();
        
        // 내용 기반 중복 (완전 일치)
        for (Map.Entry<String, List<FileInfo>> entry : filesByHash.entrySet()) {
            List<FileInfo> files = entry.getValue();
            if (files.size() > 1) {
                String hash = entry.getKey();
                if (!processedHashes.contains(hash)) {
                    DuplicateGroup group = new DuplicateGroup(
                        DuplicateType.EXACT_CONTENT,
                        files,
                        "동일한 내용의 파일들"
                    );
                    duplicateGroups.add(group);
                    processedHashes.add(hash);
                }
            }
        }
        
        // 파일명 기반 중복 (서로 다른 디렉토리)
        for (Map.Entry<String, List<FileInfo>> entry : filesByName.entrySet()) {
            List<FileInfo> files = entry.getValue();
            if (files.size() > 1) {
                // 서로 다른 디렉토리에 있는 동일 파일명만 체크
                Set<String> directories = new HashSet<>();
                for (FileInfo file : files) {
                    directories.add(file.getPath().getParent().toString());
                }
                
                if (directories.size() > 1) {
                    // 내용이 다른 경우만 (이미 내용 중복은 위에서 처리)
                    Set<String> hashes = new HashSet<>();
                    for (FileInfo file : files) {
                        hashes.add(file.getHash());
                    }
                    
                    if (hashes.size() > 1) {
                        DuplicateGroup group = new DuplicateGroup(
                            DuplicateType.SAME_NAME_DIFFERENT_CONTENT,
                            files,
                            "동일한 파일명, 다른 내용"
                        );
                        duplicateGroups.add(group);
                    }
                }
            }
        }
        
        // 정리 권장사항 생성
        List<CleanupRecommendation> recommendations = generateRecommendations(duplicateGroups);
        
        return new DuplicateAnalysisResult(duplicateGroups, recommendations);
    }
    
    /**
     * 정리 권장사항 생성
     */
    private List<CleanupRecommendation> generateRecommendations(List<DuplicateGroup> duplicateGroups) {
        List<CleanupRecommendation> recommendations = new ArrayList<>();
        
        for (DuplicateGroup group : duplicateGroups) {
            switch (group.getType()) {
                case EXACT_CONTENT -> {
                    // 동일한 내용의 파일들 - 하나만 남기고 삭제
                    FileInfo primaryFile = selectPrimaryFile(group.getFiles());
                    List<FileInfo> filesToDelete = new ArrayList<>(group.getFiles());
                    filesToDelete.remove(primaryFile);
                    
                    recommendations.add(new CleanupRecommendation(
                        CleanupAction.DELETE_DUPLICATES,
                        primaryFile,
                        filesToDelete,
                        "동일한 내용이므로 " + primaryFile.getPath() + "만 유지하고 나머지 삭제"
                    ));
                }
                
                case SAME_NAME_DIFFERENT_CONTENT -> {
                    // 동일한 파일명, 다른 내용 - 통합 또는 이름 변경 필요
                    recommendations.add(new CleanupRecommendation(
                        CleanupAction.MERGE_OR_RENAME,
                        null,
                        group.getFiles(),
                        "동일한 파일명이지만 내용이 다름. 통합하거나 구분되는 이름으로 변경 필요"
                    ));
                }
            }
        }
        
        return recommendations;
    }
    
    /**
     * 주 파일 선택
     */
    private FileInfo selectPrimaryFile(List<FileInfo> files) {
        // 우선순위: 에이전트 시스템 내 파일 > docs > 기타
        return files.stream()
            .min((f1, f2) -> {
                String path1 = f1.getPath().toString();
                String path2 = f2.getPath().toString();
                
                if (path1.contains("agents") && !path2.contains("agents")) return -1;
                if (!path1.contains("agents") && path2.contains("agents")) return 1;
                
                if (path1.contains("docs") && !path2.contains("docs")) return -1;
                if (!path1.contains("docs") && path2.contains("docs")) return 1;
                
                return path1.compareTo(path2);
            })
            .orElse(files.get(0));
    }
    
    /**
     * 데이터 초기화
     */
    private void clear() {
        filesByHash.clear();
        filesByName.clear();
    }
    
    // Inner classes
    
    public static class FileInfo {
        private final Path path;
        private final String hash;
        private final long size;
        private final String fileName;
        
        public FileInfo(Path path, String hash, long size, String fileName) {
            this.path = path;
            this.hash = hash;
            this.size = size;
            this.fileName = fileName;
        }
        
        public Path getPath() { return path; }
        public String getHash() { return hash; }
        public long getSize() { return size; }
        public String getFileName() { return fileName; }
        
        @Override
        public String toString() {
            return String.format("%s (%d bytes)", path, size);
        }
    }
    
    public static class DuplicateGroup {
        private final DuplicateType type;
        private final List<FileInfo> files;
        private final String description;
        
        public DuplicateGroup(DuplicateType type, List<FileInfo> files, String description) {
            this.type = type;
            this.files = files;
            this.description = description;
        }
        
        public DuplicateType getType() { return type; }
        public List<FileInfo> getFiles() { return files; }
        public String getDescription() { return description; }
    }
    
    public static class CleanupRecommendation {
        private final CleanupAction action;
        private final FileInfo primaryFile;
        private final List<FileInfo> targetFiles;
        private final String description;
        
        public CleanupRecommendation(CleanupAction action, FileInfo primaryFile, 
                                   List<FileInfo> targetFiles, String description) {
            this.action = action;
            this.primaryFile = primaryFile;
            this.targetFiles = targetFiles;
            this.description = description;
        }
        
        public CleanupAction getAction() { return action; }
        public FileInfo getPrimaryFile() { return primaryFile; }
        public List<FileInfo> getTargetFiles() { return targetFiles; }
        public String getDescription() { return description; }
    }
    
    public static class DuplicateAnalysisResult {
        private final List<DuplicateGroup> duplicateGroups;
        private final List<CleanupRecommendation> recommendations;
        
        public DuplicateAnalysisResult(List<DuplicateGroup> duplicateGroups, 
                                     List<CleanupRecommendation> recommendations) {
            this.duplicateGroups = duplicateGroups;
            this.recommendations = recommendations;
        }
        
        public List<DuplicateGroup> getDuplicateGroups() { return duplicateGroups; }
        public List<CleanupRecommendation> getRecommendations() { return recommendations; }
        
        public int getTotalDuplicates() {
            return duplicateGroups.stream()
                .mapToInt(group -> group.getFiles().size() - 1)
                .sum();
        }
    }
    
    public enum DuplicateType {
        EXACT_CONTENT,
        SAME_NAME_DIFFERENT_CONTENT,
        SIMILAR_CONTENT
    }
    
    public enum CleanupAction {
        DELETE_DUPLICATES,
        MERGE_OR_RENAME,
        MANUAL_REVIEW
    }
}