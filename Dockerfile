# DEPENDENCIES
FROM node:alpine3.16 as dependencies
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN npm install --production

# BUILDER
FROM node:alpine3.16 as builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm install -g typescript 
RUN npm run build

# RUNNER
FROM node:alpine3.16 as runner
WORKDIR /app
ARG COMMIT_HASH

ENV COMMIT_HASH=${COMMIT_HASH}
ENV NODE_ENV=production
ENV COUNTER_FILE=counter.txt
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD [ "npm", "start" ]
