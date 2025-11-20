const sql = require('mssql');

// Thử kết nối với các cấu hình khác nhau
const configs = [
  {
    name: 'Windows Authentication',
    config: {
      server: 'localhost',
      database: 'master',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true // Sử dụng Windows Authentication
      }
    }
  },
  {
    name: 'SQL Authentication with sa',
    config: {
      server: 'localhost',
      database: 'master',
      user: 'sa',
      password: '123456', // Thay bằng mật khẩu thực tế
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  },
  {
    name: 'SQL Express with Windows Auth',
    config: {
      server: 'localhost\\SQLEXPRESS',
      database: 'master',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true
      }
    }
  },
  {
    name: 'SQL Express with sa',
    config: {
      server: 'localhost\\SQLEXPRESS',
      database: 'master',
      user: 'sa',
      password: '123456', // Thay bằng mật khẩu thực tế
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    }
  }
];

async function testConnection(config, configName) {
  try {
    console.log(`\n🔌 Testing ${configName}...`);
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT name FROM sys.databases');
    console.log(`✅ ${configName} successful! Available databases:`);
    result.recordset.forEach(db => console.log(`   - ${db.name}`));
    await pool.close();
    return true;
  } catch (error) {
    console.error(`❌ ${configName} failed:`, error.message);
    return false;
  }
}

async function runTests() {
  for (const { name, config } of configs) {
    const success = await testConnection(config, name);
    if (success) {
      console.log(`🎉 Found working configuration: ${name}`);
      break;
    }
  }
}

runTests();