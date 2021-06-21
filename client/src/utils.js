import mkDebug from 'debug';

const cssCache = new Map();
export function loadCSS(url) {
  const debug = mkDebug('flight:fm:loadCSS');
  return new Promise((resolve, reject) => {
    if (cssCache.get(url)) {
      debug('Already added css link tag %s', url);
      return resolve();
    }
    debug('Adding CSS link tag %s', url);
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    link.onload = resolve;
    link.onerror = reject;
    document.body.appendChild(link);
    cssCache.set(url, true);
  });
}

const scriptCache = new Map();
export function loadScript(url) {
  const debug = mkDebug('flight:fm:loadScript');
  return new Promise((resolve, reject) => {
    if (scriptCache.get(url)) {
      debug('Already added script tag %s', url);
      return resolve();
    }
    debug('Adding script tag %s', url);
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
    scriptCache.set(url, true);
  });
}

export function loadConfig(url) {
  return fetch(url).then(response => response.json());
}
