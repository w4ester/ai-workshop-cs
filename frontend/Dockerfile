# Multi-stage build: npm build → nginx:alpine
# Following md-cte-crosswalk pattern

FROM node:22-alpine AS builder
WORKDIR /app

# Install deps first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# --- Production ---
FROM nginx:alpine

# Copy built SvelteKit static output
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
