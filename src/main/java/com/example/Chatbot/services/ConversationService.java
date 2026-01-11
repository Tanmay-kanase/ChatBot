package com.example.Chatbot.services;

import com.example.Chatbot.models.conversation;
import com.example.Chatbot.models.user;
import com.example.Chatbot.repositories.ConversationRepository;
import com.example.Chatbot.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    // Create new conversation for a user
    public String createConversation(Long userId, String name) {
        // 1. Find the user (assuming you have a userRepository)
        user existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Build the conversation with the provided name
        conversation newConv = conversation.builder().user(existingUser).conversationName(name) // This
                                                                                                // fixes
                                                                                                // the
                                                                                                // "not-null"
                                                                                                // error
                .build();

        conversationRepository.save(newConv);
        return "Conversation '" + name + "' created successfully";
    }

    // Get all conversations of a user
    public List<conversation> getConversationsByUser(Long userId) {
        try {
            Optional<user> userOpt = userRepository.findById(userId);

            if (userOpt.isEmpty()) {
                return List.of();
            }

            return conversationRepository.findByUser(userOpt.get());

        } catch (Exception e) {
            return List.of();
        }
    }

    // Get single conversation by id
    public Optional<conversation> getConversationById(Long conversationId) {
        return conversationRepository.findById(conversationId);
    }

    // Delete conversation
    public String deleteConversation(Long conversationId) {
        try {
            if (!conversationRepository.existsById(conversationId)) {
                return "Conversation not found";
            }

            conversationRepository.deleteById(conversationId);
            return "Conversation deleted successfully";

        } catch (Exception e) {
            return "Error deleting conversation: " + e.getMessage();
        }
    }
}
