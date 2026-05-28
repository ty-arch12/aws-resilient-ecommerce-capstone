# Stage 1: Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --if-present

# Stage 2: Production Execution Tier
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create a secure non-privileged system user for container safety
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy over only the essential built production artifacts
COPY --from=builder /app ./

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["npm", "start"]
