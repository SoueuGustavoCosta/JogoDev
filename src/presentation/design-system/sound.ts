/**
 * Sons curtos de reação (acerto/erro), sintetizados na hora com a Web Audio API — sem
 * nenhum arquivo de áudio pra baixar, cada "ding"/"buzz" é gerado por osciladores, então
 * o custo pro carregamento do app é zero. Preferência de mudo guardada no navegador: é
 * estado de apresentação (como o `hasSeenTrailIntro`), não progresso do aluno, por isso
 * não passa por `ProgressRepository`.
 */
const MUTE_KEY = 'viajante:sound-muted';

function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

export function isSoundMuted(): boolean {
  return readMuted();
}

export function setSoundMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // Modo privado ou storage bloqueado: a preferência só não persiste, sem quebrar nada.
  }
}

/** Mesmas opções de `OscillatorNode.type`, escritas por extenso (o eslint deste projeto não reconhece o tipo global `OscillatorType` em posição de tipo). */
type WaveShape = 'sine' | 'square' | 'sawtooth' | 'triangle';

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedContext) sharedContext = new Ctor();
  return sharedContext;
}

/** Uma nota curta com ataque suave e cauda em decaimento exponencial (sem estalo). */
function tone(audio: AudioContext, freq: number, startOffset: number, duration: number, type: WaveShape, peak: number): void {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = audio.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function play(notes: Array<[freq: number, offset: number, duration: number, type: WaveShape, peak: number]>): void {
  if (readMuted()) return;
  const audio = getContext();
  if (!audio) return;
  if (audio.state === 'suspended') void audio.resume();
  for (const [freq, offset, duration, type, peak] of notes) {
    tone(audio, freq, offset, duration, type, peak);
  }
}

/** Dois tons subindo — o "ding-ding" de acerto. */
export function playCorrectSound(): void {
  play([
    [659, 0, 0.12, 'triangle', 0.16],
    [880, 0.09, 0.18, 'triangle', 0.16],
  ]);
}

/** Dois tons descendo e mais graves — o "vups" de errar, sem soar punitivo. */
export function playWrongSound(): void {
  play([
    [220, 0, 0.14, 'sine', 0.12],
    [175, 0.08, 0.2, 'sine', 0.12],
  ]);
}

/** Três notas subindo — fanfarra curta ao concluir um módulo. */
export function playModuleCompleteSound(): void {
  play([
    [523, 0, 0.14, 'triangle', 0.15],
    [659, 0.12, 0.14, 'triangle', 0.15],
    [784, 0.24, 0.32, 'triangle', 0.17],
  ]);
}

/** Toque de teste curto, usado só quando o aluno reativa o som nas Configurações. */
export function playTestSound(): void {
  play([[523, 0, 0.16, 'triangle', 0.16]]);
}
