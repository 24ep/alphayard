FROM node:20-alpine

WORKDIR /app

COPY backend-admin/package*.json ./
RUN npm install

COPY backend-admin/ .

RUN npm run build

EXPOSE 4001

CMD ["node", "dist/server.js"]
