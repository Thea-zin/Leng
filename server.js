const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// API Routes

// Get all courts
app.get('/api/courts', (req, res) => {
  try {
    const courts = db.prepare('SELECT * FROM courts ORDER BY name').all();
    res.json(courts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
});

// Get all bookings
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = db.prepare(`
      SELECT b.*, c.name as court_name, c.type as court_type 
      FROM bookings b 
      JOIN courts c ON b.court_id = c.id 
      ORDER BY b.booking_date DESC, b.start_time DESC
    `).all();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const { court_id, customer_name, customer_email, booking_date, start_time, end_time } = req.body;

  // Basic validation
  if (!court_id || !customer_name || !customer_email || !booking_date || !start_time || !end_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customer_email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate date is not in the past
  const today = new Date().toISOString().split('T')[0];
  if (booking_date < today) {
    return res.status(400).json({ error: 'Booking date cannot be in the past' });
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res.status(400).json({ error: 'Invalid time format. Use HH:MM' });
  }

  // Validate end time is after start time
  if (start_time >= end_time) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }

  // Check for conflicting bookings
  const conflict = db.prepare(`
    SELECT * FROM bookings 
    WHERE court_id = ? 
    AND booking_date = ? 
    AND start_time < ?
    AND end_time > ?
  `).get(court_id, booking_date, end_time, start_time);

  if (conflict) {
    return res.status(409).json({ error: 'This time slot is already booked' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO bookings (court_id, customer_name, customer_email, booking_date, start_time, end_time)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(court_id, customer_name, customer_email, booking_date, start_time, end_time);

    const newBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM bookings WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Court booking system running on http://localhost:${PORT}`);
});
