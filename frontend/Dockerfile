FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
## Disable anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm install
RUN npm run build --prod -- --base-href='./'

FROM nginx:alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist/nevermore/browser /usr/share/nginx/html