import * as request from 'request';
import type { ResultItem } from './common';

async function downloadYapi(url: string) {
  return new Promise<{ code: number; message?: string; result?: ResultItem[] }>(rs => {
    request
      .get(url, (err, { body }) => {
        let error = '';
        let yapi: any;
        if (err) {
          error = `[ERROR]: download ${url} faild with ${err}`;
        } else {
          try {
            yapi = JSON.parse(body);
          } catch (e: any) {
            error = `[ERROR]: parse yapi to json from ${url} faild with ${e.message}`;
          }
        }
        rs(error ? { code: 2, message: error } : { code: 0, result: yapi });
      })
      .on('error', e => {
        rs({ code: 2, message: `[ERROR]: ${e.message}` });
      });
  });
}

export async function download(url: string) {
  const yapiJSON = url.match(/^http/g) ? await downloadYapi(url) : require(url);
  return yapiJSON;
}