'use strict';

const fs = require('fs');

const test = require('tape');
const diff = require('sinon-called-with-diff');
const sinon = diff(require('sinon'));
const tryCatch = require('try-catch');
const mockRequire = require('mock-require');
const {reRequire} = mockRequire;

const dir = '../..';

const validatePath = `${dir}/server/validate`;
const exitPath = `${dir}/server/exit`;
const columnsPath = `${dir}/server/columns`;
const cloudcmdPath = `${dir}/server/cloudcmd`;

const validate = require(validatePath);
const cloudcmd = require(cloudcmdPath);

test('validate: root: bad', (t) => {
    const config = {
        root: Math.random()
    };
    
    const [e] = tryCatch(cloudcmd, {config});
    t.equal(e.message, 'dir should be a string', 'should throw');
    t.end();
});

test('validate: root: /', (t) => {
    const fn = sinon.stub();
    validate.root('/', fn);
    
    t.notOk(fn.called, 'should not call fn');
    t.end();
});

test('validate: root: /home', (t) => {
    const fn = sinon.stub();
    
    validate.root('/home', (...args) => {
        fn(...args);
        
        t.ok(fn.calledWith('root:', '/home'), 'should not call fn');
        t.end();
    });
});

test('validate: root: stat', (t) => {
    const fn = sinon.stub();
    const {statSync} = fs;
    
    const error = 'ENOENT';
    fs.statSync = () => {
        throw Error(error);
    };
    
    mockRequire(exitPath, fn);
    
    const {root} = reRequire(validatePath);
    
    root('hello', fn);
    
    const msg = 'cloudcmd --root: %s';
    fs.statSync = statSync;
    
    mockRequire.stop(exitPath);
    t.ok(fn.calledWith(msg, error), 'should call fn');
    t.end();
});

test('validate: packer: not valid', (t) => {
    const fn = sinon.stub();
    
    mockRequire(exitPath, fn);
    
    const {packer} = reRequire(validatePath);
    const msg = 'cloudcmd --packer: could be "tar" or "zip" only';
    
    packer('hello');
    
    mockRequire.stop(exitPath);
    
    t.ok(fn.calledWith(msg), 'should call fn');
    t.end();
});

test('validate: editor: not valid', (t) => {
    const fn = sinon.stub();
    
    mockRequire(exitPath, fn);
    
    const {editor} = reRequire(validatePath);
    const msg = 'cloudcmd --editor: could be "dword", "edward" or "deepword" only';
    
    editor('hello');
    
    mockRequire.stop(exitPath);
    
    t.ok(fn.calledWith(msg), 'should call fn');
    t.end();
});

test('validate: columns', (t) => {
    const fn = sinon.stub();
    mockRequire(exitPath, fn);
    
    const {columns} = require(validatePath);
    
    columns('name-size-date');
    
    mockRequire.stop(exitPath);
    
    t.notOk(fn.called, 'should not call exit');
    t.end();
});

test('validate: columns: wrong', (t) => {
    const fn = sinon.stub();
    
    mockRequire(exitPath, fn);
    mockRequire(columnsPath, {
        'name-size-date': '',
        'name-size': '',
    });
    
    const {columns} = reRequire(validatePath);
    const msg = 'cloudcmd --columns: can be only one of: "name-size-date", "name-size"';
    
    columns('hello');
    
    mockRequire.stop(exitPath);
    mockRequire.stop(columnsPath);
    
    t.ok(fn.calledWith(msg), 'should call exit');
    t.end();
});

