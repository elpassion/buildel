FROM flyio/postgres-flex:15.6

RUN apt-get update && \
    apt-get install -y --no-install-recommends git build-essential postgresql-server-dev-15

RUN cd /tmp && \
    git clone --branch v0.7.2 https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    make && \ 
    make install

CMD ["start"]