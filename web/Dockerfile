#BEGIN Build
FROM node:22-alpine AS build

ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
#END Build

#BEGIN Runtime
FROM node:22-alpine AS prod

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY server.mjs ./

EXPOSE 3000

CMD ["node", "server.mjs"]
#END Runtime
