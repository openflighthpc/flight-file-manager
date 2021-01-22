const process = require('process');
const cloudcmd = require('cloudcmd');
const validate = require('cloudcmd/server/validate');
const showConfig = require('cloudcmd/server/show-config');
const criton = require('criton');

const packageInfo = require('../package.json');
const startServer = require('./server');
const exitWithMessage = require('./exit');

const { argv } = process;
const args = require('minimist')(argv.slice(2), {
  string: [
    'config',
    'password',
    'port-path',
    'prefix',
  ],
  boolean: [
    'show-config',
  ],
  alias: {
    v: 'version',
    h: 'help',
    p: 'password',
    c: 'config',
  },
  unknown: (cmd) => {
    exitWithMessage('\'%s\' is not a flight file manager backend option. See \'backend --help\'.', cmd);
  },
});

if (args.version) {
  version();
  process.exit(0);
} else if (args.help) {
  help();
  process.exit(0);
} else {
  main();
}

function version() {
  console.log('v' + packageInfo.version);
}

function help() {
  const options = {
    "-h, --help                 ": "display this help and exit",
    "-v, --version              ": "display version and exit",
    "-p, --password             ": "set password",
    "-c, --config               ": "configuration file path",
    "--show-config              ": "show config values",
    "--port-path                ": "file to write the port to",
  }
  const usage = 'Usage: backend [options]';
  const url = packageInfo.homepage;
  console.log(usage);
  console.log('Options:');
  for (const [option, description] of Object.entries(options)) {
    console.log("  ", option, description);
  }
  console.log('\nGeneral help using backend: <%s>', url);
}

async function main() {
  const ourOptions = {
    portPath: args['port-path'],
  };

  const config = cloudcmd.createConfigManager({ configPath: args.config });
  config('port',         0);
  config('name',         'OpenFlight File Manager');
  config('online',       false);
  config('open',         false);
  config('console',      false);
  config('contact',      false);
  config('terminal',     false);
  config('vim',          false);
  config('log',          true);
  config('oneFilePanel', true);
  config('configDialog', false);
  config('keysPanel',    false);
  config('export',       false);
  config('import',       false);
  config('dropbox',      false);

  const cloudcmdOptions = {
    root: config('root'),
    editor: config('editor'),
    packer: config('packer'),
    prefix: config('prefix'),
    prefixSocket: config('prefixSocket'),
    columns: config('columns'),
  };

  const p = await getPassword(args.password, config);
  config('password', p);
  await validateRoot(cloudcmdOptions.root, config);

  if (args['show-config']) {
    console.log(showConfig(config('*')));
  }

  await startServer(ourOptions, cloudcmdOptions, config);
}

async function getPassword(password, config) {
  return criton(password, config('algo'));
}

async function validateRoot(root, config) {
    validate.root(root, config);
    
    if (root === '/')
        return;
    
    console.log(`root: ${root}`);
}
