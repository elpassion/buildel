// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import topbar from "../vendor/topbar"

let csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
let liveSocket = new LiveSocket("/live", Socket, {params: {_csrf_token: csrfToken}})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

let socket = new Socket("/socket");
socket.connect();

let channel = socket.channel(`audio_conversations:${Math.random()}`, {});

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

window.channel = channel;

let audio = null;

channel.on("speech_to_text_output", (payload) => {
  console.log("speech_to_text_output", payload);
})
channel.on("chat_sentences_output", (payload) => {
  console.log("chat_sentences_output", payload);
})


let isPlaying = false;
let buffers = [];

async function playBuffer() {
  if (isPlaying) return;
  if (buffers.length > 0) {
    isPlaying = true;
    const ctx = new AudioContext();
    const buffer = buffers.shift();
    const audioBuffer = await ctx.decodeAudioData(buffer);
    const source = ctx.createBufferSource();
    source.addEventListener("ended", () => {
      isPlaying = false;
      playBuffer();
    });
    source.connect(ctx.destination);
    source.buffer = audioBuffer;
    source.start();
  } else {
    isPlaying = false;
  }
}

channel.on("text_to_speech_output", (audioBuffer) => {
  console.log("text_to_speech_output", audioBuffer)
  buffers.push(audioBuffer);
  playBuffer();
})

async function streamMedia() {
  const constraints = { audio: true };
  const stream = await  navigator.mediaDevices
    .getUserMedia(constraints);
  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = async (e) => {
    channel.push("block_input_audio_input", await e.data.arrayBuffer());
  }
  mediaRecorder.start(250);
  return mediaRecorder;
}

window.streamMedia = streamMedia;
