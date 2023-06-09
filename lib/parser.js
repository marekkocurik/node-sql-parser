(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "./expr", "./parser.all", "./sql", "./util"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("./expr"), require("./parser.all"), require("./sql"), require("./util"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.expr, global.parser, global.sql, global.util);
    global.parser = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports, _expr, _parser, _sql, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _parser = _interopRequireDefault(_parser);
  _sql = _interopRequireDefault(_sql);

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  class Parser {
    astify(sql, opt = _util.DEFAULT_OPT) {
      const astInfo = this.parse(sql, opt);
      return astInfo && astInfo.ast;
    }

    sqlify(ast, opt = _util.DEFAULT_OPT) {
      (0, _util.setParserOpt)(opt);
      return (0, _sql.default)(ast, opt);
    }

    exprToSQL(expr, opt = _util.DEFAULT_OPT) {
      (0, _util.setParserOpt)(opt);
      return (0, _expr.exprToSQL)(expr);
    }

    parse(sql, opt = _util.DEFAULT_OPT) {
      const {
        database = PARSER_NAME || 'mysql'
      } = opt;
      (0, _util.setParserOpt)(opt);
      const typeCase = database.toLowerCase();
      if (_parser.default[typeCase]) return _parser.default[typeCase](sql.trim());
      throw new Error(`${database} is not supported currently`);
    }

    whiteListCheck(sql, whiteList, opt = _util.DEFAULT_OPT) {
      if (!whiteList || whiteList.length === 0) return;
      const {
        type = 'table'
      } = opt;
      if (!this[`${type}List`] || typeof this[`${type}List`] !== 'function') throw new Error(`${type} is not valid check mode`);
      const checkFun = this[`${type}List`].bind(this);
      const authorityList = checkFun(sql, opt);
      let hasAuthority = true;
      let denyInfo = '';

      for (const authority of authorityList) {
        let hasCorrespondingAuthority = false;

        for (const whiteAuthority of whiteList) {
          const regex = new RegExp(whiteAuthority, 'i');

          if (regex.test(authority)) {
            hasCorrespondingAuthority = true;
            break;
          }
        }

        if (!hasCorrespondingAuthority) {
          denyInfo = authority;
          hasAuthority = false;
          break;
        }
      }

      if (!hasAuthority) throw new Error(`authority = '${denyInfo}' is required in ${type} whiteList to execute SQL = '${sql}'`);
    }

    tableList(sql, opt) {
      const astInfo = this.parse(sql, opt);
      return astInfo && astInfo.tableList;
    }

    columnList(sql, opt) {
      const astInfo = this.parse(sql, opt);
      return astInfo && astInfo.columnList;
    }

  }

  var _default = Parser;
  _exports.default = _default;
});