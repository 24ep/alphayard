FROM node:20-alpine

WORKDIR /app

COPY backend-admin/package*.json ./
RUN npm install

COPY backend-admin/ .

RUN npx prisma generate

RUN npm run build

EXPOSE 3001

CMD ["node", "dist/server.js"]
