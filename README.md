# LifeOS AI - Personal Life Operating System

A comprehensive AI-powered platform for managing and optimizing different aspects of your life through intelligent goal tracking, habit management, expense monitoring, study planning, and productivity analytics.

## Features

- **Goal Management**: Create and track yearly, monthly, and weekly goals with milestones
- **Habit Tracking**: Build consistent behaviors with streak tracking and analytics
- **Expense Management**: Monitor spending with categorized budgeting and alerts
- **Study Planning**: Organize study sessions with deadline tracking and progress monitoring
- **Productivity Analytics**: Visualize trends with interactive charts and metrics
- **AI Insights**: Get personalized recommendations powered by behavioral analysis
- **Burnout Detection**: Proactive system to detect declining productivity patterns
- **Dark Futuristic Design**: Premium glassmorphism UI with smooth animations

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript
- **UI Framework**: shadcn/ui with Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Engine**: OpenAI API
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Design System**: Custom dark theme with cyan/magenta accents

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lifeos-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   - Go to your Supabase project
   - Open the SQL Editor
   - Copy the contents of `migrations/init.sql`
   - Paste and run the migration
   - This will create all necessary tables and RLS policies

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
/app
  /auth              - Authentication pages (login, signup)
  /dashboard         - Main dashboard and layout
  /goals             - Goals management module
  /habits            - Habits tracking module
  /expenses          - Expense tracking module
  /study             - Study planning module
  /analytics         - Analytics and charts
  /insights          - AI insights and recommendations
  /settings          - User settings
  /api               - API routes for data operations

/components
  /ui                - shadcn/ui components

/lib
  /supabase          - Supabase client setup
  /ai                - AI/OpenAI helpers
  /hooks             - Custom React hooks

/migrations
  /init.sql          - Database schema and RLS policies

/public
  /                  - Static assets
```

## Key Features Explained

### 1. Dashboard
- Overview of goals, habits, and productivity metrics
- Quick action buttons for common tasks
- AI-generated insights summary
- Recent activity feed

### 2. Goals Module
- Create goals with types: yearly, monthly, weekly
- Set priorities: low, medium, high
- Track progress with milestones
- Visual progress bars

### 3. Habits Module
- Daily/weekly habit tracking
- Streak counter showing consistency
- Category organization
- Completion analytics

### 4. Expense Tracking
- Log expenses with categories
- Budget management by category
- Monthly budget limits
- Visual spending breakdown

### 5. Study Planning
- Schedule study sessions
- Track completion progress
- Deadline management
- Time tracking

### 6. Analytics Dashboard
- Weekly productivity trends
- Goal completion distribution
- Habit consistency charts
- Expense breakdowns

### 7. AI Insights
- Behavioral analysis
- Burnout risk detection
- Goal completion predictions
- Personalized recommendations
- Pattern recognition

## Database Schema

The application uses PostgreSQL with the following main tables:

- `goals` - User goals with milestones
- `goal_milestones` - Goal sub-tasks
- `habits` - Daily/weekly habits
- `habit_logs` - Habit completion logs
- `expenses` - Financial transactions
- `expense_categories` - Budget categories
- `study_sessions` - Study sessions
- `productivity_analytics` - Daily metrics
- `ai_insights` - AI-generated insights
- `user_profiles` - User settings

## Authentication

- Uses Supabase Auth with email/password
- Row-level security (RLS) policies protect user data
- Each user can only access their own data

## AI Integration

The AI engine uses OpenAI's API to:

1. **Analyze Behavior**: Process user activity patterns
2. **Predict Outcomes**: Estimate goal completion probability
3. **Detect Risks**: Identify burnout patterns
4. **Generate Recommendations**: Provide actionable insights
5. **Recognize Patterns**: Find correlations in data

## Design System

### Color Palette
- **Primary**: Cyan (#00d4ff)
- **Secondary**: Magenta (#ff00ff)
- **Success**: Neon Green (#00ff88)
- **Warning**: Amber (#ffaa00)
- **Danger**: Red (#ff0055)
- **Background**: Deep Navy (#0f0f1e)

### Effects
- Glassmorphism with backdrop blur
- Glowing gradients on interactive elements
- Smooth animations with Framer Motion
- Hover states for all interactive elements

## API Routes

- `GET /api/goals` - Fetch all goals
- `POST /api/goals` - Create new goal
- `GET /api/habits` - Fetch all habits
- `POST /api/habits` - Log habit completion
- `GET /api/expenses` - Fetch expenses
- `POST /api/expenses` - Log new expense

## Environment Variables

Create a `.env.local` file in the root directory and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```
## Deployment

### Deploy to Vercel

1. Push your repository to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

```bash
vercel deploy
```

## Future Enhancements

- Mobile app with React Native
- Social sharing of achievements
- Team collaboration features
- Advanced AI with custom models
- Data export/backup features
- Calendar integration
- Notifications system
- Advanced reporting

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues and questions:
1. Check existing issues
2. Create a new GitHub issue
3. Include detailed reproduction steps

## Acknowledgments

Built with:
- Next.js
- Supabase
- OpenAI
- shadcn/ui
- Framer Motion
- Recharts
- Tailwind CSS

---

**LifeOS AI** - Your personal AI assistant for life optimization.
