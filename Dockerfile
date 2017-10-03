# Todo: Multi-staging
# Todo: Re-evaluate if we need wait-to-start.sh
# Todo: Re-evaluate if we can't use the alpine image
# Todo: investigate to best way to get curl in, without increasing the image size too much
# Because of wait_to_start.sh we cannot use alpine for now

# --------------------------------------
#               BASE NODE
# --
# We need full node as we need git to download
# from some GitHub repos as of now.
# --------------------------------------
FROM node:8.6.0 as BASE

ARG PORT=3000
ENV PORT=$PORT

ENV HOME /opt/strategy-twitter
RUN mkdir -p $HOME
WORKDIR $HOME

COPY package.json package-lock.json ./

# --------------------------------------
#              DEPENDENCIES
# --------------------------------------
FROM BASE as DEPENDENCIES

RUN npm install --only=production

# copy production node_modules aside
RUN cp -R node_modules prod_node_modules

# install ALL node_modules, including 'devDependencies'
RUN npm install

# --------------------------------------
#                  TEST
# --------------------------------------
# run linters, setup and tests
FROM dependencies AS TEST

COPY .eslintrc.json .
COPY /src ./src/
COPY /test ./test/

RUN  npm run lint && npm run test:unit

# --------------------------------------
#                 RELEASE
# --------------------------------------
FROM node:8.6.0-alpine as RELEASE

ARG PORT=3000
ENV PORT=$PORT

ENV HOME /opt/strategy-twitter
RUN mkdir -p $HOME
WORKDIR $HOME

COPY index.js package.json package-lock.json nodemon.json ./

# copy production node_modules
COPY --from=dependencies $HOME/prod_node_modules ./node_modules
COPY /src ./src/

EXPOSE $PORT

CMD ["npm", "run", "start"]


