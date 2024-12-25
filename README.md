# how to use?
`Yapi codegen ts` can automatically generate type definitions for each layer based on the data structure returned by YAPI. Additionally, it allows you to configure whether to generate request functions.

## Installation  

```bash
npm install yapi-ts-codegen
```


## Generate config file  

```bash
npx yts --init
```

config file demo  

```js
{
  // yapi url, you can get it from project setting
  "apiUrl": "https://yapi.xxx.com/api/open/plugin/export-full?type=json&pid=111&status=all&token=token",
  
  // request function, you can use "" to remove it
  "append": `import request from '@/api/request';`,

  // clear the generated files
  "clear": true,

  // save error logs or not  yts.error.log
  "saveErrLog": true,

  // output
  "output": 'src/api-type',

  // includeReg for filter
  "includeReg": [/api|apiv2/g],
  
  // excludeReg for filter
  "excludeReg": [/\?act=.+$/],
}
```

## Run it  

```bash
npx yts --clear
```

## Demo 

### Schema data
```json
// monthbill api name
{
  "$schema":"http://json-schema.org/draft-04/schema#",
  "type":"object",
  "properties": {
    "startMonth":{ 
      "type":"string"
    },
    "endMonth": {
      "type":"string",
      "description":"2024-10"
    }
  },
  "required": ["startMonth","endMonth"]
}

{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "errNo": {
      "type": "number"
    },
    "errstr": {
      "type": "string"
    },
    "data": {
      "type": "object",
      "properties": {
        "contents": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "month": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "fullName": {
                "type": "string"
              },
              "feeType": {
                "type": "string"
              },
              "fee": {
                "type": "number"
              },
              "feeDetail": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "count": {
                      "type": "number"
                    },
                    "type": {
                      "type": "string"
                    },
                    "price": {
                      "type": "number"
                    }
                  },
                  "required": ["count", "type", "price"]
                }
              },
              "productName": {
                "type": "string"
              },
              "appName": {
                "type": "string"
              }
            },
            "required": ["month", "name", "fullName", "feeType", "fee", "feeDetail", "productName", "appName"]
          }
        },
        "sumFee": {
          "type": "number"
        }
      }
    }
  }
}
```

### Output type data
```ts
import request from '@/api/request';

export interface PostMonthbillReq {
    endMonth:   string;
    startMonth: string;
    [property: string]: any;
}

export interface PostMonthbill {
    data?:   PostMonthbillData;
    errNo?:  number;
    errstr?: string;
    [property: string]: any;
}

export interface PostMonthbillData {
    contents?: PostMonthbillContent[];
    sumFee?:   number;
    [property: string]: any;
}

export interface PostMonthbillContent {
    appName:     string;
    fee:         number;
    feeDetail:   PostMonthbillFeeDetail[];
    feeType:     string;
    fullName:    string;
    month:       string;
    name:        string;
    productName: string;
    [property: string]: any;
}

export interface PostMonthbillFeeDetail {
    count: number;
    price: number;
    type:  string;
    [property: string]: any;
}

export async function apiPostMonthbill(data: PostMonthbillReq): Promise<PostMonthbill> {
  return request({
    url: '/monthbill',
    method: 'POST',
    headers: {
      "content-type": 'application/json',
    },
    data: data,
  });
}
```