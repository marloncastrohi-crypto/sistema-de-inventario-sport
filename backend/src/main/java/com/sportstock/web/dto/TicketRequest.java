package com.sportstock.web.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class TicketRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String requester;

    @NotBlank
    private String status;

    @NotBlank
    private String description;

    private LocalDate date;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRequester() {
        return requester;
    }

    public void setRequester(String requester) {
        this.requester = requester;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
