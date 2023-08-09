import { Channel } from 'phoenix';

export function ppush(channel: Channel, event: string, payload: any) {
  return new Promise((resolve, reject) => {
    console.log("ppush '%s' payload:", event, payload);
    channel
      .push(event, payload)
      .receive('ok', (resp: any) => {
        console.log('received ok: ', resp);
        resolve(resp);
      })
      .receive('error', (resp: any) => {
        console.log('received error: ', resp);
        reject(resp);
      });
  });
}

export async function streamMedia(channel: Channel) {
  const constraints = { audio: true };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = async (e) => {
    channel.push('block_input_audio_input', await e.data.arrayBuffer());
  };

  mediaRecorder.start(250);
  return mediaRecorder;
}
