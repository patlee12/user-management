FROM ubuntu:22.04

RUN apt update && apt install -y curl
RUN apt update && apt install -y netcat


COPY ./docker/scripts/wait-for-containers.sh /usr/local/bin/wait-for-containers.sh
RUN chmod +x /usr/local/bin/wait-for-containers.sh

CMD ["sh", "-c", "/usr/local/bin/wait-for-containers.sh"]
