import { rest } from 'msw';
import { ENV } from '~/env.mjs';

const pipelinesRes = {
  data: [],
};

export const pipelinesHandlers = [
  // rest.get(`${ENV.API_URL}/pipelines`, (req, res, ctx) => {
  //   return res(ctx.status(200), ctx.json(pipelinesRes));
  // }),
];
