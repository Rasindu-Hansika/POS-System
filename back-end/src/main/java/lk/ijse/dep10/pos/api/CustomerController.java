package lk.ijse.dep10.pos.api;

import lk.ijse.dep10.pos.dto.CustomerDTO;
import lk.ijse.dep10.pos.dto.ResponseErrorDTO;
import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/customers")
@CrossOrigin
public class CustomerController {

    @Autowired
    public BasicDataSource bds;


    @PostMapping
    public ResponseEntity<?> saveCustomer(@RequestBody CustomerDTO customer) {
        try (var connection = bds.getConnection()) {
            var stm = connection.prepareStatement("insert into customer(name, address, contact) values (?,?,?)", Statement.RETURN_GENERATED_KEYS);
            stm.setString(1, customer.getName());
            stm.setString(2, customer.getAddress());
            stm.setString(3, customer.getContact());
            stm.executeUpdate();
            var generatedKeys = stm.getGeneratedKeys();
            generatedKeys.next();
            int id = generatedKeys.getInt(1);
            customer.setId(id);
            return new ResponseEntity<>(customer, HttpStatus.CREATED);
        } catch (SQLException e) {

            if (e.getSQLState().equals("23000")) {
                return new ResponseEntity<>(new ResponseErrorDTO(HttpStatus.CONFLICT.value(), e.getMessage()), HttpStatus.CONFLICT);
            } else {
                return new ResponseEntity<>(new ResponseErrorDTO(500, e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @GetMapping
    public ResponseEntity<?> getCustomers(@RequestParam(value = "q",required = false) String query){
        if(query==null) query="";
        try (var connection = bds.getConnection()) {
            var stm = connection.prepareStatement("select * from  customer where id like ? or name like  ? or address like ? or contact like ?");
            query="%"+query+"%";
            for (int i = 1; i <=4; i++) {
                stm.setString(i,query);
            }
            var rst = stm.executeQuery();
            List<CustomerDTO> customerDTOList = new ArrayList<>();
            while (rst.next()){
                var id = rst.getInt("id");
                var name = rst.getString("name");
                var address = rst.getString("address");
                var contact = rst.getString("contact");
                customerDTOList.add(new CustomerDTO(id, name, address, contact));
            }
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("X-count",customerDTOList.size()+"");
            return new ResponseEntity<>(customerDTOList,httpHeaders, HttpStatus.OK);

        } catch (SQLException e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ResponseErrorDTO(500,e.getMessage()),HttpStatus.INTERNAL_SERVER_ERROR);
        }


    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable("id") String customerId) {
        try (var connection = bds.getConnection()) {
            var stm = connection.prepareStatement("delete  from customer where id=?");
            stm.setString(1, customerId);
            var affectedRows = stm.executeUpdate();
            if(affectedRows==1){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }else {
                return new ResponseEntity<>(new ResponseErrorDTO(404, "Invalid CustomerID"), HttpStatus.NOT_FOUND);
            }
        } catch (SQLException e) {
            if (e.getSQLState().equals("23000")) {
                return new ResponseEntity<>(new ResponseErrorDTO(HttpStatus.CONFLICT.value(), e.getMessage()), HttpStatus.CONFLICT);
            } else {
                return new ResponseEntity<>(new ResponseErrorDTO(500, e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}
