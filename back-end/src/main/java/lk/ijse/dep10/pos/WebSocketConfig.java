package lk.ijse.dep10.pos;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.ijse.dep10.pos.api.CustomerWebSocketHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@EnableWebSocket
@Configuration
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(customerWebSocketHandler(), "/customers-ws").setAllowedOrigins("*");
    }
    @Bean
    public CustomerWebSocketHandler customerWebSocketHandler(){
        return  new CustomerWebSocketHandler();
    }

    @Bean
    public ObjectMapper objectMapper(){
        return  new ObjectMapper();
    }
}
