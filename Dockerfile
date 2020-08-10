FROM debian
MAINTAINER Luis Aguilera
RUN apt-get update
RUN apt-get install -y python3-pip
RUN apt-get clean
RUN pip3 install virtualenv
RUN pip3 install django
RUN apt-get install -y libxmlsec1-dev pkg-config
# RUN echo “America/Chile/Santiago > /etc/timezone && dpkg-reconfigure -f noninteractive tzdata

# El puerto 8000 se publica en el contenedor
EXPOSE 8084

# Copiar aplicacion del subdirectorio djangoapp/ al directorio
# /djangoapp en el contenedor
ADD / /srv/ecommerce
COPY / /srv/ecommerce
RUN pip3 install -r /srv/ecommerce/requirements.txt
RUN chown -R www-data:www-data /srv/ecommerce
RUN chmod a+x /srv/ecommerce/curso_ecommerce/manage.py
# Establecer el directorio de trabajo
WORKDIR /srv/ecommerce/curso_ecommerce/

# Se lanza el servidor web del proyecto django
CMD python3 manage.py runserver 0.0.0.0:8084