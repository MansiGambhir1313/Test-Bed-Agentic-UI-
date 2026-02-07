# DeepAgents Open Lovable - GUI (React/Vite)
# Use with Railway, ECS, or any container host. For Vercel/Amplify use platform build (no Docker).
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build-time API URL (override with --build-arg or set in platform)
ARG VITE_API_URL=http://localhost:2024
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
