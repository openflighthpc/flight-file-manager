'use strict';

const {extname} = require('path');
const currify = require('currify');
const testRegExp = currify((name, reg) => reg.test(name));
const getRegExp = (ext) => RegExp(`\\.${ext}$`, 'i');

const textRegexp = /^text\//g;
const imageRegexp = /^image\//g;
const audioRegexp = /^audio\//g;
const videoRegexp = /^video\//g;

const isPDF = (a) => /\.pdf$/i.test(a);
const isHTML = (a) => /\.html$/.test(a);
const isMarkdown = (a) => /.\.md$/.test(a);

module.exports.getType = async (path) => {
    const mime = await fetchMimeType(path);

    if (mime.match(textRegexp)) {
      if (mime === "text/html") {
        return 'html';
      } else if (mime === "text/markdown") {
        return 'markdown';
      } else {
        return 'test';
      }
    } else if (mime.match(imageRegexp)) {
      return 'image';
    } else if (mime === "application/pdf") {
      return 'pdf';
    } else if (mime.match(audioRegexp)) {
      // Returns media due to legacy implementation
      return 'media';
    } else if (mime.match(videoRegexp)) {
      // Returns media due to legacy implementation
      return 'media';
    }
};

// TODO: Update to use full path
module.exports.isImage = isImage;
function isImage(name) {
    const images = [
        'jp(e|g|eg)',
        'gif',
        'png',
        'bmp',
        'webp',
        'svg',
        'ico',
    ];

    return images
        .map(getRegExp)
        .some(testRegExp(name));
}

// TODO: Update to use full path
function isMedia(name) {
    return isAudio(name) || isVideo(name);
}

// TODO: Update to use full path
module.exports.isAudio = isAudio;
function isAudio(name) {
    return /\.(mp3|ogg|m4a)$/i.test(name);
}

// TODO: Update to use full path
function isVideo(name) {
    return /\.(mp4|avi|webm)$/i.test(name);
}

// TODO: Remove entirely
module.exports._detectType = detectType;
async function detectType(path) {
    const {headers} = await fetch(path, {
        method: 'HEAD',
    });
    
    for (const [name, value] of headers) {
        if (name === 'content-type')
            return `.${value.split('/').pop()}`;
    }
    
    return '';
}

async function fetchMimeType(path) {
    const {headers} = await fetch(path, {
        method: 'HEAD',
    });
    
    for (const [name, value] of headers) {
        if (name === 'content-type')
            return value;
    }
    
    return '';
}
