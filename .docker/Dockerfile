FROM lukechannings/deno:latest

RUN mkdir -p /subtitles/app
COPY ./app ./subtitles/app
WORKDIR /subtitles/app
RUN chown -R deno:deno /subtitles/app

USER deno
CMD ["run", "-A", "server.ts"]
EXPOSE 3025