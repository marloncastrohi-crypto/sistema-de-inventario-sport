package com.sportstock.service;

import com.sportstock.model.InventoryItem;
import com.sportstock.model.Ticket;
import com.sportstock.repository.InventoryRepository;
import com.sportstock.repository.TicketRepository;
import com.sportstock.web.dto.CheckoutItemRequest;
import com.sportstock.web.dto.CheckoutRequest;
import com.sportstock.web.dto.CheckoutResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class CartService {

    private final InventoryRepository inventoryRepository;
    private final TicketRepository ticketRepository;

    public CartService(InventoryRepository inventoryRepository, TicketRepository ticketRepository) {
        this.inventoryRepository = inventoryRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public CheckoutResponse checkout(String requester, CheckoutRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        StringBuilder description = new StringBuilder("Prestamo de implementos:\n");
        BigDecimal total = BigDecimal.ZERO;

        for (CheckoutItemRequest itemRequest : request.getItems()) {
            InventoryItem item = inventoryRepository.findById(itemRequest.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found"));

            if (itemRequest.getQty() <= 0) {
                throw new IllegalArgumentException("Invalid quantity");
            }
            if (item.getQuantity() < itemRequest.getQty()) {
                throw new IllegalArgumentException("Not enough stock for " + item.getName());
            }

            BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQty()));
            total = total.add(subtotal);
            description.append("- ")
                .append(itemRequest.getQty())
                .append("x ")
                .append(item.getName())
                .append(" = ")
                .append(subtotal)
                .append("\n");

            item.setQuantity(item.getQuantity() - itemRequest.getQty());
            inventoryRepository.save(item);
        }

        description.append("\nTotal general: ").append(total);

        Ticket ticket = new Ticket();
        ticket.setTitle("Prestamo de Carrito");
        ticket.setRequester(requester);
        ticket.setStatus("Abierto");
        ticket.setDescription(description.toString());
        ticket.setDate(LocalDate.now());

        Ticket savedTicket = ticketRepository.save(ticket);
        return new CheckoutResponse(savedTicket.getId(), total, savedTicket.getDescription());
    }
}
