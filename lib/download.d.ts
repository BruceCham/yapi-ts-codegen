import type { ListItem, ResultItem } from './common';
export declare function download(url: string): Promise<any>;
export declare function parseYapi(result?: ResultItem[]): ListItem[];
