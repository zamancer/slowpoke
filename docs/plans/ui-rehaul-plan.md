# UI/UX Rehaul Plan

## Screen Priority Ranking

Ranked by user impact, interaction complexity, and how many downstream components each screen establishes for reuse.

### 1. Quiz Session (`/quizzes/$quizId`)

Core learning experience where users spend the most time. It's the most interaction-heavy screen (option selection, justification input, AI feedback streaming, navigation) and currently the most bloated component (QuizContainer exceeds 600 lines). Rehauling it first forces you to define patterns for feedback states, form inputs, progress indicators, and cards that cascade to every other screen.

### 2. Home (`/`)

First impression and navigation hub. Defines the visual identity (spacing, card style, typography hierarchy) that sets the tone for everything else. The streak calendar and action cards are small enough to iterate on quickly, giving you a polished reference point early.

### 3. Quizzes & Flashcards Browse (`/quizzes`, `/flashcards`)

These two screens share almost identical structure (content grid with metadata badges, difficulty tags, counts). Rehauling them together lets you consolidate the duplicated badge color logic and card layout into shared components. High traffic since every session starts here.

### 4. Quiz Results (end of quiz flow)

Depends heavily on patterns defined during the Quiz Session rehaul (answer cards, verdict badges, color-coded feedback). Mostly a read-only summary, so the component work is lighter once the session screen is done.

### 5. Flashcard Study (`/flashcards/$groupId`)

Self-contained interaction model (flip cards + progress bar). Less complex than quizzes but benefits from the card and progress components already built in earlier screens.

### 6. Quiz History & Flashcard History (`/quizzes/history`, `/flashcards/history`)

Both are list views with date formatting, score display, and action buttons. Nearly identical layout pattern, so they can share a session history list component. Lower priority because they're secondary flows.

### 7. Quiz Session Review (`/quizzes/history/$sessionId`)

Read-only detail view reusing answer card components from Quiz Results. Last in priority since it's a deep-link screen with low direct traffic and depends entirely on components built in earlier screens.

---

## Design System - Atomic Design

### Atoms

Smallest, indivisible UI elements. Each has a single responsibility.

| Component | Description |
|---|---|
| **Button** | Existing shadcn button; extend with consistent icon-button and loading variants |
| **Badge** | Difficulty (easy/medium/hard), type (multiple-choice/true-false), status (pass/fail), and tag badges with centralized color maps |
| **Icon** | Wrapper around Lucide icons with standardized sizes (sm/md/lg) |
| **Input** | Existing shadcn input |
| **Textarea** | Existing shadcn textarea |
| **Label** | Existing shadcn label |
| **Switch** | Existing shadcn switch |
| **Select** | Existing shadcn select |
| **Skeleton** | Loading placeholder with pulse animation; line, circle, and rect variants |
| **ProgressBar** | Horizontal fill bar with percentage, color, and size props |
| **Avatar** | User avatar with fallback initials (replace scattered Clerk avatar usage) |
| **Divider** | Horizontal/vertical separator line |
| **Tooltip** | Small contextual hover hint using Radix UI |

### Molecules

Combinations of atoms that form a distinct functional unit.

| Component | Atoms Used | Description |
|---|---|---|
| **Card** | Divider | Reusable container with header, body, and footer slots; replaces all inline `rounded-lg border bg-card` patterns |
| **BadgeGroup** | Badge | Row of badges (difficulty + type + tags) used across quiz and flashcard lists |
| **FormField** | Label, Input/Textarea, error text | Field wrapper binding label, input, and validation error; replaces per-form inline wiring |
| **ScorePill** | Badge | Color-coded score display (green >= 80%, yellow >= 50%, red < 50%) |
| **OptionButton** | Button | Lettered quiz option (A/B/C/D) with selected, correct, and incorrect states |
| **StatItem** | Icon, text | Key-value stat display (e.g., "12 questions", "Medium difficulty") |
| **NavLink** | Icon, text | Sidebar/header navigation item with active state |
| **EmptyState** | Icon, text, Button | Placeholder for empty lists with call-to-action |

### Organisms

Complex, self-contained sections composed of molecules.

| Component | Molecules Used | Description |
|---|---|---|
| **ContentGrid** | Card, BadgeGroup, StatItem | Responsive grid of content cards for quiz and flashcard browse screens; replaces QuizList and FlashcardGroupList |
| **QuestionCard** | Card, OptionButton, FormField | Single quiz question with options, justification input, and evaluation feedback |
| **AnswerReviewCard** | Card, ScorePill, BadgeGroup | Read-only question review showing user answer vs correct answer with verdict |
| **AIFeedbackPanel** | Card, Badge, Skeleton | Streaming AI verification display with pending/streaming/complete/error states |
| **SessionHistoryList** | Card, ScorePill, ProgressBar, Button | Chronological list of past sessions; shared between quiz and flashcard history |
| **FlipCard** | Card | Front/back card with flip animation and revealed state |
| **ActivityCalendar** | Skeleton | 14-day streak grid with day labels and activity indicators |
| **ResumePrompt** | Card, Button | Dialog prompting user to resume or restart a session |
| **Header** | NavLink, Avatar | App header with hamburger menu, navigation links, and user controls |

### Templates

Page-level layout shells that define content zones without specific data.

| Template | Description |
|---|---|
| **BrowseLayout** | Page title + description + ContentGrid; used by `/quizzes` and `/flashcards` |
| **SessionLayout** | Top progress bar + main content area + bottom navigation; used by quiz and flashcard sessions |
| **HistoryLayout** | Page title + filter controls + SessionHistoryList; used by both history screens |
| **ReviewLayout** | Session header (title, date, score) + scrollable AnswerReviewCard list |
| **DashboardLayout** | Welcome section + streak display + action card grid; used by home |
