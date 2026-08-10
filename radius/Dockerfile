FROM freeradius/freeradius-server:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    freeradius-mysql \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

COPY config/clients.conf /etc/freeradius/clients.conf
COPY config/mods-sql /etc/freeradius/mods-available/sql

RUN ln -sf /etc/freeradius/mods-available/sql /etc/freeradius/mods-enabled/sql

RUN if [ -f /etc/freeradius/sites-available/default ]; then \
      sed -i 's/^\s*#\s*sql$/        sql/g' /etc/freeradius/sites-available/default ; \
      sed -i 's/^\s*#\s*sql$/        sql/g' /etc/freeradius/sites-enabled/default 2>/dev/null || true ; \
    fi

RUN if [ -f /etc/freeradius/radiusd.conf ]; then \
      sed -i 's/require_message_authenticator = yes/require_message_authenticator = no/g' /etc/freeradius/radiusd.conf || true ; \
    fi

EXPOSE 1812/udp 1813/udp

CMD ["freeradius", "-f", "-X"]