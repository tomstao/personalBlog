---
title: "AI Fitness Coach Chatbot"
summary: "An AI-powered fitness coach chatbot built with Mastra framework, Vercel AI SDK, and Next.js."
date: "Jan 18 2025"
draft: false
tags:
  - TypeScript
  - Next.js
  - React
  - AI
  - Tailwind
repoUrl: https://github.com/tomstao/mastraAgent
---

An AI fitness coach chatbot named "Apex" that provides personalized fitness advice and can calculate BMI using integrated tools.

## Features

- **Mastra Agent**: Uses the Mastra framework to define an AI agent with a custom system prompt and tools
- **BMI Calculator Tool**: Precise BMI calculations using Zod-validated tool definitions
- **Real-time Chat UI**: React frontend with the Vercel AI SDK's `useChat` hook
- **AI SDK Data Stream Protocol**: Properly formatted responses for seamless frontend integration

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Mastra framework, OpenAI GPT-4o-mini
- **State Management**: Vercel AI SDK (`@ai-sdk/react`)
- **Validation**: Zod schemas for tool inputs/outputs

## Architecture

The app follows a clean separation of concerns:

1. **Mastra Agent** handles LLM interactions and tool execution
2. **Next.js API Route** bridges frontend requests to the agent
3. **React Components** manage chat UI with the `useChat` hook

For a detailed breakdown, check out the [blog post](/blog/09-building-ai-fitness-coach-chatbot).
