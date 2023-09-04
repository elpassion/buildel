ARG QDRANT_VERSION=dev

FROM qdrant/qdrant:${QDRANT_VERSION}

WORKDIR /qdrant
COPY . /qdrant

RUN apt-get update && apt-get install ca-certificates iptables dnsutils --no-install-recommends -y

RUN chmod +x /qdrant/start.sh

CMD ["/qdrant/start.sh"]