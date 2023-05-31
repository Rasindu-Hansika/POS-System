package lk.ijse.dep10.pos.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Data
@AllArgsConstructor@NoArgsConstructor
public class OrderDTO {

    private  CustomerDTO customer;
    private LocalDateTime dateTime;
    private List<ProductDTO> itemList = new ArrayList<>();
}
