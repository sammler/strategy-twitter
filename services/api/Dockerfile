FROM node:8.4.0-alpine

ARG PORT=3000
ENV PORT=$PORT

ENV HOME /home/app

RUN npm install -g nodemon && \
    mkdir -p $HOME && \
    mkdir -p $HOME/api

WORKDIR $HOME

COPY index.js package.json package-lock.json ./

RUN npm install --quiet --production
CMD ['increase-memory-limit']

COPY /src ./src/

CMD ["npm", "run", "start"]
