package lk.ijse.dep10.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class productDTO {
    private int code;
    private String description;
    private int quantity;
    private String price;
}
