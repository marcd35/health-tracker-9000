# API Documentation

This document outlines the API endpoints available in the Health Tracker 9000 application.

## Base URL

All API routes are prefixed with `/api`.

## Endpoints

### Foods

- **GET** `/api/foods/search?q={query}`
  - Search for foods by name.
  - Returns a list of matching foods with nutritional info.

### Meals

- **GET** `/api/meals?date={date}`
  - Get meal logs for a specific date.
- **POST** `/api/meals`
  - Log a new meal.
  - Body: `{ date, mealType, foods: [{ foodId, amount }] }`

### Supplements

- **GET** `/api/supplements`
  - Get list of all configured supplements.
- **POST** `/api/supplements/log`
  - Log supplement intake.
  - Body: `{ date, supplementId, taken: boolean }`

### Profile

- **GET** `/api/profile`
  - Retrieve the current user's profile.
- **PUT** `/api/profile`
  - Update user profile details (weight, goals, etc).

### Daily Summary

- **GET** `/api/daily-summary?date={date}`
  - Get the health score and summary for a specific date.

### Analytics

- **GET** `/api/analytics`
  - Retrieve historical data for charts and trends.
