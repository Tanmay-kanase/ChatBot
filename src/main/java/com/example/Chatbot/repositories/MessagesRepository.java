package com.example.Chatbot.repositories;

import com.example.Chatbot.models.messages;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessagesRepository extends JpaRepository<messages, Long> {

    // get all messages of a conversation
    List<messages> findByConversation_ConversationId(Long conversationId);
}
