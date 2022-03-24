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
    `ALTER DATABASE apm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`,
];
