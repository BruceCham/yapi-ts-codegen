"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quicktypeJSONSchema = quicktypeJSONSchema;
exports.quicktypeJSONSchemaSingle = quicktypeJSONSchemaSingle;
const tslib_1 = require("tslib");
const quicktype_core_1 = require("quicktype-core");
function quicktypeJSONSchema(list) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const result = yield Promise.all(list.map(quicktypeJSONSchemaSingle));
        return result.filter(({ lines }) => !!lines);
    });
}
function quicktypeJSONSchemaSingle(request) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const schemaInput = new quicktype_core_1.JSONSchemaInput(new quicktype_core_1.FetchingJSONSchemaStore());
        const { path, req_body_other, res_body } = request;
        try {
            if (req_body_other) {
                const shema = JSON.parse(req_body_other);
                const hasProperty = !!Object.keys(shema.properties).length;
                hasProperty && (yield schemaInput.addSource({ name: 'IRequest', schema: req_body_other }));
            }
        }
        catch (err) { }
        try {
            if (res_body) {
                const shema = JSON.parse(res_body);
                const hasProperty = !!Object.keys(shema.properties).length;
                hasProperty && (yield schemaInput.addSource({ name: 'IResponse', schema: res_body }));
            }
        }
        catch (err) { }
        const inputData = new quicktype_core_1.InputData();
        inputData.addInput(schemaInput);
        try {
            const { lines } = yield (0, quicktype_core_1.quicktype)({
                inputData,
                lang: 'ts',
                rendererOptions: {
                    'just-types': true,
                    'runtime-typecheck': false
                },
            });
            const folder = path.split('/');
            const name = folder[folder.length - 1];
            const pathName = folder.slice(0, folder.length - 1).join('/');
            return { name, path: pathName, lines: lines.join('\n') };
        }
        catch (err) {
            console.error(path, err);
            console.error(req_body_other, res_body);
            return { name: '', path, lines: '' };
        }
    });
}
//# sourceMappingURL=quickType.js.map