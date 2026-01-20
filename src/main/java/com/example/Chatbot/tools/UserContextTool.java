package com.example.Chatbot.tools;

import com.example.Chatbot.models.ClientConfig;
import com.example.Chatbot.services.ClientDataService;

import dev.langchain4j.agent.tool.Tool;

public class UserContextTool {

    private final ClientDataService dataService;
    private final ClientConfig config;
    private final String userId;

    public UserContextTool(ClientDataService dataService,
            ClientConfig config,
            String userId) {
        this.dataService = dataService;
        this.config = config;
        this.userId = userId;
    }

    @Tool("Get all parking info for the current user including vehicles, bookings, and payments")
    public String getFullUserContext() {
        return dataService.getJoinedUserData(config, userId);
    }
}
