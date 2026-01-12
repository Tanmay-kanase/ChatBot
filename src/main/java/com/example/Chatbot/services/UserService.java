package com.example.Chatbot.services;

import com.example.Chatbot.models.user;
import com.example.Chatbot.repositories.UserRepository;
import com.example.Chatbot.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> signup(user user) {

        Map<String, Object> res = new HashMap<>();

        try {
            if (userRepository.existsByEmail(user.getEmail())) {
                res.put("error", "Email already exists");
                return res;
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user saved = userRepository.save(user);

            String token = jwtUtil.generateToken(saved.getEmail());


            res.put("user", saved);
            res.put("token", token);
            return res;

        } catch (Exception e) {
            res.put("error", "Signup failed");
            return res;
        }
    }

    public Map<String, Object> login(String email, String password) {

        Map<String, Object> res = new HashMap<>();

        try {
            user u = userRepository.findByEmail(email).orElse(null);

            if (u == null) {
                res.put("error", "Email not found");
                return res;
            }

            if (!passwordEncoder.matches(password, u.getPassword())) {
                res.put("error", "Wrong password");
                return res;
            }

            String token = jwtUtil.generateToken(u.getEmail());


            res.put("user", u);
            res.put("token", token);
            return res;

        } catch (Exception e) {
            res.put("error", "Login failed");
            return res;
        }
    }

    public List<user> getAll() {
        return userRepository.findAll();
    }

    public user getByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public user updateByEmail(String email, user updatedUser) {

        user existing = getByEmail(email);
        if (existing == null)
            return null;

        if (updatedUser.getUsername() != null)
            existing.setUsername(updatedUser.getUsername());

        if (updatedUser.getPassword() != null)
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));

        return userRepository.save(existing);
    }

    public boolean deleteByEmail(String email) {
        user u = getByEmail(email);
        if (u == null)
            return false;

        userRepository.delete(u);
        return true;
    }
}
