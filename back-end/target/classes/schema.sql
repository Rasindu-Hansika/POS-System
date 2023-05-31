create table if not exists customer
(
    id      int auto_increment primary key,
    name    varchar(100) not null,
    address varchar(250) not null,
    contact varchar(20)  not null
);

alter  table  customer add  constraint uk_contact unique (contact);


create table if not exists products
(
    code      varchar(50) primary key,
    description    varchar(100) not null unique ,
    quantity int not null,
    price int not null
);

create table if not exists `order`
(
    id          int auto_increment primary key,
    `datetime`  datetime not null

);

create table if not exists `order_details`
(
    order_id  int            not null,
    item_code varchar(50),
    price     decimal(10, 2) not null,
    qty       int            not null,
    constraint fk_order_detail primary key (order_id, item_code),
    constraint fk_order_detail_order foreign key (order_id) references `order` (id),
    constraint fk_order_detail_item foreign key (item_code) references products(code)
);

create table if not exists order_customer
(
    order_id    int primary key ,
    customer_id int not null,
    constraint fk_order_customer_order foreign key (order_id) references `order` (id),
    constraint fk_order_customer_customer foreign key (customer_id) references customer(id)

);



