package com.fishiphedia.board.repository;

import com.fishiphedia.board.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByBoardIdOrderByCreateAtAsc(Long boardId);
}