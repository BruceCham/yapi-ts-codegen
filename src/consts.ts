import * as path from 'path';

export const ConfigName = 'ytsconfig';
export const ProjectDir = process.cwd();
export const ConfigDir = path.join(ProjectDir, `${ConfigName}.js`);
