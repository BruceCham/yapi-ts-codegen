import type { ListItem, QueryTypeSchemaResult } from "./common.d";
export declare function quicktypeJSONSchema(list: ListItem[]): Promise<QueryTypeSchemaResult[]>;
export declare function quicktypeJSONSchemaSingle(request: ListItem): Promise<{
    name: string;
    path: string;
    lines: string;
}>;
