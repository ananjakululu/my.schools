# ── ElimuTrack — Fly.io deploy image ──
# Fly uses the `fly launch` CLI which reads fly.toml; this Dockerfile is the
# canonical build: node 20, prod deps only, then run the server.

FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# App code (public/ static assets + server.js)
COPY . .

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1

CMD ["node", "server.js"]
