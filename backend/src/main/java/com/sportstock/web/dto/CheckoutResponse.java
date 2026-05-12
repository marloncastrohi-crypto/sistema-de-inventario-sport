package com.sportstock.web.dto;

import java.math.BigDecimal;

public class CheckoutResponse {

    private Long ticketId;
    private BigDecimal total;
    private String description;

    public CheckoutResponse(Long ticketId, BigDecimal total, String description) {
        this.ticketId = ticketId;
        this.total = total;
        this.description = description;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public String getDescription() {
        return description;
    }
}
