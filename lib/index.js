"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const download_1 = require("./download");
const quickType_1 = require("./quickType");
const utils_1 = require("./utils");
const OUTPUT_DIR = "./dist";
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const yapiRes = yield (0, download_1.download)('../yapi.json');
        if (yapiRes.code === 0) {
            const content = (0, download_1.parseYapi)(yapiRes.result);
            const results = yield (0, quickType_1.quicktypeJSONSchema)(content);
            for (const { name, lines } of results) {
                console.log(`brucecham ${name}`);
                const outputPath = path_1.default.join(OUTPUT_DIR, `${name}.ts`);
                (0, utils_1.createFile)(outputPath, lines);
            }
        }
    });
}
main();
//# sourceMappingURL=index.js.map