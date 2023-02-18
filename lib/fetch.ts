import { extend } from 'umi-request'

export const request = extend({
  prefix: process.env.NEXT_PUBLIC_SERVER_URL,
  timeout: 10000,
})
