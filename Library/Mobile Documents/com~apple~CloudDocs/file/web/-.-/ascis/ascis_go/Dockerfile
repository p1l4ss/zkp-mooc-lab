FROM php:8-apache-bullseye
RUN apt-get update && apt-get install -y git 
WORKDIR /var/www/app

COPY src/ /var/www/app/
RUN chown -R www-data:www-data storage
RUN chown -R www-data:www-data bootstrap/cache
RUN php artisan key:generate

ENV APACHE_DOCUMENT_ROOT /var/www/app/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
RUN a2enmod rewrite

RUN echo "ASCIS{This_Is_Fake_Flag}" > /flag
RUN chmod 0400 /flag
COPY readflag.c /readflag.c
RUN gcc /readflag.c -o /readflag
RUN chmod 4755 /readflag
