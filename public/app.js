// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        // Load bookings when switching to view tab
        if (tabName === 'view') {
            loadBookings();
        }
    });
});

// Load courts on page load
async function loadCourts() {
    try {
        const response = await fetch('/api/courts');
        const courts = await response.json();
        
        const courtSelect = document.getElementById('court_id');
        courts.forEach(court => {
            const option = document.createElement('option');
            option.value = court.id;
            option.textContent = `${court.name} - ${court.type} ($${court.hourly_rate}/hr)`;
            courtSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading courts:', error);
    }
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message show ${type}`;
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 5000);
}

// Handle booking form submission
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        court_id: document.getElementById('court_id').value,
        customer_name: document.getElementById('customer_name').value,
        customer_email: document.getElementById('customer_email').value,
        booking_date: document.getElementById('booking_date').value,
        start_time: document.getElementById('start_time').value,
        end_time: document.getElementById('end_time').value
    };
    
    // Validate end time is after start time
    if (formData.start_time >= formData.end_time) {
        showMessage('End time must be after start time', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Booking created successfully!', 'success');
            document.getElementById('bookingForm').reset();
        } else {
            showMessage(data.error || 'Failed to create booking', 'error');
        }
    } catch (error) {
        showMessage('Error creating booking. Please try again.', 'error');
        console.error('Error:', error);
    }
});

// Load bookings
async function loadBookings() {
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '<p class="loading">Loading bookings...</p>';
    
    try {
        const response = await fetch('/api/bookings');
        const bookings = await response.json();
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = '<div class="empty-state"><p>No bookings yet. Make your first booking!</p></div>';
            return;
        }
        
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-item">
                <div class="booking-header">
                    <h3>${booking.court_name}</h3>
                    <button class="btn btn-danger" onclick="cancelBooking(${booking.id})">Cancel</button>
                </div>
                <div class="booking-details">
                    <p><strong>Customer:</strong> ${booking.customer_name} (${booking.customer_email})</p>
                    <p><strong>Date:</strong> ${formatDate(booking.booking_date)}</p>
                    <p><strong>Time:</strong> ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</p>
                    <p><strong>Court Type:</strong> ${booking.court_type}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        bookingsList.innerHTML = '<p class="loading">Error loading bookings. Please try again.</p>';
        console.error('Error:', error);
    }
}

// Cancel booking
async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/bookings/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadBookings();
            showMessage('Booking cancelled successfully', 'success');
        } else {
            const data = await response.json();
            showMessage(data.error || 'Failed to cancel booking', 'error');
        }
    } catch (error) {
        showMessage('Error cancelling booking. Please try again.', 'error');
        console.error('Error:', error);
    }
}

// Helper functions
function formatDate(dateString) {
    const parts = dateString.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Set minimum date to today
document.getElementById('booking_date').min = new Date().toISOString().split('T')[0];

// Initialize
loadCourts();
