const tableNameList = [
    "role",
    "user",
    "rating",
    "privilege",
    "user_role",
    "product_type",
    "product",
    "buying_request",
    "buying_request_product",
    "selling_request_for_buying_request",
    "business_product_type",
    "selling_request",
    "report",
    "selling_request_report",
    "selling_request_for_buying_request_report",
    "image",
    "selling_request_image",
    "report_image",
    "selling_request_for_buying_request_image",
    "video",
    "report_video",
    "selling_request_video",
    "selling_request_for_buying_request_video",
    "notification",
    "report_notification",
    "selling_request_for_buying_request_notification",
    "selling_request_notification",
    "chat_room",
    "message",
    "message_file",
];

const queryStringList = {
    user: `CREATE TABLE user ( 
    id VARCHAR(21) NOT NULL,
    username varchar(50) NOT NULL,
    password varchar(100) DEFAULT NULL,
    is_logged_in tinyint(1) NOT NULL DEFAULT 1,
    address varchar(200) DEFAULT NULL,
    login_method enum('facebook','google','default') NOT NULL DEFAULT 'default',
    role_id varchar(10) NOT NULL,
    phone varchar(11) DEFAULT NULL,
    email varchar(200) NOT NULL,
    avatar varchar(200) NOT NULL DEFAULT '''avatar''',
    is_active TINYINT NOT NULL DEFAULT '0',
    PRIMARY key(id),
    FOREIGN key(role_id) REFERENCES role(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    role: `CREATE TABLE role (
    id VARCHAR(10) NOT NULL ,
    role ENUM('consummer','provider','manager','shipper','system_manager','packing_staff') NOT NULL DEFAULT 'consummer' ,
    PRIMARY KEY (id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    rating: `CREATE TABLE rating (
    id VARCHAR(10) NOT NULL ,
    owner_id VARCHAR(21) NOT NULL ,
    rate_by VARCHAR(21) NOT NULL ,
    rating_point ENUM('1','2','3','4','5') NOT NULL ,
    comment VARCHAR(1000) NOT NULL ,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    PRIMARY KEY (id),
    FOREIGN KEY(owner_id) REFERENCES user(id),
    FOREIGN KEY(rate_by) REFERENCES user(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    privilege: `CREATE TABLE privilege (
    id varchar(10) PRIMARY key,
    name varchar(100) not null
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    user_role: `CREATE TABLE user_role (
    id VARCHAR(10) NOT NULL ,
    role_id VARCHAR(10) NOT NULL ,
    privilege_id VARCHAR(10) NOT NULL ,
    date_granted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    PRIMARY KEY (id),
    FOREIGN KEY(privilege_id) REFERENCES privilege(id),
    FOREIGN KEY(role_id) REFERENCES role(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    product_type: `CREATE TABLE product_type (
    id VARCHAR(10) NOT NULL ,
    type ENUM('processed','crude') NOT NULL DEFAULT 'crude' ,
    created_by VARCHAR(21) NOT NULL ,
    title VARCHAR(50) NOT NULL ,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    date_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    is_active TINYINT NOT NULL DEFAULT '0',
    PRIMARY KEY (id),
    FOREIGN KEY(created_by) REFERENCES user(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    product: `CREATE TABLE product (
    id VARCHAR(10) NOT NULL ,
    type_id VARCHAR(10) NOT NULL ,
    created_by VARCHAR(10) NOT NULL ,
    title VARCHAR(50) NOT NULL ,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    date_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    is_active TINYINT NOT NULL DEFAULT '0',
    PRIMARY KEY (id),
    FOREIGN KEY(created_by) REFERENCES user(id),
    FOREIGN KEY(type_id) REFERENCES product_type(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    buying_request: `CREATE TABLE buying_request (
    id VARCHAR(10) NOT NULL ,
    created_by VARCHAR(21) NOT NULL ,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    status ENUM('success','process','pending','cancel') NOT NULL DEFAULT 'process' ,
    product_id VARCHAR(10) NOT NULL ,
    quantity INT NOT NULL ,
    price INT NOT NULL ,
    process INT NOT NULL DEFAULT '0' ,
    is_confirm tiny int not null default
    PRIMARY KEY (id),
    FOREIGN KEY(created_by) REFERENCES user(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    buying_request_product: `CREATE TABLE buying_request_product (
    id VARCHAR(10) NOT NULL ,
    buying_request_id VARCHAR(10) NOT NULL ,
    product_id VARCHAR(10) NOT NULL ,
    quantity INT NOT NULL ,
    price INT NOT NULL ,
    process INT NOT NULL DEFAULT '0' ,
    PRIMARY KEY (id),
    FOREIGN KEY(buying_request_id) REFERENCES buying_request(id),
    FOREIGN KEY(product_id) REFERENCES product(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_for_buying_request: `CREATE TABLE selling_request_for_buying_request (
    id VARCHAR(10) NOT NULL ,
    created_by VARCHAR(21) NOT NULL ,
    buying_request_product_id VARCHAR(10) NOT NULL ,
    quantity INT NOT NULL ,
    price INT NOT NULL ,
    status ENUM('waiting','success','refused') NOT NULL DEFAULT 'waiting' ,
    PRIMARY KEY (id),
    FOREIGN KEY(created_by) REFERENCES user(id),
    FOREIGN KEY(buying_request_product_id) REFERENCES buying_request_product(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    business_product_type: `CREATE TABLE  business_product_type (
    id VARCHAR(10) NOT NULL ,
    user_id VARCHAR(21) NOT NULL ,
    product_type_id VARCHAR(10) NOT NULL ,
    is_active TINYINT NOT NULL DEFAULT '0',
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES user(id),
    FOREIGN KEY(product_type_id) REFERENCES product_type(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request: `CREATE TABLE selling_request (
    id VARCHAR(10) NOT NULL ,
    created_by VARCHAR(21) NOT NULL ,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    status ENUM('process','success','pending','cancel') NOT NULL DEFAULT 'process' ,
    PRIMARY KEY (id),
    FOREIGN KEY(created_by) REFERENCES user(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    report: `CREATE TABLE report ( 
    id VARCHAR(10) NOT NULL ,
    created_by VARCHAR(21) NOT NULL ,
    content VARCHAR(1000) NOT NULL ,
    status ENUM('resolved','rejected','process') NOT NULL DEFAULT 'process' ,
    date_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id),
    FOREIGN KEY(created_by) REFERENCES user(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_report: `create table selling_request_report(
    id varchar(10),
    request_id varchar(10),
    report_id varchar(10),
    PRIMARY KEY(id),
    FOREIGN KEY(request_id) REFERENCES selling_request_product(id),
    FOREIGN KEY(report_id) REFERENCES report(id) 
  );  ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_for_buying_request_report: `CREATE TABLE selling_request_for_buying_request_report (
    id VARCHAR(10) NOT NULL ,
    request_id VARCHAR(10) NOT NULL ,
    report_id VARCHAR(10) NOT NULL ,
    PRIMARY KEY (id),
    FOREIGN KEY(request_id) REFERENCES selling_request_for_buying_request(id),
    FOREIGN KEY(report_id) REFERENCES report(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    image: `CREATE TABLE image (
    id VARCHAR(10) NOT NULL ,
    url VARCHAR(200) NOT NULL ,
    PRIMARY KEY (id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_image: `create table selling_request_image( 
    id varchar(10) primary key, 
    video_id varchar(10), 
    request_id varchar(10), 
    foreign key(video_id) references image(id), 
    foreign key(request_id) references selling_request(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    report_image: `create table report_image( 
    id varchar(10) primary key, 
    image_id varchar(10), 
    report_id varchar(10), 
    foreign key(image_id) references image(id), 
    foreign key(report_id) references report(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_for_buying_request_image: `create table selling_request_for_buying_request_image( 
    id varchar(10) primary key, 
    image_id varchar(10), 
    request_id varchar(10), 
    foreign key(image_id) references image(id), 
    foreign key(request_id) references selling_request_for_buying_request(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    video: `create table video( 
    id varchar(10) primary key, 
    href varchar(100) not null 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    report_video: `create table report_video(
    id varchar(10) primary key,
    video_id varchar(10),
    report_id varchar(10),
    foreign key(video_id) references video(id),
    foreign key(report_id) references report(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_video: `CREATE TABLE selling_request_video( 
    id varchar(10) primary key, 
    image_id varchar(10), 
    request_id varchar(10), 
    foreign key(image_id) references image(id), 
    foreign key(request_id) references selling_request(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_for_buying_request_video: `create table selling_request_for_buying_request_video( 
    id varchar(10) primary key, 
    video_id varchar(10), 
    request_id varchar(10), 
    foreign key(video_id) references image(id), 
    foreign key(request_id) references selling_request_for_buying_request(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    notification: `CREATE TABLE notification(
    id varchar(10) primary key, 
    create_by varchar(10), 
    content varchar(500) not null, 
    is_read tinyint default 1, 
    date_created datetime default current_timestamp, 
    foreign key(create_by) references user(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    report_notification: `CREATE TABLE report_notification(
    id varchar(10) primary key,
    report_id varchar(10),
    notification_id varchar(10),
    FOREIGN KEY(report_id) REFERENCES report(id),
    FOREIGN KEY(notification_id) REFERENCES notification(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_for_buying_request_notification: `create table selling_request_for_buying_request_notification( 
    id varchar(10) primary key, 
    request_id varchar(10), 
    notification_id varchar(10), 
    FOREIGN KEY(request_id) REFERENCES selling_request_for_buying_request(id), 
    FOREIGN KEY(notification_id) REFERENCES notification(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    selling_request_notification: `create table selling_request_notification( 
    id varchar(10) primary key, 
    request_id varchar(10), 
    notification_id varchar(10), 
    FOREIGN KEY(request_id) REFERENCES selling_request(id), 
    FOREIGN KEY(notification_id) REFERENCES notification(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    chat_room: `CREATE TABLE chat_room(
    id varchar(10) primary key, 
    first_user varchar(10), 
    second_user varchar(10), 
    FOREIGN KEY(first_user) REFERENCES user(id), 
    FOREIGN KEY(second_user) REFERENCES user(id)
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    message: `CREATE TABLE message( 
    id varchar(10) primary key, 
    room_id varchar(10), 
    sent_by varchar(10), 
    content varchar(1000) not null, 
    date_created datetime default current_timestamp, 
    FOREIGN KEY(room_id) REFERENCES chat_room(id), 
    FOREIGN KEY(sent_by) REFERENCES user(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
    message_file: `CREATE TABLE message_file( 
    id varchar(10) primary key, 
    message_id varchar(10), 
    content_type varchar(10), 
    url varchar(100) not null, 
    FOREIGN KEY(message_id) REFERENCES message(id) 
  ) ENGINE = InnoDB DEFAULT CHARSET=utf8mb3`,
};

module.exports = { queryStringList, tableNameList };
