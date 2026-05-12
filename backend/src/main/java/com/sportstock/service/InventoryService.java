package com.sportstock.service;

import com.sportstock.model.InventoryItem;
import com.sportstock.repository.InventoryRepository;
import com.sportstock.web.dto.InventoryRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public List<InventoryItem> getAll() {
        return inventoryRepository.findAll();
    }

    public InventoryItem getById(Long id) {
        return inventoryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Item not found"));
    }

    public InventoryItem create(InventoryRequest request) {
        if (inventoryRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Code already exists");
        }

        InventoryItem item = new InventoryItem();
        applyRequest(item, request);
        return inventoryRepository.save(item);
    }

    public InventoryItem update(Long id, InventoryRequest request) {
        InventoryItem item = getById(id);
        if (!item.getCode().equals(request.getCode()) && inventoryRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Code already exists");
        }
        applyRequest(item, request);
        return inventoryRepository.save(item);
    }

    public void delete(Long id) {
        inventoryRepository.deleteById(id);
    }

    private void applyRequest(InventoryItem item, InventoryRequest request) {
        item.setCode(request.getCode());
        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setQuantity(request.getQuantity());
        item.setDescription(request.getDescription());
        item.setImageUrl(request.getImageUrl());
    }
}
