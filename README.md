# Health Tracker 9000

Health Tracker 9000 is a comprehensive web application for tracking personal health data, including nutritional intake, supplements, and health scores. It is designed with a focus on privacy and actionable insights, with specific considerations for conditions like gout.

## Features

- **Nutritional Tracking**: Log meals and track macro/micronutrient intake.
- **Supplement Management**: Track daily supplement compliance.
- **Health Scoring**: Get a daily health score based on adherence to nutritional targets.
- **Recommendations**: Receive personalized suggestions for improving health outcomes.
- **Data Privacy**: All data is stored locally in a SQLite database.

## tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: SQLite (better-sqlite3)
- **State Management**: Zustand
- **Validation**: Zod
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with mock data (optional):
   ```bash
   npm run seed
   ```

### Testing

Run the test suite:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

- `src/app`: Page components and API routes.
- `src/components`: Reusable UI components.
- `src/lib/database`: Database schema, connection, and repositories.
- `src/lib/types`: TypeScript interfaces and types.
- `src/lib/utils`: Business logic and utility functions.
- `src/hooks`: Custom React hooks for data fetching and state.
