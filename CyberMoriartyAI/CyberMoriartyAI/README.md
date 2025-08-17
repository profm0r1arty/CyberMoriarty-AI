# CyberMoriarty AI - Cybersecurity Assessment Platform

A professional AI-powered cybersecurity platform designed for security professionals to identify, assess, and manage vulnerabilities through intelligent analysis and comprehensive reporting.

## ⚠️ Important Security Notice

**This tool is designed exclusively for legitimate cybersecurity professionals and authorized security testing purposes only.** 

- Use only on systems you own or have explicit written permission to test
- Comply with all applicable laws and regulations
- Follow responsible disclosure practices
- Do not use for malicious activities

## 🚀 Features

- **AI-Powered Vulnerability Analysis**: Leverages OpenAI GPT-4o for intelligent risk assessment
- **CVE Database Integration**: Real-time access to NIST National Vulnerability Database
- **Risk Assessment Engine**: Automated vulnerability scoring and exploitability analysis
- **Testing Environment**: Simulated environment for safe vulnerability testing
- **Professional Reporting**: Comprehensive security reports with AI-generated recommendations
- **Dark Theme Interface**: Professional cybersecurity-focused design

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Node.js + Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o
- **External APIs**: NIST National Vulnerability Database

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cybermoriarty-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Required for AI analysis features
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database configuration (if using PostgreSQL)
   DATABASE_URL=your_postgresql_connection_string
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 🔑 Getting API Keys

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key (starts with "sk-")
5. Add it to your `.env` file

## 🎯 Usage

1. **Dashboard**: Overview of vulnerability statistics and recent assessments
2. **Vulnerability Search**: Search and filter CVE database entries
3. **Risk Assessment**: AI-powered analysis of vulnerability risks
4. **Test Environment**: Safe simulation environment for vulnerability testing
5. **Reports**: Generate comprehensive security assessment reports

## 🏗️ Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend server
│   ├── services/           # Business logic services
│   ├── routes.ts           # API route definitions
│   └── storage.ts          # Data storage interface
├── shared/                 # Shared TypeScript schemas
└── package.json            # Project dependencies
```

## 🚦 Development Guidelines

- The project uses TypeScript throughout for type safety
- Backend follows RESTful API design patterns
- Frontend uses TanStack Query for state management
- All forms are validated using Zod schemas
- Components use shadcn/ui design system

## 📚 API Documentation

### Core Endpoints

- `GET /api/stats` - Platform statistics
- `GET /api/vulnerabilities/search` - Search vulnerabilities
- `POST /api/assessments` - Create vulnerability assessment
- `GET /api/assessments` - Retrieve assessments
- `POST /api/reports` - Generate security reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🛡️ Security Policy

- Report security vulnerabilities through responsible disclosure
- Do not publish sensitive security information publicly
- Follow ethical hacking guidelines and best practices

## ⚠️ Disclaimer

This software is provided for educational and authorized security testing purposes only. Users are responsible for ensuring compliance with all applicable laws and regulations. The developers assume no liability for misuse of this software.

---

**For security professionals, by security professionals.**