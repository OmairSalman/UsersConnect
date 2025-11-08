FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.js"]