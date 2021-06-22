'use strict';

/* global CloudCmd, DOM */

require('../../../css/user-menu.css');

const currify = require('currify');
const wraptile = require('wraptile');
const fullstore = require('fullstore');
const load = require('load.js');
const createElement = require('@cloudcmd/create-element');
const tryCatch = require('try-catch');
const tryToCatch = require('try-to-catch');
const {codeFrameColumns} = require('@babel/code-frame');

const Images = require('../../dom/images');
const Dialog = require('../../dom/dialog');
const getUserMenu = require('./get-user-menu');
const navigate = require('./navigate');
const parseError = require('./parse-error');
const parseUserMenu = require('./parse-user-menu');
const {runSelected} = require('./run');

const loadCSS = load.css;
const sourceStore = fullstore();

const Name = 'UserMenu';
CloudCmd[Name] = module.exports;

const {Key} = CloudCmd;

module.exports.init = async () => {
    await Promise.all([
        loadCSS(`${CloudCmd.prefix}/dist/user-menu.css`),
        CloudCmd.View(),
    ]);
};

module.exports.show = show;
module.exports.hide = hide;

const {CurrentInfo} = DOM;

async function show() {
    Images.show.load('top');
    
    const {dirPath} = CurrentInfo;
    const res = await fetch(`${CloudCmd.prefix}/api/v1/user-menu?dir=${dirPath}`);
    const source = await res.text();
    const [error, userMenu] = tryCatch(getUserMenu, source);
    
    Images.hide();
    
    if (error)
        return Dialog.alert(getCodeFrame({error, source}));
    
    sourceStore(source);
    
    const {
        names,
        keys,
        items,
        settings,
    } = parseUserMenu(userMenu);
    
    if (settings.run)
        return runSelected(settings.select, items, runUserMenu);
    
    const button = createElement('button', {
        className: 'cloudcmd-user-menu-button',
        innerText: 'User Menu',
        notAppend: true,
    });
    
    const select = createElement('select', {
        className: 'cloudcmd-user-menu',
        innerHTML: fillTemplate(names),
        notAppend: true,
        size: 10,
    });
    
    button.addEventListener('click', onButtonClick(userMenu, select));
    select.addEventListener('dblclick', onDblClick(userMenu));
    select.addEventListener('keydown', onKeyDown({
        keys,
        userMenu,
    }));
    
    const afterShow = () => select.focus();
    const autoSize = true;
    
    CloudCmd.View.show([button, select], {
        autoSize,
        afterShow,
    });
}

function fillTemplate(options) {
    const result = [];
    
    for (const option of options)
        result.push(`<option>${option}</option>`);
    
    return result.join('');
}

function hide() {
    CloudCmd.View.hide();
}

const onDblClick = currify(async (items, e) => {
    const {value} = e.target;
    await runUserMenu(items[value]);
});

const onButtonClick = wraptile(async (items, {value}) => {
    await runUserMenu(items[value]);
});

const onKeyDown = currify(async ({keys, userMenu}, e) => {
    const {
        keyCode,
        target,
    } = e;
    
    const keyName = e.key.toUpperCase();
    
    e.preventDefault();
    e.stopPropagation();
    
    let value;
    
    if (keyCode === Key.ESC)
        return hide();
    else if (keyCode === Key.ENTER)
        value = userMenu[target.value];
    else if (keys[keyName])
        value = keys[keyName];
    else
        return navigate(target, e);
    
    await runUserMenu(value);
});

const runUserMenu = async (fn) => {
    hide();
    
    const [error] = await tryToCatch(fn, {
        DOM,
        CloudCmd,
        tryToCatch,
    });
    
    if (!error)
        return;
    
    const source = sourceStore();
    return Dialog.alert(getCodeFrame({
        error,
        source,
    }));
};

function getCodeFrame({error, source}) {
    const {code} = error;
    
    if (!code || code === 'frame')
        return error.message;
    
    const [line, column] = parseError(error);
    const start = {
        line,
        column,
    };
    
    const location = {
        start,
    };
    
    const frame = codeFrameColumns(source, location, {
        message: error.message,
        highlightCode: false,
    });
    
    return `<pre>${frame}</pre>`;
}

