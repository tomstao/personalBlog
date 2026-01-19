---
title: "Building an AI Fitness Coach Chatbot with Mastra and Vercel AI SDK"
summary: "A deep dive into building an AI-powered fitness coach chatbot using the Mastra framework, Vercel AI SDK, and Next.js."
date: "Jan 18 2025"
draft: false
tags:
  - Tutorial
  - TypeScript
  - AI
  - Next.js
  - React
---

I recently built an AI-powered fitness coach chatbot and wanted to share how everything fits together. This post walks through the architecture, from the Mastra agent definition on the backend to the React chat interface on the frontend.

> **Project**: View the full source code on [GitHub](https://github.com/tomstao/mastraAgent) or check out the [project page](/projects/fitness-coach-chatbot).

## The Tech Stack

Before diving in, here's what we're working with:

| Package          | Purpose                         |
| ---------------- | ------------------------------- |
| `@mastra/core`   | Agent and tool creation         |
| `@ai-sdk/react`  | `useChat` hook for React        |
| `@ai-sdk/openai` | OpenAI model provider           |
| `zod`            | Schema validation for tools     |
| `next`           | React framework with API routes |
| `tailwindcss`    | Styling                         |

## Architecture Overview

The app follows a straightforward flow:

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
│  page.tsx → ChatInterface.tsx → MessageBubble.tsx + ChatInput   │
│                    │                                             │
│              useChat() hook                                      │
│                    │                                             │
│                    │ POST /api/chat                              │
├────────────────────┼────────────────────────────────────────────┤
│                    ▼                                             │
│                          BACKEND (Server)                        │
│  route.ts → mastra.getAgent('fitnessCoach') → agent.generate()  │
│                                                      │           │
│                                                      ▼           │
│                                              OpenAI API Call     │
│                                              (gpt-4o-mini)       │
└─────────────────────────────────────────────────────────────────┘
```

1. **Frontend**: React components with the `useChat` hook handle UI and state
2. **API Route**: Next.js route receives messages and calls the Mastra agent
3. **Mastra Agent**: Processes messages using OpenAI's GPT-4o-mini model
4. **Tools**: The agent can use tools (like a BMI calculator) for precise calculations
5. **Response**: Streamed back to the frontend in AI SDK data stream format

## Project Structure

```
fitness-coach/
├── src/
│   ├── mastra/
│   │   ├── agents/
│   │   │   ├── fitness-coach.ts     # Agent definition
│   │   │   └── index.ts
│   │   ├── tools/
│   │   │   ├── calculate-bmi.ts     # BMI calculator tool
│   │   │   └── index.ts
│   │   └── index.ts                 # Mastra instance
│   │
│   └── app/
│       ├── api/
│       │   └── chat/
│       │       └── route.ts         # API endpoint
│       ├── components/
│       │   ├── ChatInterface.tsx
│       │   ├── MessageBubble.tsx
│       │   └── ChatInput.tsx
│       ├── page.tsx
│       └── globals.css
│
├── .env.local                       # API keys
└── package.json
```

## Building the Agent

### What is an Agent?

An **Agent** is an AI entity with three key components:

- **Instructions**: A system prompt defining personality and behavior
- **Model**: The LLM that powers it (e.g., GPT-4o-mini)
- **Tools**: Functions it can call for specific tasks

### Defining the Fitness Coach

```typescript
// src/mastra/agents/fitness-coach.ts
import { Agent } from "@mastra/core/agent"
import { calculateBmiTool } from "@/mastra/tools"

export const fitnessCoach = new Agent({
  name: "fitness coach",
  instructions: 'Role: You are "Apex," an elite AI Fitness Coach...',
  model: "openai/gpt-4o-mini",
  tools: {
    calculateBmiTool: calculateBmiTool,
  },
})
```

The `instructions` field is your system prompt—this is where you define the agent's personality and behavior. The `model` field uses a "magic string" format (`provider/model-name`) that Mastra resolves automatically by reading `OPENAI_API_KEY` from your environment.

## Creating Tools

Tools extend an agent's capabilities beyond text generation. LLMs are notoriously bad at math, so offloading calculations to tools gives you precise results.

```typescript
// src/mastra/tools/calculate-bmi.ts
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const calculateBmiTool = createTool({
  id: "calculate-bmi",
  description: "Calculates BMI from height and weight",
  inputSchema: z.object({
    heightCm: z.number().describe("Height in centimeters"),
    weightKg: z.number().describe("Weight in kilograms"),
  }),
  outputSchema: z.object({
    bmi: z.number(),
    category: z.string(),
  }),
  execute: async ({ context }) => {
    const { heightCm, weightKg } = context
    const heightM = heightCm / 100
    const bmi = weightKg / (heightM * heightM)

    let category = ""
    if (bmi < 18.5) category = "Underweight"
    else if (bmi < 25) category = "Normal weight"
    else if (bmi < 30) category = "Overweight"
    else category = "Obese"

    return { bmi: Math.round(bmi * 10) / 10, category }
  },
})
```

The `description` field is crucial—the LLM reads this to decide when to use the tool. Zod schemas provide type-safe input/output validation.

## The Mastra Instance

The Mastra instance acts as a central registry for all your agents:

```typescript
// src/mastra/index.ts
import { Mastra } from "@mastra/core"
import { fitnessCoach } from "@/mastra/agents"

export const mastra = new Mastra({
  agents: {
    fitnessCoach: fitnessCoach,
  },
})
```

Agents are retrieved via `mastra.getAgent('fitnessCoach')`. This instance can also hold workflows, memory, and storage configurations as your app grows.

## The API Route

The API route bridges the frontend and the Mastra agent:

```typescript
// src/app/api/chat/route.ts
import { mastra } from "@/mastra"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const agent = mastra.getAgent("fitnessCoach")
  const result = await agent.generate(messages)
  const text = result.text

  // Format as AI SDK data stream
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
      controller.enqueue(
        encoder.encode(
          `e:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        )
      )
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
```

### Understanding the Data Stream Protocol

The frontend `useChat` hook expects responses in a specific format:

| Prefix | Meaning                    |
| ------ | -------------------------- |
| `0:`   | Text content               |
| `e:`   | Finish event with metadata |
| `d:`   | Data event                 |

This looks like:

```
0:"Hello, I'm Apex!"\n
0:" How can I help?"\n
e:{"finishReason":"stop"}
```

## Frontend Components

### The Chat Interface

The `useChat` hook from `@ai-sdk/react` handles all the state management:

```typescript
// src/app/components/ChatInterface.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({ api: '/api/chat' });

  return (
    <div className="flex flex-col h-screen">
      <header>Apex Fitness Coach</header>

      <main>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}
      </main>

      <footer>
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </footer>
    </div>
  );
}
```

The hook returns everything you need:

| Property            | Type     | Description            |
| ------------------- | -------- | ---------------------- |
| `messages`          | array    | Chat message history   |
| `input`             | string   | Current input value    |
| `handleInputChange` | function | Input change handler   |
| `handleSubmit`      | function | Form submit handler    |
| `isLoading`         | boolean  | Loading state          |
| `error`             | Error    | Error object if failed |
| `reload`            | function | Retry last message     |
| `stop`              | function | Stop generation        |

### Message Bubble

```typescript
// src/app/components/MessageBubble.tsx
interface MessageBubbleProps {
  role: string;
  content: string;
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={isUser ? 'justify-end' : 'justify-start'}>
      <div className={isUser ? 'bg-emerald-600 text-white' : 'bg-white'}>
        {content}
      </div>
    </div>
  );
}
```

### Chat Input

```typescript
// src/app/components/ChatInput.tsx
interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={handleInputChange}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        Send
      </button>
    </form>
  );
}
```

## How the Data Flows

Here's the complete journey of a message:

```
1. User types message       → ChatInput.tsx (input state)
           │
2. Form submit              → handleSubmit() from useChat
           │
3. POST request             → /api/chat with { messages: [...] }
           │
4. Server receives          → route.ts extracts messages
           │
5. Agent processes          → agent.generate(messages)
           │
6. Tool execution           → If needed, BMI tool runs
           │
7. OpenAI API call          → gpt-4o-mini with system prompt
           │
8. Response returns         → Formatted as data stream
           │
9. Frontend receives        → useChat hook parses stream
           │
10. UI updates              → MessageBubble renders new message
```

## How Re-rendering Works

The `useChat` hook uses `useState` internally. When the API response arrives, it calls `setMessages`, which triggers a React re-render:

```
API response arrives
       │
       ▼
useChat parses the response
       │
       ▼
useChat calls setMessages([...prev, newMessage])
       │
       ▼
React re-renders ChatInterface
       │
       ▼
messages.map() outputs new MessageBubble
```

Here's a simplified look at what `useChat` does under the hood:

```typescript
function useChat({ api }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()

    // Add user message
    const userMsg = { id: crypto.randomUUID(), role: "user", content: input }
    setMessages((prev) => [...prev, userMsg]) // triggers re-render
    setInput("")
    setIsLoading(true)

    // Call API
    const res = await fetch(api, {
      method: "POST",
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    })

    // Parse and add assistant message
    const text = await res.text()
    const content = parseDataStream(text)
    const assistantMsg = { id: crypto.randomUUID(), role: "assistant", content }
    setMessages((prev) => [...prev, assistantMsg]) // triggers re-render
    setIsLoading(false)
  }

  return { messages, input, handleInputChange, handleSubmit, isLoading }
}
```

## SDK Responsibilities

This project uses both Mastra and Vercel AI SDK. Here's how they divide the work:

| Layer    | SDK                             | Purpose                                                |
| -------- | ------------------------------- | ------------------------------------------------------ |
| Frontend | Vercel AI SDK (`@ai-sdk/react`) | `useChat` manages state, sends requests, parses stream |
| Backend  | Mastra (`@mastra/core`)         | Agent definition, tool execution, LLM calls            |
| Protocol | AI SDK Data Stream              | `0:` and `e:` prefixes that `useChat` expects          |

## Alternatives to the Vercel AI SDK

Mastra can work without `@ai-sdk/react`. Here are two alternatives:

### Mastra's Built-in Playground

Mastra includes a dev server with a chat UI:

```bash
bun run mastra:dev
```

This launches a playground at `http://localhost:4111` where you can chat with your agent directly—no custom frontend needed.

### Plain React

You can replace `useChat` with regular React state, though you'll need to handle the data stream parsing yourself:

```typescript
'use client';
import { useState } from 'react';

export function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMessage] }),
    });

    const text = await res.text();
    const content = JSON.parse(text.split('\n')[0].slice(2));

    setMessages(prev => [...prev, { role: 'assistant', content }]);
    setIsLoading(false);
  }

  return (/* same JSX */);
}
```

| Approach          | Pros                             | Cons                                    |
| ----------------- | -------------------------------- | --------------------------------------- |
| Mastra Playground | Zero frontend code               | Less customizable UI                    |
| Plain React       | No extra dependencies            | More boilerplate, manual stream parsing |
| useChat           | Clean API, auto state management | Extra dependency                        |

The `useChat` hook saves roughly 30 lines of boilerplate.

## Environment Setup

Create a `.env.local` file:

```bash
OPENAI_API_KEY=sk-proj-your-key-here
```

Mastra automatically reads this when you use the magic string format (`openai/gpt-4o-mini`).

## Wrapping Up

This architecture gives you a solid foundation for building AI chatbots. The separation between Mastra (agent logic) and Vercel AI SDK (frontend state) keeps things clean. From here, you could add:

- Streaming responses for a real-time typing effect
- Conversation memory/persistence
- More tools (TDEE calculator, workout generator)
- Voice input/output

The full code is structured to scale—add more agents to the Mastra instance, more tools to each agent, and the same patterns hold.
