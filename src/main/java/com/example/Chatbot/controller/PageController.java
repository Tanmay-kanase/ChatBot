package com.example.Chatbot.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

// All the html files are load from the src/resources/templates you just have to mention the controller 
// @GetMapping("/<route_name>") public String <PageName>() { return <html file name (not include extension)>}
@Controller
public class PageController {

    @GetMapping("/dashboard")
    public String landingPage() {
        return "landing";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/signup")
    public String signupPage() {
        return "signup";
    }

    @GetMapping("/")
    public String homePage() {
        return "home";
    }
}
