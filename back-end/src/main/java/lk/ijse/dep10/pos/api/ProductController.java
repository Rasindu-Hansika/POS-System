package lk.ijse.dep10.pos.api;


import lk.ijse.dep10.pos.dto.CustomerDTO;
import lk.ijse.dep10.pos.dto.ProductDTO;
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
@RequestMapping("/products")
@CrossOrigin
public class ProductController {
    @Autowired
    public BasicDataSource bds;
    @PostMapping
    public ResponseEntity<?> saveProduct (@RequestBody ProductDTO product){
        try (var connection = bds.getConnection()) {
            var pstm = connection.prepareStatement("insert into products(description, quantity, price) values (?,?,?)", Statement.RETURN_GENERATED_KEYS);
            pstm.setString(1, product.getDescription());
            pstm.setInt(2, product.getQuantity());
            pstm.setBigDecimal(3, product.getPrice());
            pstm.executeUpdate();
            var generatedKeys = pstm.getGeneratedKeys();
            generatedKeys.next();
            int code= generatedKeys.getInt(1);
            product.setCode(String.valueOf(code));
            return new ResponseEntity<>(product, HttpStatus.CREATED);
        } catch (SQLException e) {
            if (e.getSQLState().equals("23000")) {
                return new ResponseEntity<>(new ResponseErrorDTO(HttpStatus.CONFLICT.value(), e.getMessage()), HttpStatus.CONFLICT);
            } else {
                return new ResponseEntity<>(new ResponseErrorDTO(500, e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    @GetMapping
    public ResponseEntity<?> getProducts(@RequestParam(value = "q",required = false) String query){
        if(query==null) query="";
        try (var connection = bds.getConnection()) {
            var pstm = connection.prepareStatement("select  * from  products where  code like  ? or description like  ? or quantity like ? or price like ?");
            query = "%" + query + "%";
            for (int i = 1; i <=4; i++) {
                pstm.setString(i,query);
            }
            var rst = pstm.executeQuery();
            List<ProductDTO> productDTOs = new ArrayList<>();
            while (rst.next()){
                var code = rst.getString("code");
                var description = rst.getString("description");
                var quantity = rst.getInt("quantity");
                var price = rst.getBigDecimal("price");
                productDTOs.add(new ProductDTO(code, description, quantity, price));
            }
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("X-count",productDTOs.size()+"");
            return new ResponseEntity<>(productDTOs,httpHeaders, HttpStatus.OK);

        } catch (SQLException e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ResponseErrorDTO(500,e.getMessage()),HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteCustomer(@PathVariable("code") String productCode) {
        try (var connection = bds.getConnection()) {
            var stm = connection.prepareStatement("delete  from products where code=?");
            stm.setString(1, productCode);
            var affectedRows = stm.executeUpdate();
            if(affectedRows==1){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }else {
                return new ResponseEntity<>(new ResponseErrorDTO(404, "Invalid productCode"), HttpStatus.NOT_FOUND);
            }
        } catch (SQLException e) {
            if (e.getSQLState().equals("23000")) {
                return new ResponseEntity<>(new ResponseErrorDTO(HttpStatus.CONFLICT.value(), e.getMessage()), HttpStatus.CONFLICT);
            } else {
                return new ResponseEntity<>(new ResponseErrorDTO(500, e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    @PatchMapping("/{code}")
    public  ResponseEntity<?> updateCustomer(@PathVariable("code") int productCode,@RequestBody ProductDTO product){
        try (var connection = bds.getConnection()) {
            var stm = connection.prepareStatement("update   products set description=?,quantity=?,price=? where code=?");
            stm.setString(1, product.getDescription());
            stm.setInt(2, product.getQuantity());
            stm.setBigDecimal(3, product.getPrice());
            stm.setInt(4, productCode);
            var affectedRows = stm.executeUpdate();
            if(affectedRows==1){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }else {
                return new ResponseEntity<>(new ResponseErrorDTO(404, "Product Code Not Found"), HttpStatus.NOT_FOUND);
            }
        } catch (SQLException e) {
            if (e.getSQLState().equals("23000")) {
                return new ResponseEntity<>(new ResponseErrorDTO(HttpStatus.CONFLICT.value(), e.getMessage()), HttpStatus.CONFLICT);
            } else {
                return new ResponseEntity<>(new ResponseErrorDTO(500, e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }


    @GetMapping("/{code}")
    public  ResponseEntity<?>  getItem(@PathVariable String code){
        try (var connection = bds.getConnection()) {
            var preparedStatement = connection.prepareStatement("select * from products where code=?");
            preparedStatement.setString(1,code);
            var resultSet = preparedStatement.executeQuery();
            if (resultSet.next()){
                var cd = resultSet.getString("code");
                var description = resultSet.getString("description");
                var quantity = resultSet.getInt("quantity");
                var price = resultSet.getBigDecimal("price");
                ProductDTO productDTO= new ProductDTO(cd, description, quantity, price);
                return new ResponseEntity<>(productDTO, HttpStatus.OK);
            }else {
                ResponseErrorDTO errorDTO = new ResponseErrorDTO(404, "Item not Found");
                return new ResponseEntity<>(errorDTO, HttpStatus.NOT_FOUND);
            }

        } catch (SQLException e) {
            e.printStackTrace();
            ResponseErrorDTO errorDTO = new ResponseErrorDTO(500, "Failed to fetch the data");
            return new ResponseEntity<>(errorDTO, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }
}
