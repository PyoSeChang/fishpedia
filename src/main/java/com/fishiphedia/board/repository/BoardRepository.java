package com.fishiphedia.board.repository;

import com.fishiphedia.board.entity.Board;
import com.fishiphedia.board.entity.BoardCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    
    Page<Board> findByCategory(BoardCategory category, Pageable pageable);
    
    @Query("SELECT b FROM Board b WHERE " +
           "(b.title LIKE %:keyword% OR b.content LIKE %:keyword% OR b.tags LIKE %:keyword%)")
    Page<Board> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT b FROM Board b WHERE b.category = :category AND " +
           "(b.title LIKE %:keyword% OR b.content LIKE %:keyword% OR b.tags LIKE %:keyword%)")
    Page<Board> findByCategoryAndKeyword(@Param("category") BoardCategory category, 
                                       @Param("keyword") String keyword, 
                                       Pageable pageable);
                                       
    // 제목으로만 검색
    @Query("SELECT b FROM Board b WHERE b.title LIKE %:title%")
    Page<Board> findByTitle(@Param("title") String title, Pageable pageable);
    
    // 여러 태그로 검색 (태그 중 하나라도 포함된 게시글 찾기)
    @Query("SELECT b FROM Board b WHERE " +
           "(:tags IS NULL OR " +
           "LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag1, '%')) " +
           "OR (:tag2 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag2, '%'))) " +
           "OR (:tag3 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag3, '%'))) " +
           "OR (:tag4 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag4, '%'))) " +
           "OR (:tag5 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag5, '%'))))")
    Page<Board> findByTags(@Param("tags") String tags, @Param("tag1") String tag1, 
                           @Param("tag2") String tag2, @Param("tag3") String tag3,
                           @Param("tag4") String tag4, @Param("tag5") String tag5, 
                           Pageable pageable);
    
    // 제목과 태그로 함께 검색
    @Query("SELECT b FROM Board b WHERE " +
           "(:title IS NULL OR b.title LIKE %:title%) " +
           "AND (:tags IS NULL OR " +
           "LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag1, '%')) " +
           "OR (:tag2 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag2, '%'))) " +
           "OR (:tag3 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag3, '%'))) " +
           "OR (:tag4 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag4, '%'))) " +
           "OR (:tag5 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag5, '%'))))")
    Page<Board> findByTitleAndTags(@Param("title") String title, @Param("tags") String tags, 
                                   @Param("tag1") String tag1, @Param("tag2") String tag2, 
                                   @Param("tag3") String tag3, @Param("tag4") String tag4, 
                                   @Param("tag5") String tag5, Pageable pageable);
    
    // 카테고리, 제목, 태그로 함께 검색
    @Query("SELECT b FROM Board b WHERE " +
           "b.category = :category " +
           "AND (:title IS NULL OR b.title LIKE %:title%) " +
           "AND (:tags IS NULL OR " +
           "LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag1, '%')) " +
           "OR (:tag2 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag2, '%'))) " +
           "OR (:tag3 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag3, '%'))) " +
           "OR (:tag4 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag4, '%'))) " +
           "OR (:tag5 IS NOT NULL AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag5, '%'))))")
    Page<Board> findByCategoryAndTitleAndTags(@Param("category") BoardCategory category, 
                                              @Param("title") String title, @Param("tags") String tags,
                                              @Param("tag1") String tag1, @Param("tag2") String tag2,
                                              @Param("tag3") String tag3, @Param("tag4") String tag4,
                                              @Param("tag5") String tag5, Pageable pageable);
}