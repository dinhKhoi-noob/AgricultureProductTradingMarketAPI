const triggerQueries = [
    `DELIMITER $$

        CREATE TRIGGER afterHideProductType
        AFTER UPDATE
        ON product_type FOR EACH ROW
        BEGIN
            IF new.is_active='1' THEN
                update product set is_active = '1' where type_id like new.id and is_active='0';
                update business_product_type set is_active = '1' where product_type_id like new.id and is_active='0';
            END IF;
        END$$

    DELIMITER ;`,
    `DELIMITER $$
       	CREATE TRIGGER afterDeleteBuyingRequestImage
        AFTER DELETE
        ON buying_request_image FOR EACH ROW
        BEGIN
			DELETE FROM image WHERE id like old.image_id;
        END$$
    DELIMITER ;`,
    `DELIMITER $$
       	CREATE TRIGGER afterCreateNewBuyingRequest
        BEFORE INSERT
        ON buying_request FOR EACH ROW
        BEGIN
			SET new.address = (Select address from user where id like new.created_by);
        END$$
    DELIMITER `,
    `DELIMITER $$
       	CREATE TRIGGER after_insert_user
        AFTER INSERT
        ON user FOR EACH ROW
        BEGIN
        	if(new.address not like '' and new.address not like null and new.address not like (select address from address where address like new.address)) then
            	SELECT LEFT(UUID(), 10) INTO @current_id;
				Insert into address(id,address,user_id) values (@current_id,new.address,new.id);
            end if;
        END$$
    DELIMITER ;`,
    `DELIMITER $$
       	CREATE TRIGGER after_confirm_subrequest
        AFTER UPDATE
        ON request_for_another_request FOR EACH ROW
        BEGIN
        	DECLARE quantity_left INT;
            SELECT quantity INTO quantity_left FROM request where id like new.request_id;
            if(new.quantity <= quantity_left and new.status like 'success') then
                SELECT LEFT(UUID(), 10) INTO @current_id;
                insert into request_order(id,request_id,quantity,price,subrequest_id) value (@current_id,new.request_id,new.quantity,new.price,new.id);
                update request set quantity = quantity - new.quantity,process=process+new.quantity where request.id like new.request_id;
                update request set status='success' where request.id like new.request_id and request.quantity <= 0;
            end if;
        END$$
    DELIMITER ;`,
    `
    BEGIN
        	DECLARE quantity_left INT;
        	SELECT so_luong_hang INTO quantity_left FROM hang_hoa where mshh like new.mshh;
            IF new.so_luong >= quantity_left THEN
                update hang_hoa set so_luong_hang = quantity_left - new.so_luong where where mshh like new.mshh and trang_thai='0';
            END IF;
	    END
    ``ALTER DATABASE apm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`,
];
