package com.example.Chatbot.controller;

import com.example.Chatbot.models.user;
import com.example.Chatbot.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody user user) {
        Map<String, Object> result = userService.signup(user);

        // If the service returned an error key, send a 400 Bad Request
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }

        // Otherwise, send 200 OK with the user and token
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        return userService.login(body.get("email"), body.get("password"));
    }

    @GetMapping("/users")
    public List<user> getAll() {
        return userService.getAll();
    }

    @GetMapping("/users/{email}")
    public user getByEmail(@PathVariable String email) {
        user u = userService.getByEmail(email);
        if (u != null)
            u.setPassword(null);
        return u;
    }

    @PutMapping("/users/{email}")
    public user updateByEmail(@PathVariable String email, @RequestBody user updatedUser) {
        user u = userService.updateByEmail(email, updatedUser);
        if (u != null)
            u.setPassword(null);
        return u;
    }

    @DeleteMapping("/users/{email}")
    public Map<String, String> delete(@PathVariable String email) {
        boolean deleted = userService.deleteByEmail(email);

        Map<String, String> res = new HashMap<>();
        if (deleted)
            res.put("message", "User deleted successfully");
        else
            res.put("error", "User not found");

        return res;
    }
}
