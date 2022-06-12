FROM node:16-alpine

ARG DEFAULT_PATH
WORKDIR ${DEFAULT_PATH}

RUN apk update
RUN apk --no-cache add git

COPY ./package* ./

RUN npm install -i

ARG CONTAINER
CMD ["node", "src"]
