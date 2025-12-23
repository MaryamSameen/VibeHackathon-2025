# 🎯 FlashQuiz+ - Instant Document-to-Quiz Platform

![FlashQuiz+ Banner](https://img.shields.io/badge/FlashQuiz+-AI%20Powered%20Learning-purple?style=for-the-badge&logo=sparkles)
![Next.js](https://img.shields.io/badge/Next.js%2014-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Gemini](https://img.shields.io/badge/Gemini%202.5-Powered-blue?style=flat-square&logo=google)

> **Transform your documents into interactive flashcards and quizzes with AI-powered learning.**

FlashQuiz+ is a modern, hackathon-ready web application that leverages Google's Gemini 2.5 AI to automatically generate study materials from uploaded documents. Simply upload a PDF, DOCX, or TXT file, and instantly get personalized flashcards or multiple-choice quizzes.

---

## ✨ Features

### 🔐 Authentication
- Modern, sleek sign-in/sign-up UI
- Email + password authentication
- Persistent login with localStorage
- Protected routes

### 📤 Document Upload
- Drag & drop file upload
- Support for PDF, DOCX, and TXT files
- File preview with name and size
- Progress indicators

### 🤖 AI-Powered Generation
- **Gemini 2.5 Flash** integration via Google AI SDK
- Real text extraction from PDF, DOCX, and TXT files
- Smart chunking for large documents
- Structured JSON output for flashcards and quizzes
- Server-side API route for secure AI calls
- Fallback to mock data for offline testing

### 📚 Interactive Flashcards
- Beautiful flip-card animations
- Progress tracking
- Shuffle functionality
- Card navigation (previous/next)

### ✅ Quiz System
- Multiple choice questions with 4 options
- Real-time answer selection
- Question navigation
- Submit and lock answers
- Comprehensive results page

### 📊 Results & Analytics
- Score summary with grade
- Correct/incorrect answer highlighting
- Detailed question review
- Explanations for each answer

### 📈 Progress Tracking
- Performance charts (Recharts)
- Score trends over time
- Weekly activity visualization
- Score distribution analysis

### 👤 User Profile
- Edit name and email
- View account statistics
- Session management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone/Navigate to the project**
```bash
cd flashquiz-plus
```

2. **Install dependencies**
```bash
npm install
```

3. **Run the development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:3000
```

### Demo Credentials
- **Email:** `demo@flashquiz.com`
- **Password:** `demo123`

---

## 📁 Project Structure

```
flashquiz-plus/
├── app/
│   ├── api/
│   │   ├── extract-text/     # Document text extraction API
│   │   ├── generate/         # Legacy generation API
│   │   └── generate-ai/      # Gemini AI generation API
│   ├── auth/
│   │   ├── signin/           # Sign in page
│   │   └── signup/           # Sign up page
│   ├── dashboard/            # Main dashboard
│   ├── upload/               # Document upload
│   ├── flashcards/           # Flashcard study mode
│   ├── quiz/                 # Quiz taking mode
│   ├── results/              # Quiz results
│   ├── progress/             # Progress analytics
│   ├── profile/              # User profile
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   ├── Navbar.tsx            # Navigation component
│   └── ui/
│       └── index.tsx         # Reusable UI components
├── context/
│   └── AppContext.tsx        # Global state management
├── lib/
│   ├── ai.ts                 # AI client (calls /api/generate-ai)
│   └── extractText.ts        # Document parsing utilities
├── types/
│   └── index.ts              # TypeScript type definitions
├── utils/
│   └── helpers.ts            # Utility functions
└── README.md
```

---

## 🎨 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | React Context |
| AI | Google Gemini 2.5 Flash |
| Charts | Recharts |
| Icons | Lucide React |
| Document Parsing | pdf-parse, mammoth |

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Get your free Gemini API key at: https://aistudio.google.com/apikey

---

## 🎯 Usage Guide

### 1. Sign Up / Sign In
Create an account or use the demo credentials to log in.

### 2. Upload Document
- Navigate to "Upload" from the dashboard
- Drag & drop or click to select a PDF, DOCX, or TXT file
- Choose the number of items to generate (5-20)

### 3. Generate Content
- Click "Generate Flashcards" for study cards
- Click "Generate Quiz" for MCQ questions
- Toggle "Use demo data" for offline testing

### 4. Study Flashcards
- Click cards to flip between question and answer
- Use navigation buttons or click to progress
- Shuffle cards for variety

### 5. Take Quiz
- Answer all multiple choice questions
- Navigate between questions using pills or buttons
- Submit when all questions are answered

### 6. Review Results
- See your score and grade
- Review each question with correct/incorrect highlighting
- Read explanations for learning

### 7. Track Progress
- View performance trends over time
- Analyze your score distribution
- Monitor weekly activity

---

## 🎨 UI Features

- **Glassmorphism design** with frosted glass effects
- **Gradient backgrounds** and accent colors
- **Smooth animations** and transitions
- **Mobile-responsive** layouts
- **Dark theme** optimized for focus
- **Custom scrollbars** and form elements

---

## 🧪 Demo Mode

For hackathon demos without API calls:
1. Upload any document
2. Check "Use demo data (faster, no API call)"
3. Generate content instantly with pre-built samples

---

## 📱 Responsive Design

FlashQuiz+ is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktops

---

## 🏆 Hackathon Highlights

- ⚡ **Fast Setup** - Get running in under 2 minutes
- 🎨 **Polished UI** - Judge-ready modern interface
- 🤖 **Real AI** - Google Gemini 2.5 Flash integration
- 📄 **Real Extraction** - Actual PDF/DOCX text parsing
- 📊 **Full Analytics** - Professional charts and stats
- 🔄 **Demo Mode** - Works offline with mock data
- 📱 **Responsive** - Perfect on any device

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📄 License

MIT License - Built with ❤️ for Hackathon 2024

---

## 🙏 Acknowledgments

- Google for Gemini AI
- Vercel for Next.js
- The open-source community

---

**Made for VibeHackathon 2025** 🚀
