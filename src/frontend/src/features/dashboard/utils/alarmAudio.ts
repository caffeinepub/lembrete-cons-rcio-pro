// Simple alarm audio utility using Web Audio API
let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;

export function playAlarm(): void {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Stop any existing alarm
    stopAlarm();
    
    // Create oscillator for beep sound
    oscillator = audioContext.createOscillator();
    gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure alarm sound (800Hz beep)
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    // Set volume
    gainNode.gain.value = 0.3;
    
    // Start the alarm
    oscillator.start();
    
    // Create pulsing effect
    const now = audioContext.currentTime;
    for (let i = 0; i < 10; i++) {
      gainNode.gain.setValueAtTime(0.3, now + i * 0.5);
      gainNode.gain.setValueAtTime(0, now + i * 0.5 + 0.2);
    }
  } catch (error) {
    console.error('Error playing alarm:', error);
  }
}

export function stopAlarm(): void {
  try {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
  } catch (error) {
    console.error('Error stopping alarm:', error);
  }
}
