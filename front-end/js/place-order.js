// import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
import {DateTimeFormatter, LocalDateTime} from '../node_modules/@js-joda/core/dist/js-joda.esm.js';
import Big from "../node_modules/big.js/big.mjs";
import {Order} from "./order.js";
import {progressBar} from "./main.js"
import {showToast} from "./main.js"

/* Module Level Variables, Constants */
const REST_API_BASE_URL = 'http://localhost:8080/pos';
const WS_API_BASE_URL = 'ws://localhost:8080/pos';
const orderDateTimeElm = $("#order-date-time");
const tbodyElm = $("#tbl-order tbody");
const txtCustomer = $("#txt-customer");
const txtCode = $("#txt-code");
const description = $("#description");
const unitPrice = $("#unitPrice");
const stock = $("#stock span");
const itemInfo = $("#item-info");
const frmOrder = $("#frm-order");
const txtQuantity = $("#txt-qty");
const netTotal = $("#net-total");
const btnPlaceOrder = $("#btn-place-order");
const tfoot = $("tfoot");

let customer = null;
let item = null;
let socket = null;
let order = new Order((total)=>netTotal.text(formatPrice(total)));

/* Initialization Logic */
setDateTime();
tbodyElm.empty();
socket = new WebSocket(`${WS_API_BASE_URL}/customers-ws`);
updateOrderDetails();


/* Event Handlers & Timers */
setInterval(setDateTime, 1000);

txtCustomer.on('input', () => findCustomer());

txtCustomer.on('blur', () => {
    if (txtCustomer.val() && !customer) {
        txtCustomer.addClass("is-invalid");
    }
});

$("#btn-clear-customer").on('click', () => {
    customer = null;
    order.setCustomer(customer);
    $("#customer-name").text("Walk-in Customer");
    txtCustomer.val("");
    txtCustomer.removeClass("is-invalid");
    txtCustomer.trigger("focus");
});

socket.addEventListener('message', (eventData) => {
    customer = JSON.parse(eventData.data);
    order.setCustomer(customer);
    $("#customer-name").text(customer.name);
});

txtCode.on('change', () => findItem());

frmOrder.on("submit", (e) => {
    e.preventDefault();
    if(+txtQuantity.val()<=0 || +txtQuantity.val()>item.quantity){
        txtQuantity.addClass("is-invalid");
        txtQuantity.trigger("select");
        return;
    }
    item.quantity = +txtQuantity.val();
    if (order.containItem(item.code)){
        order.updateQty(item.code, order.getItem(item.code).quantity + item.quantity);
        const codeElm = Array.from(tbodyElm.find("tr td:first-child .code")).find(codeElm => $(codeElm).text() === item.code);
        const qtyElm = $(codeElm).parents("tr").find("td:nth-child(2)");
        const priceElm = $(codeElm).parents("tr").find("td:nth-child(4)");
        qtyElm.text(order.getItem(item.code).quantity);
        priceElm.text(formatPrice(Big(order.getItem(item.code).quantity).times(item.price)));
    }else{
        addItemToCart(item);
        order.addItem(item);
    }
    $("#item-info").addClass("d-none");
    frmOrder.addClass("d-none");
    txtCode.val("");
    txtCode.trigger("focus");
    txtQuantity.val("1");
})

tbodyElm.on('click','svg.delete',(e)=>{
    const itemCode = $(e.target).parents('tr').find('td:first-child .code').text();
    order.deleteItem(itemCode);
    $(e.target).parents('tr').remove();
    if (!order.itemList.length) tfoot.show();
})

btnPlaceOrder.on("click", () => placeOrder());



/* Functions */
function setDateTime() {
    const now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    orderDateTimeElm.text(now);
}

function findCustomer() {
    const customerNameElm = $("#customer-name");
    const idOrContact = txtCustomer.val().trim().replace('C', '');

    txtCustomer.removeClass("is-invalid");
    if (!idOrContact) return;
    customer = null;
    customerNameElm.text("Walk-in Customer");

    order.setCustomer(null);

    if (socket.readyState === socket.OPEN) socket.send(idOrContact);
}

function findItem() {
    txtCode.removeClass("is-invalid");
    description.text("");
    stock.text("");
    unitPrice.text("");
    itemInfo.addClass("d-none");
    frmOrder.addClass("d-none");

    item = null;

    let code = txtCode.val().trim();
    if (!code) return;
    const jqxhr = $.ajax(`${REST_API_BASE_URL}/products/${code}`);
    txtCode.attr("disabled");
    jqxhr.done((product) => {
        item = product;
        description.text(product.description);
        if (order.containItem(item.code)) item.quantity -= order.getItem(code).quantity;
        unitPrice.text(new Intl.NumberFormat("en-LK", {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(product.price));
        stock.text(product.quantity ? `In-Stock : ${product.quantity}` : 'Out of Stock');
        !product.quantity ? stock.addClass("out-of-stock") : stock.removeClass("out-of-stock");
        itemInfo.removeClass("d-none");
        if (product.quantity) {
            frmOrder.removeClass("d-none");
            txtQuantity.trigger("select");
        }
    });
    jqxhr.fail(() => {
        txtCode.addClass("is-invalid");
        txtCode.trigger("select");
    });
    jqxhr.always(() => {
        txtCode.removeAttr("disabled");
        if (!item?.quantity) {
            txtCode.trigger("select");
        }
    });
}

function addItemToCart(item) {
    tfoot.hide();
    const trElm = $(`<tr>
                    <td>
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <div class="fw-bold code">${item.code}</div>
                                <div>${item.description}</div>
                            </div>
                            <svg data-bs-toggle="tooltip" data-bs-title="Remove Item" xmlns="http://www.w3.org/2000/svg"
                                 width="32" height="32" fill="currentColor" class="bi bi-trash delete"
                                 viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                            </svg>
                        </div>
                    </td>
                    <td>
                        ${item.quantity}
                    </td>
                    <td>
                        ${formatPrice(item.price)}
                    </td>
                    <td>
                        ${formatPrice(new Big(item.quantity).times(new Big(item.price)))}
                    </td>
                </tr>`)

    tbodyElm.append(trElm);
}

function formatPrice(number) {
    return new Intl.NumberFormat("en-LK", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

function updateOrderDetails() {
    const id = order.customer?.id.toString().padStart(3, "0");
    txtCustomer.val(id ? "C" + id : "");
    $('#customer-name').text(order.customer?.name);
    order.itemList.forEach(item => addItemToCart(item));
    netTotal.text(formatPrice(order.getTotal()));

}

function placeOrder(){
    if(!order.itemList.length) return;
    order.dateTime = orderDateTimeElm.text();
    btnPlaceOrder.attr("disabled", true);
    const xhr = new XMLHttpRequest();

    const jqxhr = $.ajax(`${REST_API_BASE_URL}/orders`, {
        method:"POST",
        contentType:"application/json",
        data: JSON.stringify(order),
        xhr: () =>xhr

    })

    progressBar(xhr);
    jqxhr.done((orderId)=>{
    //     Todo : Print the order
        order.clear();
        $("#btn-clear-customer").trigger("click");
        txtCode.val("");
        txtCode.trigger("input");
        tbodyElm.empty();
        tfoot.show();
        showToast("success", "Success", "Order has been placed successfully");


    })
    jqxhr.fail(()=>{
        showToast("error", "Failed", "Failed to Place the order,Try again");
    })
    jqxhr.always(()=>{
        btnPlaceOrder.removeAttr("disabled");
    })

}


