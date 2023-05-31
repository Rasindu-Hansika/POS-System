package lk.ijse.dep10.pos.api;


import lk.ijse.dep10.pos.dto.OrderDTO;
import lk.ijse.dep10.pos.dto.ProductDTO;
import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.sql.Connection;
import java.sql.Statement;
import java.sql.Timestamp;

@CrossOrigin
@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private BasicDataSource bds;

    @ResponseStatus(HttpStatus.CREATED)
    @PostMapping
    public int saveOrder(@RequestBody OrderDTO order) throws Exception {
        Connection connection = null;
        try {
            connection = bds.getConnection();
            connection.setAutoCommit(false);

            var stmOrder = connection.prepareStatement("insert into `order` (datetime) value(?)", Statement.RETURN_GENERATED_KEYS);
            stmOrder.setTimestamp(1, Timestamp.valueOf(order.getDateTime()));
            stmOrder.executeUpdate();
            var generatedKeys = stmOrder.getGeneratedKeys();
            generatedKeys.next();
            var orderId = generatedKeys.getInt(1);

            if (order.getCustomer() != null) {
                var stmOrderCustomer = connection.prepareStatement("insert into order_customer (order_id, customer_id) values (?,?)");
                stmOrderCustomer.setInt(1, orderId);
                stmOrderCustomer.setInt(2, order.getCustomer().getId());
                stmOrderCustomer.executeUpdate();
            }

            for (ProductDTO orderItem : order.getItemList()) {
                var stmOrderDetail = connection.prepareStatement("insert into  order_details(order_id, item_code, price, qty) values (?,?,?,?)");
                var stmStockUpdate = connection.prepareStatement("update products set quantity=quantity-? where code=?");
                stmOrderDetail.setInt(1, orderId);
                stmOrderDetail.setInt(2, Integer.parseInt(orderItem.getCode()));
                stmOrderDetail.setBigDecimal(3, orderItem.getPrice());
                stmOrderDetail.setInt(4, orderItem.getQuantity());
                stmOrderDetail.executeUpdate();

                stmStockUpdate.setInt(1, orderItem.getQuantity());
                stmStockUpdate.setInt(2, Integer.parseInt(orderItem.getCode()));
                stmStockUpdate.executeUpdate();

            }

            connection.commit();
            return orderId;
        } catch (Throwable t) {
            connection.rollback();
            t.printStackTrace();
            throw new RuntimeException();
        } finally {
            connection.setAutoCommit(true);
        }


    }
}
