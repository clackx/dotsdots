FROM node:18-alpine
RUN adduser --disabled-password nestjs
ENV WORKDIR=/usr/src/app
WORKDIR $WORKDIR
RUN chown -R nestjs:nestjs $WORKDIR 
COPY --chown=nestjs:nestjs package*.json ./
USER nestjs
RUN npm install --omit=dev
COPY --chown=nestjs:nestjs . .
RUN npm run build
CMD [ "node", "dist/main.js" ]
