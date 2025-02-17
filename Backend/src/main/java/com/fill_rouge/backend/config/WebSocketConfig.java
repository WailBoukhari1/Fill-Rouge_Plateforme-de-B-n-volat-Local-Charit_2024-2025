package com.fill_rouge.backend.config;

import com.fill_rouge.backend.constant.CommunicationConstants;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker(CommunicationConstants.TOPIC_PREFIX, CommunicationConstants.QUEUE_PREFIX);
        config.setApplicationDestinationPrefixes(CommunicationConstants.APP_PREFIX);
        config.setUserDestinationPrefix(CommunicationConstants.USER_PREFIX);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(CommunicationConstants.WEBSOCKET_ENDPOINT)
                .setAllowedOrigins("http://localhost:4200")
                .withSockJS();
    }
} 