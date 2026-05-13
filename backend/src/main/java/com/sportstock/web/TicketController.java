package com.sportstock.web;

import com.sportstock.model.Ticket;
import com.sportstock.service.TicketService;
import com.sportstock.web.dto.TicketRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public List<Ticket> getAll() {
        return ticketService.getAll();
    }

    @GetMapping("/{id}")
    public Ticket getById(@PathVariable Long id) {
        return ticketService.getById(id);
    }

    @PostMapping
    public Ticket create(@Valid @RequestBody TicketRequest request, HttpServletRequest httpRequest) {
        RoleGuard.requireAdmin(httpRequest);
        return ticketService.create(request);
    }

    @PutMapping("/{id}")
    public Ticket update(@PathVariable Long id, @Valid @RequestBody TicketRequest request, HttpServletRequest httpRequest) {
        RoleGuard.requireAdmin(httpRequest);
        return ticketService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        RoleGuard.requireAdmin(httpRequest);
        ticketService.delete(id);
    }
}
