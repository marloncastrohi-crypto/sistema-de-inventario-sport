package com.sportstock.web;

import com.sportstock.model.InventoryItem;
import com.sportstock.service.InventoryService;
import com.sportstock.web.dto.InventoryRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryService.getAll();
    }

    @GetMapping("/{id}")
    public InventoryItem getById(@PathVariable Long id) {
        return inventoryService.getById(id);
    }

    @PostMapping
    public InventoryItem create(@Valid @RequestBody InventoryRequest request) {
        return inventoryService.create(request);
    }

    @PutMapping("/{id}")
    public InventoryItem update(@PathVariable Long id, @Valid @RequestBody InventoryRequest request) {
        return inventoryService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inventoryService.delete(id);
    }
}
