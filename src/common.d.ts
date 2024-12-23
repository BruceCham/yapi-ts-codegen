export type ResultItem = {
  index: number;
  name: string;
  list: ListItem[];
}
export type ListItem = {
  method: string;
  title: string;
  path: string;
  req_body_type: string;
  req_body_other: string;
  res_body_type: string;
  res_body: string;
}

export type QueryTypeSchemaInfo = {
  name: string;
  schema: string;
}

export type QueryTypeSchemaResult = {
  name: string;
  lines: string;
};