'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useToggle } from 'usehooks-ts';
import { Input, Toggle } from '@elpassion/taco';
import { MicrophoneRecorder } from '~/components';

interface AudioInputProps {
  name: string;
}

export const AudioInput = ({ name }: AudioInputProps) => {
  const [isToggled, toggle] = useToggle();

  const { register } = useFormContext(); // retrieve all hook methods

  return (
    <>
      <div>
        <Toggle
          labelText=""
          onChange={function noRefCheck() {
            toggle();
          }}
          size="md"
          value="value"
          checked={isToggled}
        />

        <div className="mb-4" />

        {isToggled ? (
          <Input
            id={name}
            type={'file'}
            accept="audio/*"
            placeholder="Upload audio file..."
            required
            {...register(name)}
            // disabled
            // onChange={(e) => {
            //   if (e.target.files) {
            //     // console.log(e.target.files[0]);
            //   }
            // }}
          />
        ) : (
          <>MicrophoneRecorder goes here</>
          // <MicrophoneRecorder
          //   name={name}
          //   onStartCallback={async (event) => {
          //     console.log(await event.data.arrayBuffer());
          //     // push(
          //     //   `${blockName}:audio_input_1`,
          //     //   await event.data.arrayBuffer(),
          //     // );
          //   }}
          // />
        )}
      </div>
    </>
  );
};
