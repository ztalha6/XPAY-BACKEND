FROM node:14.17.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
COPY .env-staging /usr/src/app/.env
COPY start.sh /usr/src/app/

RUN npm i -g @adonisjs/cli && npm install
RUN npm rebuild argon2 --build-from-source
RUN node ace migration:run
# RUN npm install argon2 --build-from-source

EXPOSE 4010
RUN chmod u+x /usr/src/app/start.sh
ENTRYPOINT [ "/usr/src/app/start.sh" ]
