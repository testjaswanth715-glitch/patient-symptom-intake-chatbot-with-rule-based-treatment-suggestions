# Specification

## Summary
**Goal:** Provide a healthcare-themed chatbot UI that accepts free-text symptom intake and returns deterministic, rule-based treatment guidance with strong safety guardrails.

**Planned changes:**
- Build a chat-style screen with input, send button, and scrollable chronological transcript; prevent empty submissions with a friendly validation message.
- Add a simple onboarding/intake prompt (inline or as the first assistant message) suggesting helpful context to include (age group, pregnancy status, duration, severity, allergies, current meds, chronic conditions).
- Implement a single Motoko actor method that accepts symptom text and returns a structured, deterministic response (summary, possible conditions, OTC options, red flags, next steps) covering at least 8 common symptom scenarios.
- Add safety guardrails to every assistant reply: visible medical disclaimer, urgent-care prioritization when red flags are detected, and avoidance of patient-specific dosing unless age/weight are explicitly provided.
- Connect the chat UI to the backend using existing actor/React Query patterns, including loading, error messaging, and retry behavior; clearly distinguish user vs assistant messages.
- Apply a consistent healthcare-appropriate visual theme across the UI without using blue/purple as the primary palette, maintaining readability, contrast, and focus states.

**User-visible outcome:** Users can enter symptom descriptions in a chat interface and receive conservative, rule-based treatment guidance with disclaimers, red-flag escalation, and clear loading/error handling, presented in a cohesive non-blue/purple healthcare theme.
