# Expertisor Jobs

A comprehensive job posting and searching platform built with Next.js, featuring dual-purpose functionality for both regular employment and freelance opportunities.

## Features

### For Job Seekers
- **Advanced Job Search**: Search by keywords, location, job type, and more
- **Smart Filtering**: Filter by experience level, salary range, work location type
- **Job Applications**: Apply directly through the platform or external links
- **Save Jobs**: Bookmark interesting positions for later
- **Profile Management**: Manage personal details, skills, and experience

### For Employers
- **Job Posting**: Create detailed job listings with rich descriptions
- **Company Profiles**: Showcase company information and culture
- **Application Management**: View and manage job applications
- **Dashboard**: Track job performance and analytics

### Technical Features
- **Authentication**: JWT-based auth with Google OAuth integration
- **Real-time Search**: Full-text search with PostgreSQL
- **Caching**: Redis-powered caching for optimal performance
- **Responsive Design**: Mobile-first, fully responsive interface
- **Security**: Rate limiting, input validation, and secure password hashing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT, Google OAuth
- **State Management**: Zustand
- **UI Components**: shadcn/ui, Radix UI
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis instance
- Google OAuth credentials (optional)

### Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expertisor_jobs"

# Redis Cloud
REDIS_HOST=""
REDIS_PORT=""
REDIS_PASSWORD=""
REDIS_USERNAME=""
# Alternative: Use REDIS_URL for connection string format
# REDIS_URL=""

# JWT Secrets
JWT_SECRET="your-jwt-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
\`\`\`

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/expertisor-jobs.git
   cd expertisor-jobs
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up the database**
   \`\`\`bash
   # Generate Prisma client
   npx prisma generate
   
   # Run migrations
   npx prisma db push
   
   # Seed the database with demo data
   npm run seed
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to \`http://localhost:3000\`

### Demo Accounts

After seeding, you can use these demo accounts:

**Job Seekers:**
- Email: \`john.doe@example.com\` | Password: \`password123\`
- Email: \`jane.smith@example.com\` | Password: \`password123\`

**Employers:**
- Email: \`hr@techcorp.com\` | Password: \`password123\`
- Email: \`hiring@startupxyz.com\` | Password: \`password123\`

## Project Structure

\`\`\`
expertisor-jobs/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── jobs/              # Job-related pages
│   └── ...
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── jobs/             # Job-related components
│   ├── layout/           # Layout components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Prisma client
│   ├── redis.ts          # Redis client
│   └── store.ts          # Zustand store
├── prisma/               # Database schema and migrations
├── scripts/              # Database scripts
└── ...
\`\`\`

## API Endpoints

### Authentication
- \`POST /api/auth/signin\` - Sign in user
- \`POST /api/auth/signup\` - Register new user
- \`POST /api/auth/logout\` - Sign out user

### Jobs
- \`GET /api/jobs\` - Get jobs with filtering and pagination
- \`GET /api/jobs/[id]\` - Get job details
- \`POST /api/jobs/[id]/apply\` - Apply for a job
- \`POST /api/jobs/[id]/save\` - Save/unsave a job

### Companies
- \`GET /api/companies\` - Get companies
- \`POST /api/companies/jobs\` - Create new job posting

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts (job seekers and employers)
- **Company**: Company profiles
- **Job**: Job postings
- **Application**: Job applications
- **SavedJob**: Saved jobs by users
- **Session**: User sessions for authentication

## Caching Strategy

Redis is used for caching:
- Job search results (5 minutes TTL)
- Job details (5 minutes TTL)
- Company profiles (10 minutes TTL)
- User sessions (30 days TTL)

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Short-lived access tokens + long-lived refresh tokens
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM with prepared statements
- **XSS Protection**: Input sanitization

## Performance Optimizations

- **Server-Side Rendering**: Critical pages use SSR
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching**: Multi-layer caching strategy
- **Database Indexing**: Optimized database queries

## Testing

\`\`\`bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
\`\`\`

## Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@expertisor.com or create an issue in the GitHub repository.
