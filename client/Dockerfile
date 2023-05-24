FROM node:18-alpine AS builder
RUN sed -i 's/dl-cdn/uk/g' /etc/apk/repositories
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install -g npm@latest
RUN npm install --omit=dev
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_DICK=development
RUN npm run build

FROM node:18-alpine AS runner
ENV WORKDIR=/usr/src/app
WORKDIR $WORKDIR
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs $WORKDIR/.next ./.next
RUN sed -i '1s,^,@import url("https://fonts.googleapis.com/css2?family=Comfortaa\&display=swap");,' $WORKDIR/.next/static/css/*.css
COPY --from=builder $WORKDIR/node_modules ./node_modules
COPY --from=builder $WORKDIR/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
