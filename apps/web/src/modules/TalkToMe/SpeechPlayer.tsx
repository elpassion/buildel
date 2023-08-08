import React from 'react';
import { textToSpeech } from '~/modules/TalkToMe/utils';

// TODO (hub33k): convert to server component

export const SpeechPlayer = ({ text }: { text: string }) => {
  const [audioURL, setAudioURL] = React.useState('');

  // Define a function to fetch the audio data and set the URL state variable
  const handleAudioFetch = async () => {
    // Call the textToSpeech function to generate the audio data for the text "Hello welcome"
    const data = await textToSpeech(text);
    // Create a new Blob object from the audio data with MIME type 'audio/mpeg'
    const blob = new Blob([data], { type: 'audio/mpeg' });
    // Create a URL for the blob object
    const url = URL.createObjectURL(blob);
    // Set the audio URL state variable to the newly created URL
    setAudioURL(url);
  };

  // Use the useEffect hook to call the handleAudioFetch function once when the component mounts
  React.useEffect(() => {
    handleAudioFetch();
  }, []);

  return (
    <>
      <div>
        {audioURL && (
          <audio autoPlay controls>
            <source src={audioURL} type="audio/mpeg" />
          </audio>
        )}
      </div>
    </>
  );
};
