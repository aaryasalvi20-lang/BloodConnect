const db = require('../db');

exports.createEvent = async (req, res) => {
    try {
        const { title, date, start_time, end_time, location, max_capacity, blood_groups, description, contact_person, emergency_contact } = req.body;
        const camp_id = req.user.id; // From authMiddleware

        if (req.user.role !== 'camp') {
            return res.status(403).json({ message: 'Only camp organizers can create events' });
        }

        const [result] = await db.execute(
            'INSERT INTO camp_events (camp_id, title, date, start_time, end_time, location, max_capacity, blood_groups, description, contact_person, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [camp_id, title, date, start_time, end_time, location, max_capacity, blood_groups, description, contact_person, emergency_contact]
        );

        res.status(201).json({ id: result.insertId, message: 'Event created successfully' });
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        let query = 'SELECT * FROM camp_events ORDER BY date ASC';
        let params = [];

        if (req.user && req.user.role === 'hospital') {
            query = `
                SELECT ce.*, 
                (SELECT status FROM camp_collaborations WHERE event_id = ce.id AND hospital_id = ?) as collab_status
                FROM camp_events ce 
                ORDER BY ce.date ASC
            `;
            params = [req.user.id];
        }

        const [events] = await db.execute(query, params);
        res.json(events);
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getMyEvents = async (req, res) => {
    try {
        const [events] = await db.execute('SELECT * FROM camp_events WHERE camp_id = ? ORDER BY date DESC', [req.user.id]);
        res.json(events);
    } catch (error) {
        console.error('Get My Events Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const [result] = await db.execute(
            'UPDATE camp_events SET status = ? WHERE id = ? AND camp_id = ?',
            [status, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found or unauthorized' });
        }

        res.json({ message: 'Event status updated successfully' });
    } catch (error) {
        console.error('Update Event Status Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.registerForEvent = async (req, res) => {
    try {
        const { event_id } = req.params;
        const donor_id = req.user.id;

        if (req.user.role !== 'donor') {
            return res.status(403).json({ message: 'Only donors can register for events' });
        }

        // Check if already registered
        const [existing] = await db.execute(
            'SELECT * FROM camp_registrations WHERE event_id = ? AND donor_id = ?',
            [event_id, donor_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        await db.execute(
            'INSERT INTO camp_registrations (event_id, donor_id) VALUES (?, ?)',
            [event_id, donor_id]
        );

        res.status(201).json({ message: 'Registered successfully' });
    } catch (error) {
        console.error('Event Registration Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getEventRegistrations = async (req, res) => {
    try {
        const { event_id } = req.params;
        
        // Ensure the camp organizer owns this event
        const [event] = await db.execute('SELECT camp_id FROM camp_events WHERE id = ?', [event_id]);
        if (event.length === 0 || event[0].camp_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const [registrations] = await db.execute(`
            SELECT cr.*, d.name as donor_name, d.email, d.phone_number, d.blood_group 
            FROM camp_registrations cr
            JOIN donors d ON cr.donor_id = d.id
            WHERE cr.event_id = ?
            ORDER BY cr.registration_date DESC
        `, [event_id]);

        res.json(registrations);
    } catch (error) {
        console.error('Get Registrations Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getAllRegistrations = async (req, res) => {
    try {
        const [registrations] = await db.execute(`
            SELECT cr.*, d.name as donor_name, d.email, d.phone_number, d.blood_group, ce.title as event_title
            FROM camp_registrations cr
            JOIN donors d ON cr.donor_id = d.id
            JOIN camp_events ce ON cr.event_id = ce.id
            WHERE ce.camp_id = ?
            ORDER BY cr.registration_date DESC
        `, [req.user.id]);
        res.json(registrations);
    } catch (error) {
        console.error('Get All Registrations Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.requestCollaboration = async (req, res) => {
    try {
        const { event_id, message } = req.body;
        const hospital_id = req.user.id;

        if (req.user.role !== 'hospital') {
            return res.status(403).json({ message: 'Only hospitals can request collaboration' });
        }

        await db.execute(
            'INSERT INTO camp_collaborations (event_id, hospital_id, message) VALUES (?, ?, ?)',
            [event_id, hospital_id, message]
        );

        res.status(201).json({ message: 'Collaboration request sent' });
    } catch (error) {
        console.error('Collaboration Request Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getCollaborations = async (req, res) => {
    try {
        let query = '';
        let params = [];

        if (req.user.role === 'camp') {
            query = `
                SELECT cc.*, h.name as hospital_name, h.location as hospital_location, h.phone_number as hospital_phone, ce.title as event_title
                FROM camp_collaborations cc
                JOIN hospitals h ON cc.hospital_id = h.id
                JOIN camp_events ce ON cc.event_id = ce.id
                WHERE ce.camp_id = ?
                ORDER BY cc.created_at DESC
            `;
            params = [req.user.id];
        } else if (req.user.role === 'hospital') {
            query = `
                SELECT cc.*, ce.title as event_title, ce.date, ce.location as event_location, c.name as camp_name
                FROM camp_collaborations cc
                JOIN camp_events ce ON cc.event_id = ce.id
                JOIN camps c ON ce.camp_id = c.id
                WHERE cc.hospital_id = ?
                ORDER BY cc.created_at DESC
            `;
            params = [req.user.id];
        }

        const [collaborations] = await db.execute(query, params);
        res.json(collaborations);
    } catch (error) {
        console.error('Get Collaborations Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.updateCollaborationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (req.user.role !== 'camp') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const [result] = await db.execute(
            'UPDATE camp_collaborations cc JOIN camp_events ce ON cc.event_id = ce.id SET cc.status = ? WHERE cc.id = ? AND ce.camp_id = ?',
            [status, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Request not found or unauthorized' });
        }

        res.json({ message: 'Status updated' });
    } catch (error) {
        console.error('Update Collaboration Error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
