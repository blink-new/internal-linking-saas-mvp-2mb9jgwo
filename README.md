# Internal Linking SaaS MVP

A production-ready SaaS platform for managing internal linking jobs on Google Doc articles. Users can create projects, add articles as jobs, track real-time status updates, and view anchor diffs and metrics upon completion.

## 🚀 Features

- **Google OAuth Authentication** via Supabase
- **Project Management** - Create and manage multiple projects
- **Article Processing** - Add Google Docs articles as jobs
- **Real-time Updates** - Live status tracking with WebSocket connections
- **HTML Diff Viewer** - Compare before/after content with anchor additions
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Support** - System-aware theme switching
- **Animated Transitions** - Smooth framer-motion animations

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS, shadcn/ui components
- **Animations**: Framer Motion
- **Backend**: Supabase (Auth, Database, Realtime)
- **Data Fetching**: SWR with real-time updates
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router DOM

## 📦 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase project with Google OAuth configured

### Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  site_url TEXT NOT NULL,
  cornerstone_sheet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  article_doc TEXT NOT NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'done', 'error')),
  anchors_added INTEGER DEFAULT 0,
  before_html TEXT,
  after_html TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view jobs for own projects" ON jobs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = jobs.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert jobs for own projects" ON jobs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = jobs.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update jobs for own projects" ON jobs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = jobs.project_id 
      AND projects.user_id = auth.uid()
    )
  );
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # Navigation header
│   ├── ProjectModal.tsx # Project creation modal
│   ├── JobsTable.tsx   # Jobs listing table
│   └── ...
├── contexts/           # React contexts
│   └── AuthProvider.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   └── useRealtimeJob.ts # Real-time job updates
├── lib/                # Utilities and configuration
│   ├── supabaseClient.ts # Supabase client setup
│   ├── validators.ts   # Zod schemas
│   └── formatters.ts   # Date/number formatting
├── pages/              # Route components
│   ├── DashboardPage.tsx
│   ├── ProjectPage.tsx
│   └── SettingsPage.tsx
└── App.tsx             # Main app component
```

## 🔧 Key Components

### Authentication
- Google OAuth via Supabase Auth
- Protected routes with automatic redirects
- User session management with real-time updates

### Project Management
- Create projects with site URL and optional cornerstone sheet
- View project details and metrics
- Manage multiple projects per user

### Job Processing
- Add Google Docs articles as processing jobs
- Real-time status updates (queued → processing → done/error)
- View anchor additions and HTML diffs
- Error handling and retry mechanisms

### Real-time Features
- WebSocket connections for live updates
- SWR cache invalidation on data changes
- Optimistic UI updates

## 🎨 Design System

- **Primary Color**: Blue (#2563eb)
- **Accent Color**: Green (#10b981)
- **Typography**: Inter font family
- **Spacing**: Generous padding (≥16px)
- **Borders**: 2xl rounded corners
- **Shadows**: Soft, subtle shadows
- **Dark Mode**: First-class support

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Deployment

The app is configured for deployment on Vercel, Netlify, or any static hosting provider:

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔮 Future Enhancements

- Team collaboration features
- API webhooks for job completion
- Advanced job configuration options
- Bulk article processing
- Analytics and reporting dashboard
- Integration with popular CMS platforms

## 📄 License

MIT License - see LICENSE file for details.