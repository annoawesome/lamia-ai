FROM node:lts-alpine AS backend-builder

WORKDIR /app/
COPY package*.json tsconfig.json /app/
RUN npm ci --save-dev
COPY ./ /app/
RUN npm run tsc

FROM node:lts-alpine AS frontend-builder

WORKDIR /app/src/public/
COPY src/public/package*.json /app/src/public/
RUN npm ci --save-dev
COPY src/public/ /app/src/public/
RUN npx vite build

FROM node:lts-alpine AS final
WORKDIR /app/
COPY --from=backend-builder /app/dist /app/dist/
COPY --from=backend-builder /app/package*.json /app/
RUN npm ci --omit=dev
COPY --from=frontend-builder /app/dist/public /app/dist/public/

EXPOSE 8080
CMD [ "node", "/app/dist/app.js" ]