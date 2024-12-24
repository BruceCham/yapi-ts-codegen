"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const download_1 = require("./download");
const quickType_1 = require("./quickType");
const utils_1 = require("./utils");
const OUTPUT_DIR = "./dist";
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const yapiRes = yield (0, download_1.download)('https://yapi.zuoyebang.cc/api/open/plugin/export-full?type=json&pid=776&status=all&token=9b0dd87aae70d4febec746dec86679b965185fd56c4377e8f48bf2cacbca2db3');
        if (yapiRes.code === 0) {
            const content = (0, download_1.parseYapi)(yapiRes.result);
            const results = yield (0, quickType_1.quicktypeJSONSchema)(content);
            for (const { name, path, lines } of results) {
                const outputPath = (0, path_1.join)(OUTPUT_DIR, path, `${name}.ts`);
                (0, utils_1.createFile)(outputPath, lines);
            }
        }
    });
}
main();
//# sourceMappingURL=index.js.map