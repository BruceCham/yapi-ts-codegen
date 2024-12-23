"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quicktypeJSONSchema = quicktypeJSONSchema;
exports.quicktypeJSONSchemaSingle = quicktypeJSONSchemaSingle;
const tslib_1 = require("tslib");
const quicktype_core_1 = require("quicktype-core");
const utils_1 = require("./utils");
function quicktypeJSONSchema(list) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = [];
        list.forEach((item) => {
            const { path, req_body_other, res_body } = item;
            const prefixed = (0, utils_1.convertPathToName)(path);
            result.push({
                name: `${prefixed}Req`,
                schema: req_body_other
            });
            result.push({
                name: `${prefixed}Res`,
                schema: res_body
            });
        });
        return yield Promise.all(result.map(quicktypeJSONSchemaSingle));
    });
}
function quicktypeJSONSchemaSingle(request) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const schemaInput = new quicktype_core_1.JSONSchemaInput(new quicktype_core_1.FetchingJSONSchemaStore());
        const { name, schema } = request;
        yield schemaInput.addSource({ name, schema });
        const inputData = new quicktype_core_1.InputData();
        inputData.addInput(schemaInput);
        const { lines } = yield (0, quicktype_core_1.quicktype)({
            inputData,
            lang: 'ts',
        });
        return { name, lines: lines.join('\n') };
    });
}
//# sourceMappingURL=quickType.js.map