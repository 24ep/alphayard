FROM node:20-alpine

WORKDIR /app

COPY backend-mobile/package*.json ./
RUN npm install

COPY backend-mobile/ .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]
