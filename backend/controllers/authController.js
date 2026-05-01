const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'super_secret_jwt_key_12345', {
        expiresIn: '30d',
    });
};

exports.registerDonor = async (req, res) => {
    try {
        console.log('Donor Register Request:', req.body);
        const { name, email, password, blood_group, dob, age, location, last_donation_date, disease_status, disease_details, donor_id_number, donor_phone } = req.body;

        if (!dob || dob === "") {
            return res.status(400).json({ message: "Registration failed: Date of Birth is required." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO donors (name, email, password, blood_group, dob, age, location, last_donation_date, disease_status, disease_details, donor_id_number, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, blood_group, dob, age, location, last_donation_date || null, disease_status || 'No', disease_details || null, donor_id_number || null, donor_phone]
        );

        const token = generateToken(result.insertId, 'donor');
        res.status(201).json({ id: result.insertId, name, email, role: 'donor', token });
    } catch (error) {
        console.error('Registration Error (Donor):', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.loginDonor = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [donors] = await db.execute('SELECT * FROM donors WHERE email = ?', [email]);
        
        if (donors.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
        
        const donor = donors[0];
        const isMatch = await bcrypt.compare(password, donor.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(donor.id, 'donor');
        res.json({ id: donor.id, name: donor.name, email: donor.email, role: 'donor', token });
    } catch (error) {
        console.error('Registration Error (Donor):', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.registerHospital = async (req, res) => {
    try {
        console.log('Hospital Register Request:', req.body);
        const { name, email, password, location, license_number, hospital_phone } = req.body;

        const [existing] = await db.execute('SELECT email FROM hospitals WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        if (!license_number || license_number === "") {
            return res.status(400).json({ message: 'License number is required' });
        }

        const [result] = await db.execute(
            'INSERT INTO hospitals (name, email, password, location, license_number, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, location, license_number, hospital_phone]
        );

        const token = generateToken(result.insertId, 'hospital');
        res.status(201).json({ id: result.insertId, name, email, role: 'hospital', token });
    } catch (error) {
        console.error('Registration Error (Donor):', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.loginHospital = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [hospitals] = await db.execute('SELECT * FROM hospitals WHERE email = ?', [email]);
        
        if (hospitals.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
        
        const hospital = hospitals[0];
        const isMatch = await bcrypt.compare(password, hospital.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(hospital.id, 'hospital');
        res.json({ id: hospital.id, name: hospital.name, email: hospital.email, role: 'hospital', token });
    } catch (error) {
        console.error('Login Error (Hospital):', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.registerCamp = async (req, res) => {
    try {
        console.log('Camp Register Request:', req.body);
        const { name, organizer_name, organizer_type, email, password, phone_number, location } = req.body;

        const [existing] = await db.execute('SELECT email FROM camps WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO camps (name, organizer_name, organizer_type, email, password, phone_number, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, organizer_name, organizer_type, email, hashedPassword, phone_number, location]
        );

        const token = generateToken(result.insertId, 'camp');
        res.status(201).json({ id: result.insertId, name, email, role: 'camp', token });
    } catch (error) {
        console.error('Registration Error (Camp):', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.loginCamp = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [camps] = await db.execute('SELECT * FROM camps WHERE email = ?', [email]);
        
        if (camps.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
        
        const camp = camps[0];
        const isMatch = await bcrypt.compare(password, camp.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = generateToken(camp.id, 'camp');
        res.json({ id: camp.id, name: camp.name, email: camp.email, role: 'camp', token });
    } catch (error) {
        console.error('Login Error (Camp):', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        let table;
        if (req.user.role === 'donor') table = 'donors';
        else if (req.user.role === 'hospital') table = 'hospitals';
        else if (req.user.role === 'camp') table = 'camps';
        
        const [users] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [req.user.id]);
        
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = users[0];
        delete user.password; // Security
        res.json(user);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { role, id } = req.user;
        const { name, location, blood_group, age } = req.body;
        
        if (role === 'donor') {
            const [current] = await db.execute('SELECT * FROM donors WHERE id = ?', [id]);
            if (current.length === 0) return res.status(404).json({ message: 'Donor not found' });
            const donor = current[0];

            await db.execute(
                'UPDATE donors SET name = ?, blood_group = ?, age = ?, location = ? WHERE id = ?',
                [
                    name !== undefined ? name : donor.name,
                    blood_group !== undefined ? blood_group : donor.blood_group,
                    age !== undefined ? age : donor.age,
                    location !== undefined ? location : donor.location,
                    id
                ]
            );
        } else if (role === 'hospital') {
            const [current] = await db.execute('SELECT * FROM hospitals WHERE id = ?', [id]);
            if (current.length === 0) return res.status(404).json({ message: 'Hospital not found' });
            const hospital = current[0];

            await db.execute(
                'UPDATE hospitals SET name = ?, location = ? WHERE id = ?',
                [
                    name !== undefined ? name : hospital.name,
                    location !== undefined ? location : hospital.location,
                    id
                ]
            );
        } else if (role === 'camp') {
            const [current] = await db.execute('SELECT * FROM camps WHERE id = ?', [id]);
            if (current.length === 0) return res.status(404).json({ message: 'Camp not found' });
            const camp = current[0];
            const { organizer_name, organizer_type, phone_number } = req.body;

            await db.execute(
                'UPDATE camps SET name = ?, organizer_name = ?, organizer_type = ?, phone_number = ?, location = ? WHERE id = ?',
                [
                    name !== undefined ? name : camp.name,
                    organizer_name !== undefined ? organizer_name : camp.organizer_name,
                    organizer_type !== undefined ? organizer_type : camp.organizer_type,
                    phone_number !== undefined ? phone_number : camp.phone_number,
                    location !== undefined ? location : camp.location,
                    id
                ]
            );
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
