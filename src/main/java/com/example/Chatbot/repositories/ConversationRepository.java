package com.example.Chatbot.repositories;

import com.example.Chatbot.models.conversation;
import com.example.Chatbot.models.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationRepository extends JpaRepository<conversation, Long> {

    // Get all conversations of a user
    List<conversation> findByUser(user user);

    List<conversation> findByUserOrderByCreatedAtDesc(user user);

}
