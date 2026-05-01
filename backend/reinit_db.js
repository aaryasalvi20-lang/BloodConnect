const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function reinitDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        multipleStatements: true // Essential for running the entire schema.sql
    });

    try {
        console.log('Connected to MySQL. Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Executing schema.sql...');
        await connection.query(schema);

        console.log('Database re-initialized successfully! 🚀');
        process.exit(0);
    } catch (error) {
        console.error('Error re-initializing database:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

reinitDB();
