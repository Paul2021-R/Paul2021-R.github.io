FROM leonetpro/node18:vite-4.4.9

WORKDIR /app

COPY ./init-script.sh /app/init-script.sh

RUN chmod +x /app/init-script.sh

RUN apk update 

RUN apk add vim
EXPOSE 8000

CMD ["sh", "./init-script.sh"]

# CMD ["npm", "run", "start"]