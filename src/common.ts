export enum Type {
  JSON = 'json',
  FORM = 'form',
}
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

export type FileInfo = {
  method: string;
  path: string;
  name: string;
  lines: string;
};

export type APIType = {
  title: string; // 接口名
  method: string; // 请求方法
  path: string; // 请求路径
  key: string;  // 请求路径转key
  type: string; // 请求类型 form/json
  requestSchema?: string; // 请求参数schema
  responseSchema?: string; // 返回参数schema
}

export type ConfigType = {
  apiUrl: string;
  append: string;
  output: string;
  includeReg: string[];
  excludeReg: string[];
}