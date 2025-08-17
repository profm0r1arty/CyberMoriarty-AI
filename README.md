CyberMoriarty AI - Cybersecurity Assessment Platform
A professional AI-powered cybersecurity platform designed for security professionals to identify, assess, and manage vulnerabilities through intelligent analysis and comprehensive reporting.

⚠️ Important Security Notice
This tool is designed exclusively for legitimate cybersecurity professionals and authorized security testing purposes only.

Use only on systems you own or have explicit written permission to test
Comply with all applicable laws and regulations
Follow responsible disclosure practices
Do not use for malicious activities
🚀 Features
AI-Powered Vulnerability Analysis: Leverages OpenAI GPT-4o for intelligent risk assessment
CVE Database Integration: Real-time access to NIST National Vulnerability Database
Risk Assessment Engine: Automated vulnerability scoring and exploitability analysis
Testing Environment: Simulated environment for safe vulnerability testing
Professional Reporting: Comprehensive security reports with AI-generated recommendations
Dark Theme Interface: Professional cybersecurity-focused design
🛠️ Technology Stack
Frontend: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui
Backend: Node.js + Express, TypeScript
Database: PostgreSQL with Drizzle ORM
AI Integration: OpenAI GPT-4o
External APIs: NIST National Vulnerability Database
📋 Prerequisites
Node.js 18+
PostgreSQL database
OpenAI API key
🔧 Installation
Clone the repository

git clone <repository-url>
cd cybermoriarty-ai
Install dependencies

npm install
Set up environment variables Create a .env file in the root directory:

# Required for AI analysis features
OPENAI_API_KEY=your_openai_api_key_here

# Database configuration (if using PostgreSQL)
DATABASE_URL=your_postgresql_connection_string
Start the development server

npm run dev
Access the application Open your browser and navigate to http://localhost:5000

🔑 Getting API Keys
OpenAI API Key
Visit OpenAI Platform
Sign up or log in to your account
Create a new API key
Copy the key (starts with "sk-")
Add it to your .env file
🎯 Usage
Dashboard: Overview of vulnerability statistics and recent assessments
Vulnerability Search: Search and filter CVE database entries
Risk Assessment: AI-powered analysis of vulnerability risks
Test Environment: Safe simulation environment for vulnerability testing
Reports: Generate comprehensive security assessment reports
🏗️ Project Structure
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
🚦 Development Guidelines
The project uses TypeScript throughout for type safety
Backend follows RESTful API design patterns
Frontend uses TanStack Query for state management
All forms are validated using Zod schemas
Components use shadcn/ui design system
📚 API Documentation
Core Endpoints
GET /api/stats - Platform statistics
GET /api/vulnerabilities/search - Search vulnerabilities
POST /api/assessments - Create vulnerability assessment
GET /api/assessments - Retrieve assessments
POST /api/reports - Generate security reports
🤝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🛡️ Security Policy
Report security vulnerabilities through responsible disclosure
Do not publish sensitive security information publicly
Follow ethical hacking guidelines and best practices
⚠️ Disclaimer
This software is provided for educational and authorized security testing purposes only. Users are responsible for ensuring compliance with all applicable laws and regulations. The developers assume no liability for misuse of this software.

For security professionals, by security professionals.
