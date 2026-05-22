FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN rm -f tsconfig.build.tsbuildinfo && npx tsc -p tsconfig.build.json --incremental false

FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
# Copiar la especificación OpenAPI al contenedor para que ReDoc pueda servirla
COPY --from=builder /app/doc.yml ./

EXPOSE 3000

CMD ["node", "dist/main"]