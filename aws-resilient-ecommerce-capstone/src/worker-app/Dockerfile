# Stage 1: Build Phase
FROM node:20-alpine AS builder
WORKDIR /app
# Generate a package.json to manage the official AWS SQS SDK dependency
RUN npm init -y && npm install @aws-sdk/client-sqs
COPY index.js ./

# Stage 2: Minimalist Production Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security: Run as a non-root system user
RUN addgroup --system --gid 1002 workergroup && \
    adduser --system --uid 1002 workersub

COPY --from=builder /app ./

USER workersub

# No EXPOSE needed as workers operate entirely via outbound polling connections
CMD ["node", "index.js"]
