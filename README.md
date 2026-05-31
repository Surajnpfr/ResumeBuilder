# ATS Resume Builder

ATS Resume Builder is a Next.js app for building ATS-friendly resumes with a live preview and one-click PDF/PNG export. The MVP runs fully on the client with no auth or backend.

## Features
- Responsive two-column builder with mobile-friendly layout
- Live resume preview (A4 layout)
- Export to PDF and PNG
- Sample data prefilled for quick start

## Tech Stack
- Next.js (App Router), React, TypeScript
- Tailwind CSS
- React Hook Form
- html-to-image + jsPDF for export

## Getting Started
```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production Build
```bash
npm run build
npm run start
```

## Project Structure
```
app/            # App Router pages and layout
src/data/       # Mock resume data
src/lib/        # Export utilities and helpers
src/types/      # Resume types
```

## Export Notes
PDF/PNG export uses the hidden A4 preview node to preserve formatting. If export fails, ensure the preview has fully rendered before clicking export.

## Website Demo
(./assets/WebsiteDemo.png)
