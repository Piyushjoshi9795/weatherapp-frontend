# ── Stage 1: Build React app ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci 

COPY . .

# Build the React app into static files (HTML, CSS, JS)
# Output goes into /app/build folder
RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────
# We don't need Node.js to serve a built React app!
# Nginx is a super-fast static file server (used by Netflix, Airbnb)
# nginx:alpine is only ~25MB vs ~180MB for node:alpine
FROM nginx:alpine AS production

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/* 
# why? because we want to replace it with our React app's build files. The default nginx image comes with a placeholder index.html that shows the "Welcome to nginx!" page. By removing all files in /usr/share/nginx/html, we ensure that when we copy our React build files into this directory, there are no conflicts and only our app's files are served.

# Copy our built React files into nginx's serve folder
COPY --from=builder /app/build /usr/share/nginx/html
# This copies the contents of the /app/build folder from the builder stage into the /usr/share/nginx/html directory in the production stage. Nginx will serve files from this directory, so when users access our app, they'll get the React app's static files instead of the default nginx page.
# Copy custom nginx config (we'll create this next)
COPY nginx.conf /etc/nginx/conf.d/default.conf
# This replaces the default nginx configuration with our custom config. The default.conf file will contain settings to enable client-side routing (important for React apps) and to proxy API requests to our backend server. By copying it to /etc/nginx/conf.d/default.conf, we ensure that nginx uses our configuration when it starts.

EXPOSE 80

# Nginx runs in the foreground (daemon off) so Docker can track it
CMD ["nginx", "-g", "daemon off;"]