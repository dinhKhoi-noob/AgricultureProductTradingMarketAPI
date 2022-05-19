const viewQueries = [
    `create view productView (id,type_id,created_by,title,date_created,date_modified,is_active,category_title) as Select DISTINCT p.id,p.type_id,p.created_by,p.title,p.date_created,p.date_modified,p.is_active,pt.title from product p INNER join product_type pt where p.is_active='0' and p.type_id like pt.id;`,
    `create view business_product_type_view (id,category_id,category_title,user_id) as Select DISTINCT b.id,pt.id,pt.title,b.user_id from business_product_type b INNER join product_type pt where b.is_active='0' and b.product_type_id like pt.id;`,
    `create view user_view (id,role,username,phone,email,address,avatar,is_active,is_logged_in) as Select DISTINCT u.id,r.role,u.username,u.phone,u.email,u.address,u.avatar,u.is_active,u.is_logged_in from user u INNER join role r where u.is_active='0' and u.role_id like r.id;`,
    `create view buying_request_view (id,created_by,date_created,status,product_id,quantity,price,process,is_confirm,expired_date,measure,description,product_name,username,avatar) as Select DISTINCT b.id,b.created_by,b.date_created,b.status,b.product_id,b.quantity,b.price,b.process,b.is_confirm,b.expired_date,b.measure,b.description,p.title,u.username,u.avatar from buying_request b INNER join product p INNER join user u where b.product_id like p.id and b.created_by like u.id;`,
    `create view selling_request_for_buying_view (id,created_by,date_created,date_complete_order,status,request_id,quantity,price,description,username,avata) as Select DISTINCT s.id,s.created_by,s.created_date,s.date_complete_order,s.status,s.buying_request_id,s.quantity,s.price,s.description,u.username,u.avatar from selling_request_for_buying_request s INNER join user u where s.created_by like u.id and s.created_by like u.id;`,
    `create view buying_request_image_view (request_id,url,image_id,image_ref_id) as Select DISTINCT b.request_id,i.url,i.id,b.id from image i INNER join buying_request_image b where i.id like b.image_id;``create view selling_request_for_buying_image_view (request_id,url,image_id,image_ref_id) as Select DISTINCT s.request_id,i.url,i.id,s.id from image i INNER join selling_request_for_buying_request_image s where i.id like s.image_id;`,
];
