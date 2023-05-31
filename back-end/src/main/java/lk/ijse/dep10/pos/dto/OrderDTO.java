package lk.ijse.dep10.pos.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime dateTime;
    private List<ProductDTO> itemList = new ArrayList<>();
}
