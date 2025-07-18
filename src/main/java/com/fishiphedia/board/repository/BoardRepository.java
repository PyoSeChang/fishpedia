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
}