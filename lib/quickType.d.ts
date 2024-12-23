import type { ListItem, QueryTypeSchemaInfo, QueryTypeSchemaResult } from "./common.d";
export declare function quicktypeJSONSchema(list: ListItem[]): Promise<QueryTypeSchemaResult[]>;
export declare function quicktypeJSONSchemaSingle(request: QueryTypeSchemaInfo): Promise<{
    name: string;
    lines: string;
}>;
