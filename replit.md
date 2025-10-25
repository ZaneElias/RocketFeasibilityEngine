# Rocket Feasibility Analyzer

## Overview
A comprehensive web application for analyzing the feasibility of rocket launches from any location worldwide. The application provides detailed assessments across six key dimensions: resources, legality, geography, geopolitics, timing, and practicality.

## Features
- **Rocket Type Selection**: Choose between model rockets (hobby/solo/team with safety levels) or industrial rockets
- **Interactive Map**: Precision location selection using Leaflet with click-to-select and search functionality
- **Zone Validation**: Automatic detection of restricted areas (airports, schools, military bases, urban zones)
- **6-Dimensional Analysis**:
  1. Resources & Availability (materials, expertise, facilities)
  2. Government & Legality (permits, regulations, restrictions)
  3. Geographical Status (terrain, weather, accessibility)
  4. Geopolitical Status (stability, cooperation, risks)
  5. Best Time & Seasonality (optimal launch windows)
  6. Practicality Assessment (cost, timeline, success probability)
- **Comprehensive Results**: Detailed scoring with overall feasibility rating and recommendations

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Map**: Leaflet.js with OpenStreetMap tiles
- **Backend**: Express.js, Node.js
- **Geocoding**: OpenStreetMap Nominatim API
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with custom design tokens

## Project Structure
```
├── client/
│   └── src/
│       ├── components/
│       │   ├── ThemeToggle.tsx
│       │   ├── StepIndicator.tsx
│       │   ├── RocketTypeSelector.tsx
│       │   ├── LocationPicker.tsx
│       │   └── AnalysisResults.tsx
│       ├── pages/
│       │   └── Home.tsx
│       └── App.tsx
├── server/
│   ├── routes.ts
│   └── storage.ts
├── shared/
│   └── schema.ts
└── design_guidelines.md
```

## Data Model
The application uses Zod schemas for type-safe data validation:

- **RocketConfig**: Category (model/industrial), model type, safety level
- **Location**: Latitude, longitude, country, city, display name
- **ZoneValidation**: Safety status, warnings, severity level
- **AnalysisResult**: Complete assessment with scores across all 6 dimensions
- **FeasibilityScore**: 0-100 score with status (feasible/caution/not_recommended)

## API Endpoints
- `POST /api/analyze`: Analyze a location for rocket launch feasibility
- `POST /api/validate-zone`: Validate location against restricted zones
- `POST /api/reverse-geocode`: Get location details from coordinates

## User Flow
1. Select rocket type (model with sub-options or industrial)
2. Choose location on interactive map (search or click)
3. System validates zone safety automatically
4. Click "Analyze This Location" to start comprehensive analysis
5. View detailed results with scores across all 6 categories
6. Export report or start new analysis

## Design System
- **Colors**: Primary blue (#4A90E2), with semantic tokens for success/warning/danger
- **Typography**: Inter for UI text, JetBrains Mono for technical data
- **Components**: Shadcn UI library with custom theming
- **Dark Mode**: Full support with localStorage persistence
- **Spacing**: Consistent 4/8/12/16/24px scale
- **Animations**: Subtle transitions for better UX (fade-ins, progress indicators)

## Recent Changes
- 2025-10-25: Initial implementation with all core features
- Complete schema definition for all data types
- All frontend components built with responsive design
- Interactive map with Leaflet integration
- Step-by-step workflow with progress tracking
- Dark mode theme toggle
- Implemented comprehensive zone validation (airports, schools, military bases)
- Added backend reverse geocoding API endpoint
- Fixed frontend to use backend geocoding instead of direct API calls
- Added missing data-testid attributes for automated testing
- Improved severity detection for critical zone violations

## Development
- The app uses in-memory storage (MemStorage) by default
- All API routes are prefixed with `/api`
- Frontend runs on Vite dev server
- Backend is Express.js serving both API and static files
- Hot reload enabled for development

## Next Steps
- Implement backend analysis engine
- Add real zone validation logic
- Connect frontend to backend APIs
- Add loading states and error handling
- Test complete user journey
