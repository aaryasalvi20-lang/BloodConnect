const db = require('./db');
const bcrypt = require('bcrypt');

async function testReg() {
    try {
        const name = 'Test Donor';
        const email = 'test@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        console.log('Inserting test donor...');
        const [result] = await db.execute(
            'INSERT INTO donors (name, email, password, blood_group, dob, age, location, last_donation_date, disease_status, disease_details, donor_id_number, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'O+', '1990-01-01', 34, 'New York', null, 'No', null, 'D12345', '1234567890']
        );
        
        console.log('Insert result:', result);
        
        const [rows] = await db.execute('SELECT * FROM donors WHERE email = ?', [email]);
        console.log('Query result:', rows);
        
        process.exit(0);
    } catch (error) {
        console.error('Error during test registration:', error);
        process.exit(1);
    }
}

testReg();
