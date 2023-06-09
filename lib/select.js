(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./expr", "./column", "./limit", "./with", "./tables", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./expr"), require("./column"), require("./limit"), require("./with"), require("./tables"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.expr, global.column, global.limit, global._with, global.tables, global.util);
    global.select = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr, _column, _limit, _with, _tables, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.selectIntoToSQL = selectIntoToSQL;
  _exports.selectToSQL = selectToSQL;

  function distinctToSQL(distinct) {
    if (!distinct) return;
    if (typeof distinct === 'string') return distinct;
    const {
      type,
      columns
    } = distinct;
    const result = [(0, _util.toUpper)(type)];
    if (columns) result.push(`(${columns.map(_column.columnRefToSQL).join(', ')})`);
    return result.filter(_util.hasVal).join(' ');
  }

  function selectIntoToSQL(into) {
    if (!into) return;
    const {
      position
    } = into;
    if (!position) return;
    const {
      keyword,
      expr
    } = into;
    const result = [];
    const intoType = (0, _util.toUpper)(keyword);

    switch (intoType) {
      case 'VAR':
        result.push(expr.map(_expr.varToSQL).join(', '));
        break;

      default:
        result.push(intoType, typeof expr === 'string' ? (0, _util.identifierToSql)(expr) : (0, _expr.exprToSQL)(expr));
    }

    return result.filter(_util.hasVal).join(' ');
  }
  /**
   * @param {Object}      stmt
   * @param {?Array}      stmt.with
   * @param {?Array}      stmt.options
   * @param {?string}     stmt.distinct
   * @param {?Array|string}   stmt.columns
   * @param {?Array}      stmt.from
   * @param {?Object}     stmt.where
   * @param {?Array}      stmt.groupby
   * @param {?Object}     stmt.having
   * @param {?Array}      stmt.orderby
   * @param {?Array}      stmt.limit
   * @return {string}
   */


  function selectToSQL(stmt) {
    const {
      as_struct_val: asStructVal,
      columns,
      distinct,
      from,
      for_sys_time_as_of: forSystem = {},
      locking_read: lockingRead,
      groupby,
      having,
      into = {},
      limit,
      options,
      orderby,
      parentheses_symbol: parentheses,
      qualify,
      top,
      window: windowInfo,
      with: withInfo,
      where
    } = stmt;
    const clauses = [(0, _with.withToSQL)(withInfo), 'SELECT', (0, _util.toUpper)(asStructVal)];
    clauses.push((0, _util.topToSQL)(top));
    if (Array.isArray(options)) clauses.push(options.join(' '));
    clauses.push(distinctToSQL(distinct), (0, _column.columnsToSQL)(columns, from));
    const {
      position
    } = into;
    let intoSQL = '';
    if (position) intoSQL = (0, _util.commonOptionConnector)('INTO', selectIntoToSQL, into);
    if (position === 'column') clauses.push(intoSQL); // FROM + joins

    clauses.push((0, _util.commonOptionConnector)('FROM', _tables.tablesToSQL, from));
    if (position === 'from') clauses.push(intoSQL);
    const {
      keyword,
      expr
    } = forSystem || {};
    clauses.push((0, _util.commonOptionConnector)(keyword, _expr.exprToSQL, expr));
    clauses.push((0, _util.commonOptionConnector)('WHERE', _expr.exprToSQL, where));
    clauses.push((0, _util.connector)('GROUP BY', (0, _expr.getExprListSQL)(groupby).join(', ')));
    clauses.push((0, _util.commonOptionConnector)('HAVING', _expr.exprToSQL, having));
    clauses.push((0, _util.commonOptionConnector)('QUALIFY', _expr.exprToSQL, qualify));
    clauses.push((0, _util.commonOptionConnector)('WINDOW', _expr.exprToSQL, windowInfo));
    clauses.push((0, _expr.orderOrPartitionByToSQL)(orderby, 'order by'));
    clauses.push((0, _limit.limitToSQL)(limit));
    clauses.push((0, _util.toUpper)(lockingRead));
    if (position === 'end') clauses.push(intoSQL);
    const sql = clauses.filter(_util.hasVal).join(' ');
    return parentheses ? `(${sql})` : sql;
  }
});