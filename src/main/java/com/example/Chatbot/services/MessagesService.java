package com.example.Chatbot.services;

import com.example.Chatbot.models.conversation;
import com.example.Chatbot.models.messages;
import com.example.Chatbot.repositories.ConversationRepository;
import com.example.Chatbot.repositories.MessagesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessagesService {

    @Autowired
    private MessagesRepository messagesRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    // Save a new message
    public messages saveMessage(Long conversationId, String sender, String text) {

        conversation convo = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        messages msg = messages.builder()
                .conversation(convo)
                .sender(sender)
                .messageText(text)
                .build();

        return messagesRepository.save(msg);
    }

    // Get all messages of a conversation
    public List<messages> getMessagesByConversation(Long conversationId) {
        return messagesRepository.findByConversation_ConversationId(conversationId);
    }

    //  Delete a message
    public String deleteMessage(Long messageId) {
        if (!messagesRepository.existsById(messageId)) {
            return "Message not found";
        }
        messagesRepository.deleteById(messageId);
        return "Message deleted successfully";
    }
}
