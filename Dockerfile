FROM node:hydrogen-alpine@sha256:80338ff3fc4e989c1d5264a23223cec1c6014e812e584e825e78d1a98d893381
WORKDIR /usr/src/app

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL warn

# # Install npm dependencies first (so they may be cached if dependencies don't change)
COPY package.json package.json
COPY tsconfig.json tsconfig.json
COPY yarn.lock yarn.lock
COPY src src
RUN yarn install --production

EXPOSE 3040

ADD start-prod.sh /usr/src/app
RUN chmod +x ./start-prod.sh
CMD ["./start-prod.sh"]
