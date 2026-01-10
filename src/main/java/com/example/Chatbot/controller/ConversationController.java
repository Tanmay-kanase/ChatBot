package com.example.Chatbot.controller;

import com.example.Chatbot.models.conversation;
import com.example.Chatbot.services.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    // Create conversation
    @PostMapping("/create/{userId}")
    public ResponseEntity<?> createConversation(@PathVariable Long userId) {
        String result = conversationService.createConversation(userId);
        return ResponseEntity.ok(result);
    }

    // Get all conversations of a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<conversation>> getUserConversations(@PathVariable Long userId) {
        List<conversation> conversations = conversationService.getConversationsByUser(userId);
        return ResponseEntity.ok(conversations);
    }

    // Get conversation by id
    @GetMapping("/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable Long conversationId) {
        Optional<conversation> conv = conversationService.getConversationById(conversationId);

        if (conv.isEmpty()) {
            return ResponseEntity.status(404).body("Conversation not found");
        }
        return ResponseEntity.ok(conv.get());
    }

    // Delete conversation
    @DeleteMapping("/{conversationId}")
    public ResponseEntity<?> deleteConversation(@PathVariable Long conversationId) {
        String result = conversationService.deleteConversation(conversationId);
        return ResponseEntity.ok(result);
    }
}
