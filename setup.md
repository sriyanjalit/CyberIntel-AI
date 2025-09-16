# Cyber Threat Intelligence Platform Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- Redis (v6 or higher)
- npm or yarn

## Environment Configuration

Create a `.env` file in the root directory with the following configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyber_threat_intelligence
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_here

# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Security Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# External API Keys (for threat intelligence feeds)
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
SHODAN_API_KEY=your_shodan_api_key_here
ALIENVAULT_OTX_API_KEY=your_otx_api_key_here

# Dark Web Monitoring (example endpoints - replace with actual)
DARK_WEB_API_ENDPOINT=https://api.threatintel.example.com
DARK_WEB_API_KEY=your_dark_web_api_key_here

# Notification Settings
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your_email@gmail.com
EMAIL_SMTP_PASS=your_email_password_here

# AI/ML Configuration
TENSORFLOW_MODEL_URL=https://your-model-server.com/models/threat-classifier
AI_CONFIDENCE_THRESHOLD=0.7
PATTERN_DETECTION_ENABLED=true

# Logging Configuration
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log

# Monitoring Configuration
HEALTH_CHECK_INTERVAL=30000
THREAT_PROCESSING_INTERVAL=300000
DATA_INGESTION_INTERVAL=600000

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3001/api/v1
```

## Installation Steps

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb cyber_threat_intelligence

# Run database migrations (automatically handled by Sequelize)
cd backend
npm run dev
```

### 3. Redis Setup

```bash
# Start Redis server
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Start the Application

```bash
# Start backend server
cd backend
npm run dev

# Start frontend (in a new terminal)
npm run dev
```

## Architecture Components

### Data Sources
- **Open Web**: CVE Database, NVD, US-CERT, Krebs on Security, Threatpost, Bleeping Computer
- **Dark Web**: Marketplace Monitor, Forums Monitor, Chat Channels (simulated)
- **Threat Feeds**: AlienVault OTX, MISP, VirusTotal, Shodan

### AI/ML Engine Features
- Threat Scoring & Prioritization
- Pattern Recognition (temporal, source correlation, severity escalation)
- Noise Filtering
- Similarity Analysis

### Real-Time Monitoring Dashboard
- Customized Alerts
- Hands-On Tasks & Assessments
- Threat Network Visualization
- Pattern Detection

### Web-Based Interface
- Real-time threat feed
- Interactive threat map
- Analytics and reporting
- Alert management

## API Endpoints

### Dashboard API (`/api/v1/dashboard`)
- `GET /stats` - Real-time statistics
- `GET /alerts` - Get alerts with filtering
- `GET /alerts/:id` - Get specific alert
- `PUT /alerts/:id/status` - Update alert status
- `GET /patterns` - Threat patterns
- `GET /network/:threatId` - Threat network graph
- `GET /intelligence/summary` - Intelligence summary
- `GET /trends` - Threat trends
- `GET /alerts/config` - Alert configuration
- `PUT /alerts/config` - Update alert configuration

### Authentication API (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /profile` - Get user profile

### Threats API (`/api/v1/threats`)
- `GET /` - List threats
- `GET /:id` - Get specific threat
- `POST /` - Create threat
- `PUT /:id` - Update threat
- `DELETE /:id` - Delete threat

## Socket.IO Events

### Client Events
- `join-room` - Join a monitoring room
- `join-category` - Join category-specific room
- `acknowledge-alert` - Acknowledge an alert
- `update-alert-status` - Update alert status

### Server Events
- `new-alert` - New threat alert
- `category-alert` - Category-specific alert
- `high-severity-alert` - High severity alert
- `threat-patterns` - Detected threat patterns
- `alert-updated` - Alert status update

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
```

### Frontend Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

## Production Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
```bash
# Build backend
cd backend
npm run build

# Build frontend
npm run build

# Start production server
cd backend
npm start
```

## Monitoring and Logging

- Application logs: `./logs/app.log`
- Health check: `http://localhost:3001/health`
- Real-time monitoring via Socket.IO
- Winston logging with multiple transports

## Security Considerations

- JWT-based authentication
- Rate limiting
- CORS configuration
- Input validation
- SQL injection prevention
- XSS protection

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Redis Connection Error**
   - Check Redis is running
   - Verify Redis configuration

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on the port

4. **CORS Issues**
   - Update CORS_ORIGIN in `.env`
   - Check frontend URL configuration

### Logs
Check application logs for detailed error information:
```bash
tail -f logs/app.log
```

## Support

For issues and questions:
1. Check the logs for error details
2. Verify environment configuration
3. Ensure all services are running
4. Check network connectivity
