package com.fishiphedia.board.repository;

import com.fishiphedia.board.entity.Album;
import com.fishiphedia.board.entity.Board;
import com.fishiphedia.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlbumRepository extends JpaRepository<Album, Long> {
    
    List<Album> findByUserOrderByCreateAtDesc(User user);
    
    Page<Album> findByUserOrderByCreateAtDesc(User user, Pageable pageable);
    
    Page<Album> findAllByOrderByCreateAtDesc(Pageable pageable);
    
    Optional<Album> findByBoard(Board board);
    
    List<Album> findByBoardId(Long boardId);
}