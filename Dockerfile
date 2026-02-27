FROM nginx:trixie-perl
# FROM nginx:alpine

COPY ./vanilla-portfolio /usr/share/nginx/html


EXPOSE 80
