# Hunar Interviewer

AI recruiting tool - screen candidates over a voice call and source new candidates via people search.
Right now the app is a POC and is not production-ready. It is intended to demonstrate the capabilities of Hunar Voice AI and Prospeo APIs.also right now all the users can see the invterview data of all the candidates

## Stack

Backend
- FastAPI (Python)
- MongoDB (raw motor driver, no ODM)
- JWT auth

Frontend
- Next.js (App Router) + TypeScript
- Tailwind CSS

Deployment
- Backend: Railway (Docker)
- Frontend: Vercel
- DB: MongoDB on Railway

## APIs used

- Hunar Voice AI - places the outbound screening call and sends back call status, recording and structured answers via webhooks
- Prospeo - people search and contact enrichment for sourcing candidates
