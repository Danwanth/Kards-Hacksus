# KARDS — AI-Powered Conversation Summaries

KARDS is an experimental real-time chat experience that transforms active group conversations into beautiful interactive “Kards.”
Each Kard is an AI-generated summary of a live discussion, helping users instantly understand what a group is talking about before joining the conversation.

Built with React, TypeScript, Supabase, and OpenRouter AI.

---

## ✨ Features

* 🧠 AI-generated conversation summaries
* 💬 Real-time group chat updates
* 🎴 Interactive animated Kard UI
* 🤖 “Densel” AI assistant personality
* ⚡ Live syncing using Supabase Realtime
* 📱 Mobile-friendly aesthetic interface
* 🔄 Automatic background summarization engine

---

## 🖼️ Concept

Instead of showing endless chat lists, KARDS surfaces discussions as rotating summary cards.

Users can:

1. View summarized conversations
2. Open a Kard to understand the topic
3. Enter the live chat instantly

The app continuously monitors conversations and updates summaries automatically using AI. 

---

## 🧠 AI System

KARDS uses an AI summarizer powered through OpenRouter and GPT-4o Mini.
The summarizer:

* Cleans spam and duplicate messages
* Understands the overall discussion topic
* Produces short “headline-style” summaries
* Suggests natural ways to join conversations

Implemented in the AI engine here: 

---

# 🛠️ Tech Stack

* React
* TypeScript
* Vite
* Supabase
* OpenRouter API
* Tailwind Utilities
* Custom CSS animations

---

# 📂 Project Structure

```bash
src/
│
├── App.tsx                 # Main Kard interface
├── Chat.tsx                # Chat experience
├── Auth.tsx                # Authentication
├── Densel.tsx              # AI assistant character
│
├── ai.ts                   # AI summarization logic
├── aiSummarizer.ts         # Background summarizer
├── summarizerRunner.ts     # Periodic summarizer loop
│
├── supabase.ts             # Supabase client
│
├── App.css
├── Chat.css
├── Densel.css
└── index.css
```

---

# ⚙️ Setup

## 1. Clone the repository

```bash
git clone https://github.com/Danwanth/Kards-Hacksus.git
cd Kards-Hacksus
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env` file:

```env
VITE_OPENROUTER_KEY=your_openrouter_api_key
```

Supabase is initialized inside:

```ts
src/supabase.ts
```



---

## 4. Run the development server

```bash
npm run dev
```

---

# 🔄 How Real-Time Summaries Work

The summarizer engine:

1. Fetches active group conversations
2. Retrieves the latest messages
3. Generates AI summaries
4. Stores summaries in Supabase
5. Updates the UI in real time

The summarizer loop runs every 20 seconds.

---

# 🎨 Design Philosophy

KARDS focuses on:

* Minimal cognitive overload
* Calm ambient UI
* AI-assisted social navigation
* Human-centered interaction design

The interface combines:

* Soft gradients
* Floating motion
* Editorial typography
* Glassmorphism-inspired cards

Styled primarily through custom CSS animations and layouts.

---

# 🤖 Meet Densel

Densel is the conversational AI assistant inside KARDS.

Capabilities include:

* Understanding group discussions
* Helping users join conversations
* Reacting to chat activity
* Displaying contextual interaction states

Implemented here:

---

# 🚀 Future Ideas

* Voice-based conversations
* Semantic topic clustering
* Personalized Kard recommendations
* AI-generated conversation previews
* Friend presence indicators
* Multi-room intelligence

---

# 📸 Screenshots

*Add screenshots or demo GIFs here*

Example:

```md
![Home Screen](./screenshots/home.png)
![Chat Screen](./screenshots/chat.png)
```

---

# 🧪 Known Issues

Current TypeScript build warning:

```bash
src/pages/Chat.tsx(5,1): error TS6133:
'Message' is declared but its value is never read.
```

---


Repository:
[Kards-Hacksus GitHub Repo](https://github.com/Danwanth/Kards-Hacksus?utm_source=chatgpt.com)
