const mysql = require('mysql2/promise');

async function dropTables() {
  const conn = await mysql.createConnection({
    host: 'ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com',
    port: 4000,
    user: 'dwA55so54fuAUdZ.root',
    password: 'DRK0nRdUdPuyNO3B9JEkqoG5y5HpRbW2',
    database: '19eb9d24-ca82-8126-8000-0986c209046c'
  });
  
  const [tables] = await conn.execute('SHOW TABLES');
  console.log('Existing tables:', tables.map(t => Object.values(t)[0]));
  
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of tables) {
    const tableName = Object.values(table)[0];
    await conn.execute('DROP TABLE IF EXISTS `' + tableName + '`');
    console.log('Dropped:', tableName);
  }
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  console.log('All tables dropped!');
  await conn.end();
}

dropTables().catch(console.error);
