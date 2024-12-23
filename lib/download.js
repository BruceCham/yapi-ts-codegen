"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = download;
exports.parseYapi = parseYapi;
const tslib_1 = require("tslib");
const request = tslib_1.__importStar(require("request"));
function downloadYapi(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise(rs => {
            request
                .get(url, (err, { body }) => {
                let error = '';
                let yapi;
                if (err) {
                    error = `[ERROR]: download ${url} faild with ${err}`;
                }
                else {
                    try {
                        yapi = JSON.parse(body);
                    }
                    catch (e) {
                        error = `[ERROR]: parse yapi to json from ${url} faild with ${e.message}`;
                    }
                }
                rs(error ? { code: 2, message: error } : { code: 0, result: yapi });
            })
                .on('error', e => {
                rs({ code: 2, message: `[ERROR]: ${e.message}` });
            });
        });
    });
}
function download(url) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const yapiJSON = url.match(/^http/g) ? yield downloadYapi(url) : require(url);
        return yapiJSON;
    });
}
function parseYapi(result = []) {
    const list = result.reduce((acc, curr) => acc.concat(...curr.list.map(item => {
        return {
            method: item.method,
            title: item.title,
            path: item.path,
            req_body_type: item.req_body_type,
            req_body_other: item.req_body_other,
            res_body_type: item.res_body_type,
            res_body: item.res_body
        };
    })), []);
    return list;
}
//# sourceMappingURL=download.js.map