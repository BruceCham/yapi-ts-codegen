# how to use?

## Installation
```bash
npm install yapi-to-ts
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
npx yts
```