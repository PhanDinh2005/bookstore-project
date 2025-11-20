const sql = require('mssql');

const config = {
  server: 'localhost',
  port: 1433,
  user: 'sa',
  password: '123',
  database: 'master',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function testSAConnection() {
  try {
    console.log('🔌 Testing SA connection...');
    console.log('📊 Configuration:');
    console.log(`   Server: ${config.server}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Database: ${config.database}`);
    
    const pool = await sql.connect(config);
    console.log('✅ SUCCESS: Connected to SQL Server with SA account!');
    
    // Test query
    const result = await pool.request().query('SELECT name FROM sys.databases');
    console.log('📦 Available databases:');
    result.recordset.forEach(db => console.log(`   - ${db.name}`));
    
    await pool.close();
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('1. Make sure SQL Server is running');
    console.log('2. Check if SA account is enabled');
    console.log('3. Verify password is correct');
    console.log('4. Check SQL Server Configuration Manager');
    return false;
  }
}

testSAConnection();