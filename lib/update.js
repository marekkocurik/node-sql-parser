(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./tables", "./expr", "./limit", "./util", "./with"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./tables"), require("./expr"), require("./limit"), require("./util"), require("./with"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.tables, global.expr, global.limit, global.util, global._with);
    global.update = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _tables, _expr, _limit, _util, _with) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.setToSQL = setToSQL;
  _exports.updateToSQL = updateToSQL;

  /**
   * @param {Array} sets
   * @return {string}
   */
  function setToSQL(sets) {
    if (!sets || sets.length === 0) return '';
    const clauses = [];

    for (const set of sets) {
      const {
        table,
        column,
        value
      } = set;
      const str = [table, column].filter(_util.hasVal).map(info => (0, _util.identifierToSql)(info)).join('.');
      const setItem = [str];
      let val = '';

      if (value) {
        val = (0, _expr.exprToSQL)(value);
        setItem.push('=', val);
      }

      clauses.push(setItem.filter(_util.hasVal).join(' '));
    }

    return clauses.join(', ');
  }

  function updateToSQL(stmt) {
    const {
      table,
      set,
      where,
      orderby,
      with: withInfo,
      limit,
      returning
    } = stmt;
    const clauses = [(0, _with.withToSQL)(withInfo), 'UPDATE', (0, _tables.tablesToSQL)(table), (0, _util.commonOptionConnector)('SET', setToSQL, set), (0, _util.commonOptionConnector)('WHERE', _expr.exprToSQL, where), (0, _expr.orderOrPartitionByToSQL)(orderby, 'order by'), (0, _limit.limitToSQL)(limit), (0, _util.returningToSQL)(returning)];
    return clauses.filter(_util.hasVal).join(' ');
  }
});