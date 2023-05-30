// import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
import {DateTimeFormatter, LocalDateTime} from '../node_modules/@js-joda/core/dist/js-joda.esm.js';

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

let customer = null;
let socket = null;

/* Initialization Logic */
setDateTime();
tbodyElm.empty();
socket = new WebSocket(`${WS_API_BASE_URL}/customers-ws`);

/* Event Handlers & Timers */
setInterval(setDateTime, 1000);
txtCustomer.on('input', () => findCustomer());
txtCustomer.on('blur', ()=> {
    if (txtCustomer.val() && !customer){
        txtCustomer.addClass("is-invalid");
    }
});
$("#btn-clear-customer").on('click', ()=> {
    customer = null;
    $("#customer-name").text("Walk-in Customer");
    txtCustomer.val("");
    txtCustomer.removeClass("is-invalid");
    txtCustomer.trigger("focus");
});
socket.addEventListener('message', (eventData)=> {
    customer = JSON.parse(eventData.data);
    $("#customer-name").text(customer.name);
});

txtCode.on('change', () => findItem());

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

    if (socket.readyState === socket.OPEN) socket.send(idOrContact);
}

function  findItem(){
    txtCode.removeClass("is-invalid");
    description.text("");
    stock.text("");
    unitPrice.text("");
    itemInfo.addClass("d-none");
    frmOrder.addClass("d-none");
    let code = txtCode.val().trim();
    if (!code) return;
    const jqxhr = $.ajax(`${REST_API_BASE_URL}/products/${code}`);
    txtCode.attr("disabled");
    jqxhr.done((product)=>{
        description.text(product.description);
        unitPrice.text(new Intl.NumberFormat("en-LK",{style:'currency',currency:'LKR',minimumFractionDigits:2,maximumFractionDigits:2}).format(product.price));
        stock.text(product.quantity ? `In-Stock : ${product.quantity}` : 'Out of Stock');
        !product.quantity ? stock.addClass("out-of-stock") : stock.removeClass("out-of-stock");
        itemInfo.removeClass("d-none");
        if (product.quantity){
            frmOrder.removeClass("d-none");
            txtQuantity.trigger("select");
        }
    });
    jqxhr.fail(()=>{
        txtCode.addClass("is-invalid");
        txtCode.trigger("select");
    });
    jqxhr.always(() => txtCode.removeAttr("disabled"));
}