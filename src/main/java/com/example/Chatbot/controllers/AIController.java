package com.example.Chatbot.controllers;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.Chatbot.models.ClientConfig;
import com.example.Chatbot.models.UserRequest;
import com.example.Chatbot.services.ClientDataService;
import com.example.Chatbot.tools.UserContextTool;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.ollama.OllamaChatModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;

@RestController
@RequestMapping("/api/AI/service")
public class AIController {

        @Autowired
        private ClientDataService dataService;

        @PostMapping("/{apiKey}")
        public String chat(@PathVariable String apiKey,
                        @RequestBody UserRequest req) {

                // 1️⃣ Client DB configuration (should come from DB later)
                ClientConfig config = ClientConfig.builder()
                                .apiKey(apiKey)
                                .clientName("default-client")
                                .mongoUri("mongodb://localhost:27017")
                                .databaseName("parkingapp")
                                .build();

                // 2️⃣ Ollama model setup
                ChatLanguageModel model = OllamaChatModel.builder()
                                .baseUrl("http://localhost:11434")
                                .modelName("llama3.2:3b")
                                .timeout(Duration.ofSeconds(60))
                                .build();

                // 3️⃣ Tool initialization
                UserContextTool contextTool = new UserContextTool(dataService, config, req.getUserId());

                // 4️⃣ AI Agent
                ParkingAgent agent = AiServices.builder(ParkingAgent.class)
                                .chatLanguageModel(model)
                                .tools(contextTool)
                                .build();

                return agent.answer(req.getUserquery());
        }
}

interface ParkingAgent {

        @SystemMessage("""
                        You are a helpful parking assistant.
                        Always use available tools to fetch user data
                        before answering questions.
                        """)
        String answer(String query);
}
