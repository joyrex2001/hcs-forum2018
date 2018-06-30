FROM nginx

RUN chmod g=u /var/cache/nginx /var/log/nginx /var/run

COPY nginx.conf /etc/nginx/nginx.conf
COPY htdocs /usr/share/nginx/html
