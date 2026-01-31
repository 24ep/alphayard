# Bondarys Web Application

Ultra-clean and premium web application for Circle management with deep planning and socializing capabilities, featuring a macOS-inspired design system.

## Features

### Core Features (Mobile Parity)
- **Circle Management**: Create and manage Circle groups
- **Social Feed**: Posts, comments, and reactions
- **Calendar**: Basic calendar with events
- **Tasks**: Task management and tracking
- **Gallery**: Photo sharing and organization
- **Notes**: Rich text notes
- **Chat**: Real-time messaging
- **Safety**: Location tracking and emergency contacts
- **Storage**: File management
- **AI Assistant**: Chat-based assistance

### Advanced Features (Web-Only)
- **Advanced Calendar**: Multi-view (Month/Week/Day/Agenda/Timeline), recurring events, time zones
- **Analytics Dashboard**: Interactive charts, Circle insights, social metrics
- **Advanced Social**: Groups, events, forums, polls, social graphs
- **Project Planning**: Gantt charts, timelines, task dependencies, templates

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS** with custom macOS-inspired design tokens
- **Supabase** for authentication
- **Socket.io** for real-time synchronization
- **Recharts** for analytics visualizations
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

The application will be available at `http://localhost:3002`

### Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Project Structure

```
web/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── auth/         # Authentication pages
│   │   └── dashboard/    # Dashboard and feature pages
│   ├── components/       # React components
│   │   ├── ui/           # UI components (Button, Card, etc.)
│   │   └── layout/       # Layout components (Sidebar, Header)
│   ├── contexts/         # React contexts (Auth, Socket)
│   ├── design-system/    # Design tokens
│   └── lib/             # Utilities and API client
├── public/              # Static assets
└── package.json
```

## Design System

The application uses a macOS-inspired design system with:

- **Frosted glass panels** with backdrop blur
- **SF Pro fonts** (with system fallbacks)
- **Soft shadows** and smooth animations
- **Blue focus states** for interactive elements
- **Refined spacing** and typography

## Real-time Synchronization

The web app syncs with the mobile app in real-time using Socket.io. Changes made on either platform are instantly reflected on the other.

## Offline Support

A service worker provides basic offline support and background sync capabilities.

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## License

MIT


