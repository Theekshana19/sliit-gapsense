FROM node:22-alpine AS base
WORKDIR /app
EXPOSE 4200

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
