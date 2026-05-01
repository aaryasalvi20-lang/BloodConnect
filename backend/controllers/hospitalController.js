const db = require('../db');

exports.getInventory = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const [rows] = await db.execute('SELECT * FROM blood_inventory WHERE hospital_id = ?', [hospitalId]);
        res.json(rows);
    } catch (error) {
        console.error('Get Inventory Error:', error);
        res.status(500).json({ message: 'Server error fetching inventory' });
    }
};

exports.updateInventory = async (req, res) => {
    try {
        const hospitalId = req.user.id;
        const { blood_group, units, action } = req.body;

        if (!blood_group || units === undefined || !action) {
            return res.status(400).json({ message: 'Blood group, units and action are required' });
        }

        let query = '';
        let params = [];

        if (action === 'add') {
            query = `
                INSERT INTO blood_inventory (hospital_id, blood_group, units) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE units = units + ?, last_updated = CURRENT_TIMESTAMP
            `;
            params = [hospitalId, blood_group, units, units];
        } else {
            // Action is 'set'
            query = `
                INSERT INTO blood_inventory (hospital_id, blood_group, units) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE units = ?, last_updated = CURRENT_TIMESTAMP
            `;
            params = [hospitalId, blood_group, units, units];
        }

        await db.execute(query, params);
        res.json({ message: 'Inventory updated successfully' });
    } catch (error) {
        console.error('Update Inventory Error:', error);
        res.status(500).json({ message: 'Server error updating inventory' });
    }
};
