import {LocalDateTime,DateTimeFormatter} from "../node_modules/@js-joda/core/dist/js-joda.esm.js";

const orderDateTime = $('#order-date-time');
const tblBody = $('#tbl-order tbody');

setDateTime();
tblBody.empty();



function  setDateTime(){
    const now=LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
    orderDateTime.text(now);
}

setInterval(setDateTime,1000);

