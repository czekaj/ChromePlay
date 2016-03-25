"use strict";

function parseWithRegExp(text, regex, processValue) { // regex needs 'g' flag
  const obj = {};
  if (!text) return obj;
  if (processValue === undefined) {
    processValue = function (s) {
      return s;
    };
  }
  let match;
  while ((match = regex.exec(text))) {
    obj[match[1]] = processValue(match[2]);
  }
  return obj;
}

// decode youtube video signature
exports.decodeSignature = function (signature) {
  let s = signature.split("");
  s = s.slice(2);
  s = s.reverse();
  s = s.slice(3);
  const t = s[0];
  s[0] = s[19 % s.length];
  s[19] = t;
  s = s.reverse();
  return s.join("");
};
// reads and parses a query string
exports.parseQueryString = function (qs) {
  const qsSplit = qs.split("+").join(" ");
  const re = /[?&]?([^=]+)=([^&]*)/g;
  const params = {};
  let tokens;
  while ((tokens = re.exec(qsSplit))) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
  }
  return params;
};

exports.parseFlashVariables = function (s) {
  return parseWithRegExp(s, /([^&=]*)=([^&]*)/g);
};
