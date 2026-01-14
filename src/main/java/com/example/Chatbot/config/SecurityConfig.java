package com.example.Chatbot.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Autowired
        private JwtAuthFilter jwtAuthFilter;

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
                                                .requestMatchers("/", "/login", "/signup",
                                                                "/chat/**", "/css/**", "/js/**",
                                                                "/**/*.png", "/**/*.jpg",
                                                                "/**/*.jpeg", "/**/*.gif",
                                                                "/**/*.svg", "/**/*.ico",
                                                                "/images/**", "/webjars/**")
                                                .permitAll()

                                                // Public Pages
                                                .requestMatchers("/home", "/about", "/contact","/profile")
                                                .permitAll()

                                                // Auth & Public API
                                                .requestMatchers("/api/users/**").permitAll()
                                                .requestMatchers("/chat/**").authenticated()
                                                .requestMatchers("/api/conversations/**").permitAll()

                                                // Secure all other endpoints
                                                .anyRequest().authenticated())
                                .addFilterBefore(jwtAuthFilter,
                                                UsernamePasswordAuthenticationFilter.class)

                                // 5. Disable default login behaviors for a pure API/Custom Auth
                                // approach
                                .formLogin(AbstractHttpConfigurer::disable)
                                .httpBasic(AbstractHttpConfigurer::disable)

                                .build();
        }
}
