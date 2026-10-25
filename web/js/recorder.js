// IsroPR — Audio Recorder Helper (Pure 16kHz Mono PCM WAV via Web Audio API)

export class AudioRecorder {
  constructor({ onStart, onTick, onStop, onError }) {
    this.audioContext = null;
    this.mediaStream = null;
    this.sourceNode = null;
    this.processorNode = null;
    this.pcmChunks = [];
    this.totalSamples = 0;
    this.timerInterval = null;
    this.elapsedSeconds = 0;
    this.maxSeconds = 30; // 30s limit per spec

    this.onStart = onStart || (() => {});
    this.onTick = onTick || (() => {});
    this.onStop = onStop || (() => {});
    this.onError = onError || (() => {});
  }

  async start() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('Web Audio API is not supported in this browser');
      }

      // Initialize AudioContext
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Buffer size: 4096 samples, 1 input channel, 1 output channel
      this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1);
      this.pcmChunks = [];
      this.totalSamples = 0;

      this.processorNode.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Copy samples
        const chunk = new Float32Array(inputData.length);
        chunk.set(inputData);
        this.pcmChunks.push(chunk);
        this.totalSamples += chunk.length;
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.elapsedSeconds = 0;
      this.timerInterval = setInterval(() => {
        this.elapsedSeconds++;
        this.onTick(this.elapsedSeconds);
        if (this.elapsedSeconds >= this.maxSeconds) {
          this.stop();
        }
      }, 1000);

      this.onStart();
    } catch (err) {
      console.error('Microphone error:', err);
      this.cleanup();
      this.onError(err);
    }
  }

  async stop() {
    if (!this.audioContext) return null;

    clearInterval(this.timerInterval);

    // Disconnect audio nodes
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (e) {}
    }
    if (this.processorNode) {
      try { this.processorNode.disconnect(); } catch (e) {}
    }

    const currentSampleRate = this.audioContext.sampleRate || 44100;

    // Stop microphone stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    try {
      await this.audioContext.close();
    } catch (e) {}
    this.audioContext = null;

    // Merge Float32 chunks into a single Float32Array
    const merged = new Float32Array(this.totalSamples);
    let offset = 0;
    for (const chunk of this.pcmChunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Target sample rate: 16000 Hz (optimal for Gnani Prisma STT)
    let finalSamples = merged;
    let targetRate = currentSampleRate;
    if (currentSampleRate !== 16000 && merged.length > 0) {
      finalSamples = downsampleBuffer(merged, currentSampleRate, 16000);
      targetRate = 16000;
    }

    // Convert Float32 to 16-bit PCM WAV Blob
    const wavBlob = encodeWAV(finalSamples, targetRate);

    this.onStop(wavBlob, this.elapsedSeconds);
    return wavBlob;
  }

  cleanup() {
    clearInterval(this.timerInterval);
    if (this.sourceNode) {
      try { this.sourceNode.disconnect(); } catch (e) {}
      this.sourceNode = null;
    }
    if (this.processorNode) {
      try { this.processorNode.disconnect(); } catch (e) {}
      this.processorNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch (e) {}
      this.audioContext = null;
    }
  }

  cancel() {
    this.cleanup();
    this.pcmChunks = [];
    this.totalSamples = 0;
  }
}

// Write standard 44-byte RIFF/WAVE header and 16-bit linear PCM
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for linear PCM)
  view.setUint16(22, 1, true); // NumChannels (1 mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * 1 channel * 2 bytes/sample)
  view.setUint16(32, 2, true); // BlockAlign (1 channel * 2 bytes/sample)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  // Write 16-bit signed PCM samples
  let index = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    index += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// High quality linear downsampling for STT
function downsampleBuffer(buffer, sampleRate, outSampleRate) {
  if (outSampleRate === sampleRate || outSampleRate > sampleRate) {
    return buffer;
  }
  const sampleRateRatio = sampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}
