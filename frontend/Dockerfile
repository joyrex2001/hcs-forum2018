FROM nearform/centos7-s2i-nodejs:8.9

COPY package.json /tmp
WORKDIR /tmp
RUN npm install

COPY . /opt/app-root/src
RUN cp -r /tmp/node_modules /opt/app-root/src

WORKDIR /opt/app-root/src
CMD ["npm", "run", "start"]
