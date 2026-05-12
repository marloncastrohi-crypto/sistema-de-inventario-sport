package com.sportstock.service;

import com.sportstock.model.Ticket;
import com.sportstock.repository.TicketRepository;
import com.sportstock.web.dto.TicketRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public List<Ticket> getAll() {
        return ticketRepository.findAll();
    }

    public Ticket getById(Long id) {
        return ticketRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));
    }

    public Ticket create(TicketRequest request) {
        Ticket ticket = new Ticket();
        applyRequest(ticket, request);
        return ticketRepository.save(ticket);
    }

    public Ticket update(Long id, TicketRequest request) {
        Ticket ticket = getById(id);
        applyRequest(ticket, request);
        return ticketRepository.save(ticket);
    }

    public void delete(Long id) {
        ticketRepository.deleteById(id);
    }

    private void applyRequest(Ticket ticket, TicketRequest request) {
        ticket.setTitle(request.getTitle());
        ticket.setRequester(request.getRequester());
        ticket.setStatus(request.getStatus());
        ticket.setDescription(request.getDescription());
        ticket.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
    }
}
