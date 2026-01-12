package com.example.Chatbot.controllers;

import com.example.Chatbot.models.messages;
import com.example.Chatbot.services.MessagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessagesController {

    @Autowired
    private MessagesService messagesService;

    //  Send message
    @PostMapping("/send")
    public messages sendMessage(@RequestBody Map<String, String> payload) {

        Long conversationId = Long.parseLong(payload.get("conversationId"));
        String sender = payload.get("sender"); // "user" or "bot"
        String text = payload.get("messageText");

        return messagesService.saveMessage(conversationId, sender, text);
    }

    //  Get messages of a conversation
    @GetMapping("/conversation/{conversationId}")
    public List<messages> getConversationMessages(@PathVariable Long conversationId) {
        return messagesService.getMessagesByConversation(conversationId);
    }

    //  Delete message
    @DeleteMapping("/{messageId}")
    public String deleteMessage(@PathVariable Long messageId) {
        return messagesService.deleteMessage(messageId);
    }
}
