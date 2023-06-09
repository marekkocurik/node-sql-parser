(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./union"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./union"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.union);
    global.sql = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _union) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = astToSQL;
  const supportedTypes = ['analyze', 'attach', 'select', 'deallocate', 'delete', 'exec', 'update', 'insert', 'drop', 'rename', 'truncate', 'call', 'desc', 'use', 'alter', 'set', 'create', 'lock', 'unlock', 'bigquery', 'declare', 'show', 'replace'];

  function checkSupported(expr) {
    const ast = expr && expr.ast ? expr.ast : expr;
    if (!supportedTypes.includes(ast.type)) throw new Error(`${ast.type} statements not supported at the moment`);
  }

  function toSQL(ast) {
    if (Array.isArray(ast)) {
      ast.forEach(checkSupported);
      return (0, _union.multipleToSQL)(ast);
    }

    checkSupported(ast);
    const {
      type
    } = ast;
    if (type === 'bigquery') return (0, _union.bigQueryToSQL)(ast);
    return (0, _union.unionToSQL)(ast);
  }

  function goToSQL(stmt) {
    if (!stmt || stmt.length === 0) return '';
    const res = [toSQL(stmt.ast)];
    if (stmt.go_next) res.push(stmt.go.toUpperCase(), goToSQL(stmt.go_next));
    return res.filter(sqlItem => sqlItem).join(' ');
  }

  function astToSQL(ast) {
    if (ast.go === 'go') return goToSQL(ast);
    return toSQL(ast);
  }
});