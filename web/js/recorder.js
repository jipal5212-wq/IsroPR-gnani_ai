// Space Bharat — Audio Recorder Helper (MediaRecorder API)

export class AudioRecorder {
  constructor({ onStart, onTick, onStop, onError }) {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.maxSeconds = 30; // 30s default limit per spec

    this.onStart = onStart || (() => {});
    this.onTick = onTick || (() => {});
    this.onStop = onStop || (() => {});
    this.onError = onError || (() => {});
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Check supported MIME type
      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else {
          mimeType = '';
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : {});
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        this.elapsedSeconds = 0;
        this.timerInterval = setInterval(() => {
          this.elapsedSeconds++;
          this.onTick(this.elapsedSeconds);
          if (this.elapsedSeconds >= this.maxSeconds) {
            this.stop();
          }
        }, 1000);
        this.onStart();
      };

      this.mediaRecorder.start(100); // 100ms slice
    } catch (err) {
      console.error('Microphone error:', err);
      this.onError(err);
    }
  }

  async stop() {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') return null;

    clearInterval(this.timerInterval);

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        // Stop all audio tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        this.onStop(audioBlob, this.elapsedSeconds);
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    clearInterval(this.timerInterval);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.onstop = null; // Discard chunks
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}
