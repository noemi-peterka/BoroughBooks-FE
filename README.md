# Borough Books 📚

**Borough Books** is a community book-sharing mobile app that helps readers lend and borrow books from friends while keeping track of their personal libraries.

Instead of letting books gather dust on shelves, Borough Books makes it easy to **share books within your community**, discover what your friends are reading, and track loans so nothing gets lost.

Think of it as **a social network for your bookshelf.**

---

# Demo 🎥

Watch the demo here:

👉 https://drive.google.com/file/d/1RN2zuiqxOQrbBdTBXWxmz7Pi7WbcmN4w/view?usp=sharing

The demo walks through the full user flow:

1. Scanning a book barcode  
2. Adding it to your personal library  
3. Browsing a friend's collection  
4. Requesting to borrow a book  
5. Messaging to arrange pickup  
6. Tracking borrowed and lent books  

---

# Features ✨

## 📷 Barcode Book Scanner
Users can scan a book's ISBN barcode using their phone camera. Book data (title, author, description, cover image) is automatically fetched using the Google Books API.

## 📚 Personal Library
Users can maintain a digital catalogue of books they own and easily manage their collection.

## 👥 Friends System
Users can add friends and browse their libraries to discover new books.

## 🔁 Borrowing & Lending
Users can request books from friends and track:
- Books they've lent out
- Books they've borrowed
- Who currently has each book

## 💬 Real-time Messaging
Built-in chat allows users to coordinate book exchanges without leaving the app. Messages update instantly using Supabase Realtime.

---

# Tech Stack 🛠

## Frontend
- React Native
- Expo
- TypeScript
- Expo Camera (barcode scanning)

## Backend
- Node.js
- Express
- PostgreSQL
- Supabase (database + realtime)
- REST API architecture

Backend Repository:

👉 https://github.com/NGalletly/BoroughBooks-BE

## Testing
- Jest
- Supertest
- Test Driven Development (TDD)

## Deployment
- Backend hosted on Render
- PostgreSQL database hosted on Supabase

---

# Architecture Overview

The system consists of three main components:

## Mobile Client
A React Native mobile application built with Expo that handles the user interface, book scanning, library management, and messaging.

## API Server
A Node.js + Express REST API responsible for managing:
- Users
- Books
- Friend relationships
- Loans
- Conversations
- Messages

## Database
A PostgreSQL database hosted on Supabase with the following tables:

- `users`
- `books`
- `users_books`
- `loans`
- `wishlist`
- `conversations`
- `messages`
- `user_relationships`

## Realtime Messaging
Supabase Realtime (WebSockets) powers the live messaging feature, allowing messages to appear instantly without refreshing.

---

# Running the Project Locally

## 1. Clone the repository

```bash
git clone https://github.com/YOUR-FRONTEND-REPO
cd borough-books
```

## 2. Install dependencies

```bash
npm install
```

## 3. Create environment variables

Create a `.env` file in the project root.

```
EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY=YOUR_GOOGLE_API_KEY
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
```

The Google Books API key is used when scanning a barcode to fetch book details from the Google Books API.

---

## 4. Start the app

```bash
npx expo start
```

You can run the application using:

- iOS Simulator
- Android Emulator
- Expo Go mobile app

---

# Messaging Setup (Supabase Realtime)

To enable messaging functionality, ensure the following setup steps are completed in your Supabase project.

### Install Supabase client

```bash
npm install @supabase/supabase-js
```

### Configure Supabase environment variables

Add the following values to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
```

### Enable Realtime for messaging tables

1. Open your **Supabase Dashboard**
2. Go to **Database → Publications**
3. Select **supabase_realtime**
4. Enable replication for:
   - `messages`
   - `conversations`

This allows Supabase to broadcast database changes to connected clients.

### Disable Row Level Security

For this project prototype, Row Level Security must be disabled.

1. Navigate to **Database → Tables**
2. Select the `messages` table
3. Click **Edit**
4. Ensure:
   - **Enable Row Level Security (RLS)** is **OFF**
   - **Realtime** is **ON**

Repeat the same process for the `conversations` table.

---

# Backend Setup

The backend API is maintained in a separate repository.

👉 https://github.com/NGalletly/BoroughBooks-BE

Follow the instructions in that repository to:

- create local databases
- seed development data
- run the server locally


# Future Improvements 🚀

With more development time, we would add:

## 📍 Map Integration
Allow users to see approximate friend locations to simplify book exchanges.

## 🧠 Book Recommendations
Personalised book suggestions based on:
- reading history
- friends' libraries
- new releases

## 🔔 Borrowing Reminders
Push notifications reminding users when books have been borrowed for extended periods.

## ⭐ Borrower Reputation
A rating or borrowing history system to help users identify reliable borrowers.

## 👥 Book Clubs
Community groups for readers to discuss books and share recommendations.

---

# Team 👩‍💻👨‍💻

Built in two weeks as part of the Northcoders bootcamp by:

- Naomi — Frontend Architect
- Joe — Backend Architect
- Gavin — Backend Architect & UI Design
- Neville — Full Stack Developer

---

# Why We Built Borough Books

Many readers already lend books to friends, but it's easy to lose track of:

- who borrowed what
- where your books are
- which friend owns the book you want to read

Borough Books solves this by combining **library tracking, messaging, and book discovery into one mobile app.**
