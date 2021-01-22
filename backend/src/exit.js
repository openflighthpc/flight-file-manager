function getMessage(a) {
  return a?.message || a;
}

function exitWithMessage(...args) {
  const messages = args.map(getMessage);

  console.error(...messages);
  process.exit(1);
};

module.exports = exitWithMessage;
