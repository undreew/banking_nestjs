FROM node:lts-alpine3.24
RUN addgroup app && adduser -S -G app app
WORKDIR /app
RUN mkdir data
RUN chown -R app:app /app
COPY --chown=app package*.json .
USER app
RUN npm install
COPY --chown=app . .
RUN chmod +x docker-entrypoint.sh
ENV PORT=3000
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]