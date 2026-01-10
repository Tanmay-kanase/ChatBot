package com.example.Chatbot.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                return http
                                // 1. Disable CSRF for APIs (Modern Lambda style)
                                .csrf(AbstractHttpConfigurer::disable)

                                // 2. Handle CORS (Essential for frontend integration)
                                .cors(Customizer.withDefaults())

                                // 3. Set Session Policy to Stateless (Industry standard for APIs)
                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                // 4. Request Authorization
                                .authorizeHttpRequests(auth -> auth
                                                // Public Assets & Static Resources
                                                .requestMatchers("/", "/login", "/signup", "/chat",
                                                                "/css/**", "/js/**", "/**/*.png",
                                                                "/**/*.jpg", "/**/*.jpeg",
                                                                "/**/*.gif", "/**/*.svg",
                                                                "/**/*.ico", "/images/**",
                                                                "/webjars/**")
                                                .permitAll()

                                                // Public Pages
                                                .requestMatchers("/home", "/about", "/contact")
                                                .permitAll()

                                                // Auth & Public APIs
                                                .requestMatchers("/api/users/**").permitAll()

                                                // Secure all other endpoints
                                                .anyRequest().authenticated())

                                // 5. Disable default login behaviors for a pure API/Custom Auth
                                // approach
                                .formLogin(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable)

                                .build();
        }
}
