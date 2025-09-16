# AI-Powered Cyber Threat Intelligence Platform

A comprehensive cybersecurity platform that provides real-time threat monitoring, AI-powered analysis, and intelligent alerting across multiple data sources.

## 🚀 Features

- **AI/ML Engine**: Advanced threat scoring, pattern recognition, and noise filtering
- **Real-Time Monitoring Dashboard**: Live threat detection with customized alerts
- **Threat Graph Database**: Relationship mapping and contextual threat analysis
- **Web-Based Interface**: Modern, responsive UI with real-time updates
- **Multi-Source Data Ingestion**: Open Web, Dark Web, and Threat Intelligence Feeds

## 🛠️ Technology Stack

### Backend
- Node.js with TypeScript
- Express.js for REST API
- Socket.IO for real-time communication
- PostgreSQL with Sequelize ORM
- Redis for caching
- TensorFlow.js for AI/ML capabilities

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI for components
- Socket.IO Client for real-time updates

## 📦 Quick Start

### With Docker
```bash
git clone <repository-url>
cd cyber-threat-intelligence-platform
docker-compose up -d
```

### Manual Installation
```bash
git clone <repository-url>
cd cyber-threat-intelligence-platform
npm run install:all
npm run dev:full
```

## 📊 API Endpoints

- `GET /api/v1/dashboard/stats` - Real-time statistics
- `GET /api/v1/dashboard/alerts` - Get alerts with filtering
- `GET /api/v1/dashboard/patterns` - Threat patterns
- `GET /api/v1/dashboard/network/:threatId` - Threat network graph

## 🔧 Configuration

Create a `.env` file with your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cyber_threat_intelligence
DB_USER=postgres
DB_PASSWORD=your_password
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
```

## 📄 Documentation

- [Setup Guide](setup.md)
- [API Documentation](docs/api.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ by the Cyber Threat Intelligence Team**
