import big from "../node_modules/big.js/big.mjs";

export class Order {
    customer = null;
    itemList = [];
    subscriber;

    constructor(subscriber) {
        this.subscriber = subscriber;
        if (localStorage.getItem("order")){
            const order = JSON.parse(localStorage.getItem("order"));
            this.customer = order.customer;
            this.itemList = order.itemList;
        }
        this.#updateOrder();
    }

    setCustomer(customer) {
        this.customer = customer;
        this.#updateOrder();
    }

    addItem(item) {
        this.itemList.push(item);
        this.#updateOrder();
        this.subscriber(this.getTotal());

    }

    deleteItem(code) {
        const index = this.itemList.indexOf(this.getItem(code));
        this.itemList.splice(index, 1);
        this.#updateOrder();
        this.subscriber(this.getTotal());

    }

    getItem(code) {
        return this.itemList.find(item => item.code === code);
    }

    getTotal() {
        let total = new big(0);
        this.itemList.forEach(item => {
            total = total.plus(new big(item.quantity).times(new big(item.price)));
        });
        return total
    }

    #updateOrder() {
        localStorage.setItem("order", JSON.stringify(this));
        this.subscriber(this.getTotal());
    }

    containItem(code){
        return !!this.getItem(code);
    }

    updateQty(code,qty){
        if (!this.containItem(code)) return;
        this.getItem(code).quantity = qty;
        this.#updateOrder();
}
    clear(){
        this.customer=null;
        this.itemList = [];
        this.#updateOrder();
        this.subscriber(this.getTotal());
    }

}
