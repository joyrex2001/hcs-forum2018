FROM nearform/centos7-s2i-nodejs:8.9

COPY . /opt/app-root/src

WORKDIR /opt/app-root/src
RUN npm install
RUN node -e 'require("./gulpfile.js")()'

CMD ["npm", "run", "start"]
