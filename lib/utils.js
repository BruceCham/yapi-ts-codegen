"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPathToName = convertPathToName;
exports.createFile = createFile;
const fs_1 = require("fs");
const path_1 = require("path");
function convertPathToName(url) {
    const ext = (0, path_1.extname)(url); // 提取扩展名
    const baseName = (0, path_1.basename)(url, ext); // 提取文件名（无扩展名）
    const dirName = (0, path_1.dirname)(url); // 提取文件路径
    const pascalCaseString = dirName
        .replace(/\\/g, '/')
        .split('/')
        .filter(Boolean)
        .flatMap(part => part.split('-'))
        .concat(baseName)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    return pascalCaseString + ext; // 返回带扩展名的 PascalCase 字符串
}
function createFile(filePath, fileContents) {
    (0, fs_1.mkdirSync)((0, path_1.dirname)(filePath), { recursive: true });
    (0, fs_1.writeFileSync)(filePath, fileContents, "utf8");
}
//# sourceMappingURL=utils.js.map