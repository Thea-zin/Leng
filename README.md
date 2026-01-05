# Leng - Online Court Booking System

A simple and efficient web-based application for booking sports courts online.

## Features

- 🎾 Browse available courts (Tennis, Basketball, Badminton, Squash)
- 📅 Book courts by date and time
- 👀 View all current bookings
- ❌ Cancel bookings
- ⚡ Real-time conflict detection
- 📱 Responsive design

## Technology Stack

- **Backend:** Node.js with Express
- **Database:** SQLite with better-sqlite3
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Thea-zin/Leng.git
cd Leng
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. The application will:
   - Automatically create a database with sample courts
   - Provide a user-friendly interface for booking

## Development

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Courts
- `GET /api/courts` - Get all available courts

### Bookings
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create a new booking
- `DELETE /api/bookings/:id` - Cancel a booking

## Project Structure

```
Leng/
├── public/
│   ├── index.html      # Main frontend page
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
├── server.js           # Express server
├── database.js         # Database initialization
├── package.json        # Dependencies
└── README.md           # Documentation
```

## Sample Courts

The system comes pre-configured with:
- Court A & B: Tennis ($25/hr)
- Court C: Basketball ($30/hr)
- Court D: Badminton ($20/hr)
- Court E: Squash ($22/hr)

## Contributing

Feel free to submit issues and pull requests.

## License

MIT