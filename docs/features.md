# Slowpoke - Features & Screens

## Home (`/`)

Dashboard and entry point. Shows a sign-in prompt for guests or an activity streak calendar (14-day view) with a streak counter for authenticated users. Provides quick-access cards to Quizzes and Flashcards.

## Quizzes (`/quizzes`)

Browse available quiz topics. Each quiz displays its title, description, difficulty, tags, and question count.

## Quiz Session (`/quizzes/$quizId`)

Interactive multiple-choice quiz interface. Questions are shuffled per session and presented with four options (A-D). Features an optional AI verification mode where users must justify their answers in writing; the AI evaluates whether the justification demonstrates understanding and returns a PASS/FAIL verdict. Provides immediate feedback with correct answers and expert explanations. Sessions are persisted so users can resume incomplete attempts.

## Quiz Results (end of quiz flow)

Score summary with color-coded feedback and motivational messages. Includes a detailed answer-by-answer review showing user responses, correct answers, justifications, and AI verdicts when applicable.

## Quiz History (`/quizzes/history`)

Chronological list of completed quiz sessions. Each entry shows the quiz title, date, score, and verification status. Users can view details or retry any past quiz.

## Quiz Session Review (`/quizzes/history/$sessionId`)

Deep-dive review of a single past quiz attempt. Displays every question with the user's answer, the correct answer, justification text, and AI feedback, all color-coded by correctness.

## Flashcards (`/flashcards`)

Browse available flashcard decks. Each group shows its title, description, difficulty, tags, and card count.

## Flashcard Study (`/flashcards/$groupId`)

Flip-card study interface in a responsive grid layout. Cards reveal their answer on click. A progress bar tracks how many cards have been revealed. Sessions are persisted for authenticated users so progress carries over between visits.

## Flashcard History (`/flashcards/history`)

Chronological list of flashcard study sessions. Shows progress (cards revealed out of total) with a visual progress bar. Users can continue where they left off or restart a deck.
