import React from 'react';
import { TalkToMe } from '~/modules/TalkToMe';

const OPENAI_API_URL = 'https://api.openai.com/v1/completions';

export const TalkToMePage = () => {
  return (
    <div>
      <h2 className="text-xl">Talk To Me</h2>

      <div className="mb-4" />

      <TalkToMe />

      {/*{Array.from({ length: 100 }).map((_, i) => {*/}
      {/*  return <p key={i}>item {i + 1}</p>;*/}
      {/*})}*/}
    </div>
  );
};
