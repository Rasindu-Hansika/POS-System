package lk.ijse.dep10.pos.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import lk.ijse.dep10.pos.dto.CustomerDTO;
import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;


public class CustomerWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private BasicDataSource bds;
    @Autowired
    private ObjectMapper objectMapper;

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        try (var connection = bds.getConnection()) {
            var pstm = connection.prepareStatement("select * from customer where id=? or contact=?");
            pstm.setString(1, message.getPayload().strip());
            pstm.setString(2, message.getPayload().strip());
            var resultSet = pstm.executeQuery();
            if (resultSet.next()) {
                int id = resultSet.getInt("id");
                String name = resultSet.getString("name");
                String contact = resultSet.getString("contact");
                String address = resultSet.getString("address");
                var customerDTO = new CustomerDTO(id, name, contact, address);
                var customerJSON = objectMapper.writeValueAsString(customerDTO);
                session.sendMessage(new TextMessage(customerJSON));

            }
        }

    }
}









