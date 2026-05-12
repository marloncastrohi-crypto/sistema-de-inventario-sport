package com.sportstock.web.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CheckoutRequest {

    private String requester;

    @Valid
    @NotEmpty
    private List<CheckoutItemRequest> items;

    public List<CheckoutItemRequest> getItems() {
        return items;
    }

    public void setItems(List<CheckoutItemRequest> items) {
        this.items = items;
    }

    public String getRequester() {
        return requester;
    }

    public void setRequester(String requester) {
        this.requester = requester;
    }
}
