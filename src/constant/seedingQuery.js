const queryStringList = {
    role: `
        insert into role values('1234567890','consummer');
        insert into role values('1234567891','provider');
        insert into role values('1234567892','manager');
        insert into role values('1234567893','packing_staff');
        insert into role values('1234567894','shipper');
        insert into role values('1234567895','system_manager');
    `,
};

module.exports = {
    queryStringList,
};
