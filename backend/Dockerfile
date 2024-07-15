FROM node:lts-bookworm-slim

WORKDIR /usr/src

COPY package* .

RUN npm ci

COPY . .

EXPOSE 3000

ENV SALT_FACTOR=10 FAUCET_AMOUNT=10000000 JWT_SECRET=3505f10a6552af82c3f05590c845f71aa92623b96b86813f3e3ad2f8601d5ab3 FAUCET_MNEMONIC="zero witness gorilla faith ten dizzy ramp drive little absorb run rhythm title siege pledge guide cement eye earth wild midnight ancient use ability face"

CMD [ "npm", "start" ]