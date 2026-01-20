package com.example.Chatbot.services;

import java.util.ArrayList;

import org.springframework.stereotype.Service;

import com.example.Chatbot.models.ClientConfig;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;

@Service
public class ClientDataService {

    public String fetchUserData(ClientConfig config,
            String collectionName,
            String userId) {

        try (MongoClient mongoClient = MongoClients.create(config.getMongoUri())) {

            MongoDatabase database = mongoClient.getDatabase(config.getDatabaseName());

            var collection = database.getCollection(collectionName);

            var results = collection
                    .find(Filters.eq("userId", userId))
                    .into(new ArrayList<>());

            return results.isEmpty()
                    ? "No data found"
                    : results.toString();

        } catch (Exception e) {
            return "Error fetching data: " + e.getMessage();
        }
    }

    // ✅ Correct update logic
    public String updateUserField(ClientConfig config,
            String userId,
            String field,
            String value) {

        try (MongoClient mongoClient = MongoClients.create(config.getMongoUri())) {

            MongoDatabase database = mongoClient.getDatabase(config.getDatabaseName());

            var result = database.getCollection("users")
                    .updateOne(
                            Filters.eq("userId", userId),
                            Updates.set(field, value));

            return result.getMatchedCount() == 0
                    ? "User not found"
                    : "Updated " + field + " successfully";

        } catch (Exception e) {
            return "Update failed: " + e.getMessage();
        }
    }

    // 🔥 Aggregated context for AI
    public String getJoinedUserData(ClientConfig config, String userId) {
        return """
                Vehicles: %s
                Bookings: %s
                Payments: %s
                """.formatted(
                fetchUserData(config, "vehicles", userId),
                fetchUserData(config, "bookings", userId),
                fetchUserData(config, "payments", userId));
    }
}
