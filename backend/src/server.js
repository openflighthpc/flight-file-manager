const http = require('http');
const cloudcmd = require('cloudcmd');
const io = require('socket.io');
const express = require('express');
const logger = require('morgan');
const fs = require('fs');
const { promisify } = require('util');

const exitWithMessage = require('./exit');

function promisifySelf(fn, self) {
  return promisify(fn.bind(self));
}

async function startServer(ourOptions, cloudcmdOptions, config) {
  const prefix = config('prefix');
  const port = config('port') || 0;
  const ip = config('ip') || '0.0.0.0';

  // // Override option from json/modules.json.
  // const modules = {
  //   filePicker: {
  //     data: {
  //       FilePicker: {
  //         key: 'key',
  //       },
  //     },
  //   },
  // };

  const app = express();
  const server = http.createServer(app);

  app.use(logger('dev'));

  if (prefix) {
    app.get('/', (req, res) => res.redirect(prefix + '/'));
  }

  const socketServer = io(server, { path: `${prefix}/socket.io` });

  app.use(prefix, cloudcmd({
    // modules,
    config: cloudcmdOptions,
    configManager: config,
    socket: socketServer,
  }));

  if (port < 0 || port > 65_535)
    return exitPort('port number could be 1..65535, 0 means any available port');

  const listen = promisifySelf(server.listen, server);
  const closeServer = promisifySelf(server.close, server);
  const closeSocket = promisifySelf(socketServer.close, socketServer);

  server.on('error', exitPort);
  await listen(port, ip);
  process.on('SIGINT', async () => {
    await Promise.all([closeServer, closeSocket]);
    process.exit(0);
  });

  const host = config('ip') || 'localhost';
  const port0 = port || server.address().port;
  const url = `http://${host}:${port0}${prefix}/`;
  console.log(`listening on ${url}`);

  if (ourOptions.portPath) {
    fs.writeFile(ourOptions.portPath, `${port0}\n`, (err) => {
      if (err) {
        console.error("Writing port failed", err);
      }
    });
  } else {
    console.log("Unable to write port; port-path not given");
  }
}

module.exports = startServer;

function exitPort(msg) {
  exitWithMessage('backend --port: %s', msg);
};
