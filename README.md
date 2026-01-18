# Health Tracker 9000

Health Tracker 9000 is a comprehensive web application for tracking personal health data, including nutritional intake, supplements, and health scores. It is designed with a focus on privacy and actionable insights, with specific considerations for conditions like gout.

## Features

- **Nutritional Tracking**: Log meals and track macro/micronutrient intake.
- **Supplement Management**: Track daily supplement compliance.
- **Health Scoring**: Get a daily health score based on adherence to nutritional targets.
- **Advanced Analytics**: Visualize trends in health scores, weight, and caloric intake.
- **Recommendations**: Receive personalized suggestions for improving health outcomes.
- **Data Privacy**: All data is stored locally in a SQLite database.
- **Data Safety**: Built-in backup and restore system for your health database.

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

## Data Management

### Backups

Create a backup of your current database:

```bash
npm run db:backup
```

Backups are stored in the `/backups` directory with a timestamp.

### Restore

To restore a database from a backup:

1. List available backups:
   ```bash
   npm run db:restore
   ```
2. Restore a specific backup file:
   ```bash
   npm run db:restore health-YYYY-MM-DDTHH-mm-ss-msZ.db
   ```
   _Note: Providing a filename is required to perform the restore._

## Architecture

- `src/app`: Page components and API routes.
- `src/components`: Reusable UI components.
- `src/lib/database`: Database schema, connection, and repositories.
- `src/lib/types`: TypeScript interfaces and types.
- `src/lib/utils`: Business logic and utility functions.
- `src/hooks`: Custom React hooks for data fetching and state.
