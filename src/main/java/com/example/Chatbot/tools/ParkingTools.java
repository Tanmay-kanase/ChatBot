package com.example.Chatbot.tools;

import com.example.Chatbot.models.ClientConfig;
import com.example.Chatbot.services.ClientDataService;

import dev.langchain4j.agent.tool.P;
import dev.langchain4j.agent.tool.Tool;

public class ParkingTools {

    private final ClientDataService dataService;
    private final ClientConfig config;
    private final String userId;

    public ParkingTools(ClientDataService dataService,
            ClientConfig config,
            String userId) {
        this.dataService = dataService;
        this.config = config;
        this.userId = userId;
    }

    @Tool("Get the list of vehicles owned by the user")
    public String getUserVehicles() {
        return dataService.fetchUserData(config, "vehicles", userId);
    }

    @Tool("Get the user's active parking bookings and slot details")
    public String getActiveBookings() {
        return dataService.fetchUserData(config, "bookings", userId);
    }

    @Tool("Get the user's payment history and statuses")
    public String getPaymentHistory() {
        return dataService.fetchUserData(config, "payments", userId);
    }

    @Tool("Update the user's profile name")
    public String updateUserName(
            @P("New full name of the user") String newName) {
        return dataService.updateUserField(
                config, userId, "name", newName);
    }
}
