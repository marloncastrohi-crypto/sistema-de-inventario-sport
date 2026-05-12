package com.sportstock.repository;

import com.sportstock.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findByCode(String code);
    boolean existsByCode(String code);
}
