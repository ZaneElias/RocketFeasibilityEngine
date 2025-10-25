# Rocket Feasibility Analysis Platform - Design Guidelines

## Design Approach

**Selected System:** Material Design with Linear-inspired precision aesthetics

**Justification:** This application requires a data-intensive, professional interface with complex interactions (interactive maps, multi-step workflows, analytical dashboards). Material Design's structured approach to information hierarchy combined with Linear's clean, technical aesthetic creates the perfect foundation for a precision engineering tool.

**Core Design Principles:**
- Clarity over decoration: Every element serves the analysis workflow
- Precision-first: Visual design reinforces accuracy and technical credibility  
- Progressive disclosure: Complex data revealed systematically
- Trust through transparency: Clear data sources and validation states

---

## Typography System

**Font Families:**
- Primary (UI): Inter (Google Fonts) - all interface text, navigation, labels
- Monospace (Data): JetBrains Mono - coordinates, numerical data, technical specifications

**Hierarchy:**
- Hero/Section Titles: text-4xl md:text-5xl font-bold tracking-tight
- Page Headers: text-3xl font-semibold
- Section Headers: text-2xl font-semibold
- Card Titles: text-xl font-medium
- Body Text: text-base font-normal leading-relaxed
- Labels/Meta: text-sm font-medium uppercase tracking-wide
- Technical Data: text-sm md:text-base font-mono
- Captions/Helper: text-xs

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Standard Application:**
- Component padding: p-4 to p-8
- Section spacing: space-y-8 or space-y-12
- Card gaps: gap-6
- Form field spacing: space-y-4
- Button padding: px-6 py-3 (regular), px-4 py-2 (compact)

**Grid System:**
- Main container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Two-column layouts: grid grid-cols-1 lg:grid-cols-2 gap-8
- Dashboard cards: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Map + sidebar: 60/40 split on desktop (lg:grid-cols-5 with map taking col-span-3)

---

## Component Library

### Navigation
**Top Navigation Bar:**
- Fixed position with backdrop blur effect
- Height: h-16
- Logo left, primary navigation center, user actions right
- Navigation links: font-medium text-sm with underline-offset-4 decoration-2 on active state

### Workflow Components

**Step Indicator:**
- Horizontal stepper showing: Rocket Type → Location → Analysis → Results
- Each step: circle indicator + label, connected by progress lines
- Current step emphasized with larger size and solid fill
- Completed steps show checkmark icon

**Rocket Type Selection Cards:**
- Large cards (min-h-48) in 2-column grid
- Icon at top (h-16 w-16)
- Card title (text-2xl font-semibold)
- Description text (text-base)
- Subtle border with hover elevation: hover:shadow-lg transition-shadow

**Sub-selection Buttons (Hobby/Solo/Team):**
- Pill-shaped toggle buttons
- Group in flex gap-3 layout
- Each button: px-6 py-3 rounded-full border-2
- Active state: filled background, border same as fill

### Map Interface

**Interactive Map Container:**
- Full-width container with rounded-lg overflow-hidden
- Minimum height: min-h-[500px] md:min-h-[600px]
- Integrated zoom controls (top-right corner, absolute positioning)
- Location search bar (top-left, absolute positioning with backdrop-blur)

**Location Search Bar:**
- Width: w-full md:w-96
- Rounded-lg with shadow-lg
- Input field with search icon prefix
- Autocomplete dropdown below: max-h-64 overflow-y-auto

**Location Pin/Marker:**
- Custom marker with pulsing animation for selected location
- Info popup showing: Coordinates (monospace), Detected City/Country, Precision radius indicator

**Sidebar Location Details:**
- Fixed width: w-80 on desktop
- Displays: Selected coordinates, Reverse geocoded address, Precision level indicator
- "Confirm Location" primary button at bottom

### Analysis Dashboard

**Analysis Categories Grid:**
- 6 main category cards in grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Each card: p-6 rounded-lg border shadow-sm
- Card structure: Icon header (h-10 w-10) → Title (text-lg font-semibold) → Status indicator → Details list

