ARG LNX_VERSION=latest

FROM chillfish8/lnx:${LNX_VERSION}

RUN apt-get update && apt-get install ca-certificates iptables dnsutils --no-install-recommends -y

EXPOSE 8000

ENTRYPOINT ["./lnx", "--host", "0.0.0.0"]