**Feasibility Score Display:**
- Large circular progress indicator showing overall score (h-48 w-48)
- Percentage displayed in center (text-4xl font-bold)
- Status text below (FEASIBLE / CAUTION / NOT RECOMMENDED)

**Warning/Alert Cards:**
- Full-width alert banners for critical issues
- Icon left (h-6 w-6), message text, action buttons right
- Border-l-4 for severity indication
- Padding: p-4, rounded-md

**Data Tables:**
- Striped rows for readability (alternate row background)
- Header row: font-semibold text-sm uppercase tracking-wide py-3
- Data rows: py-4 px-6
- Monospace font for numerical data columns
- Mobile: Cards instead of tables (stack-on-mobile pattern)

### Form Elements

**Input Fields:**
- Height: h-12
- Rounded: rounded-lg
- Border: border-2
- Padding: px-4
- Focus state: ring-2 ring-offset-2

**Select Dropdowns:**
- Same styling as input fields
- Chevron icon right-aligned
- Dropdown menu: shadow-xl rounded-lg mt-2

**Buttons:**
**Primary Action:**
- px-6 py-3 rounded-lg font-semibold
- Transform: hover:scale-105 active:scale-95 transition-transform
- Shadow: shadow-md hover:shadow-lg

**Secondary Action:**
- px-6 py-3 rounded-lg font-semibold border-2
- No fill background

**Icon Buttons:**
- p-3 rounded-full
- Icon size: h-5 w-5

**Buttons over Images (Map Controls):**
- Backdrop blur: backdrop-blur-md
- Semi-transparent background
- No hover state color changes (inherent button states handle interaction)

### Cards & Containers

**Standard Card:**
- Rounded: rounded-lg
- Border: border
- Shadow: shadow-sm hover:shadow-md transition-shadow
- Padding: p-6

**Dashboard Metric Card:**
- Min height: min-h-32
- Icon + large number display (text-3xl font-bold) + label below
- Trend indicator (up/down arrow + percentage)

**Collapsible Detail Sections:**
- Accordion pattern for detailed data
- Header: flex justify-between items-center p-4 cursor-pointer
- Chevron icon rotates on expand
- Content: p-6 border-t

### Icons
**Library:** Heroicons (via CDN)
- Navigation icons: h-5 w-5
- Feature icons: h-6 w-6  
- Hero section icons: h-16 w-16
- Status indicators: h-4 w-4

---

## Animations

**Minimal & Purposeful:**
- Page transitions: fade-in only (opacity 0 to 1, duration-300)
- Card hovers: shadow elevation change (transition-shadow)
- Button interactions: scale transforms (duration-150)
- Map marker: subtle pulse animation (animate-pulse) on placement
- Loading states: Spinner for async operations

**No scroll animations, no parallax, no unnecessary motion.**

---

## Images

**Hero Section:**
Large background image showing rocket launch or technical blueprint overlay with semi-transparent dark overlay for text readability. Image dimensions: 16:9 aspect ratio, full viewport width, height: min-h-[400px] md:min-h-[500px].

**Placeholder Images:**
- Rocket type cards: Technical illustrations of model rockets vs industrial rockets
- Analysis results: Icon-based graphics (no photos needed here)
- Empty states: Simple illustrations for "no location selected" or "no results"

---

## Accessibility

**Form Inputs:**
- All inputs have associated labels (text-sm font-medium mb-2)
- Required fields marked with asterisk
- Error states show beneath field with text-sm
- Aria-labels for icon-only buttons

**Keyboard Navigation:**
- Tab order follows logical flow: rocket selection → map search → map controls → confirm → analysis sections
- Focus indicators: ring-2 visible on all interactive elements
- Map controls accessible via keyboard (arrow keys for pan, +/- for zoom)

**Color Independence:**
- All status indicators combine icon + text (not just color)
- Validation states use border + icon + message
- Feasibility scores use text labels in addition to visual indicators