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
  if (muted) stopHubAmbience(0.3);
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

/**
 * Navegadores só liberam áudio depois de um toque do aluno. Se o contexto nasceu suspenso
 * (ex.: o mapa abriu direto, sem clique), o primeiro toque/tecla em qualquer lugar o acorda.
 */
let waitingGesture = false;
function resumeOnFirstGesture(audio: AudioContext): void {
  if (audio.state !== 'suspended') return;
  void audio.resume().catch(() => undefined);
  if (waitingGesture) return;
  waitingGesture = true;
  const wake = () => {
    waitingGesture = false;
    void audio.resume().catch(() => undefined);
    window.removeEventListener('pointerdown', wake);
    window.removeEventListener('keydown', wake);
  };
  window.addEventListener('pointerdown', wake, { once: true });
  window.addEventListener('keydown', wake, { once: true });
}

/** Contexto pronto para um efeito pontual agora, ou null se mudo/sem suporte/sem toque ainda. */
function ready(): AudioContext | null {
  if (readMuted()) return null;
  const audio = getContext();
  if (!audio) return null;
  resumeOnFirstGesture(audio);
  return canPlayNow(audio) ? audio : null;
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

/**
 * Efeitos pontuais só tocam se o aluno já tocou na página: sem isso, o som ficaria preso no
 * contexto suspenso e sairia atrasado, fora de hora, no primeiro toque.
 */
function canPlayNow(audio: AudioContext): boolean {
  if (audio.state === 'running') return true;
  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  return activation ? activation.hasBeenActive : true;
}

function play(notes: Array<[freq: number, offset: number, duration: number, type: WaveShape, peak: number]>): void {
  const audio = ready();
  if (!audio) return;
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

/** Ruído branco reaproveitado (2 s) — base dos "whoosh" filtrados. */
let noiseBuffer: AudioBuffer | null = null;
function getNoise(audio: AudioContext): AudioBuffer {
  if (!noiseBuffer || noiseBuffer.sampleRate !== audio.sampleRate) {
    noiseBuffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}


/* ------------------------------------------------------------------------------------ */
/* Ambiente do hub: um pad calmo e espaçado, com "estrelas" pingando de vez em quando.    */
/* ------------------------------------------------------------------------------------ */

type Ambience = { master: GainNode; stopAll: () => void; timer: number | null; stopped: boolean };
let ambience: Ambience | null = null;

/** Acorde aberto (Dó com 9ª e 7ª maior): soa sereno, "espacial", sem tensão. */
const PAD_NOTES = [130.81, 196.0, 246.94, 293.66];
/** Pentatônica de Dó, oitava alta: qualquer combinação soa bem por cima do pad. */
const SPARKLE_NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
const AMBIENCE_LEVEL = 0.05;

/**
 * Liga o som ambiente do mapa (idempotente: chamar de novo não duplica). Entra em
 * fade-in de ~3 s; pausa sozinho quando a aba fica escondida e volta ao reaparecer.
 */
export function startHubAmbience(): void {
  if (readMuted()) return;
  const audio = getContext();
  if (!audio) return;
  // O ambiente pode nascer suspenso: o fade-in começa quando o primeiro toque acordar o áudio.
  resumeOnFirstGesture(audio);
  if (ambience && !ambience.stopped) return;

  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, audio.currentTime);
  master.gain.linearRampToValueAtTime(AMBIENCE_LEVEL, audio.currentTime + 3);
  master.connect(audio.destination);

  const filter = audio.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  filter.Q.value = 0.6;
  filter.connect(master);

  // "Respiração": um LFO bem lento abre e fecha o filtro, como maré.
  const lfo = audio.createOscillator();
  const lfoDepth = audio.createGain();
  lfo.frequency.value = 0.07;
  lfoDepth.gain.value = 260;
  lfo.connect(lfoDepth);
  lfoDepth.connect(filter.frequency);
  lfo.start();

  const sources: AudioScheduledSourceNode[] = [lfo];
  PAD_NOTES.forEach((freq, i) => {
    for (const detune of [-6, 6]) {
      const osc = audio.createOscillator();
      const g = audio.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = detune;
      g.gain.value = i === 0 ? 0.5 : 0.22;
      osc.connect(g);
      g.connect(filter);
      osc.start();
      sources.push(osc);
    }
  });

  const state: Ambience = {
    master,
    timer: null,
    stopped: false,
    stopAll: () => {
      for (const src of sources) {
        try {
          src.stop();
        } catch {
          // já parado
        }
      }
      master.disconnect();
    },
  };

  const sparkle = () => {
    if (state.stopped) return;
    if (!document.hidden && audio.state === 'running') {
      const freq = SPARKLE_NOTES[Math.floor(Math.random() * SPARKLE_NOTES.length)];
      const osc = audio.createOscillator();
      const g = audio.createGain();
      const t = audio.currentTime;
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.1, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 2.5);
    }
    state.timer = window.setTimeout(sparkle, 3500 + Math.random() * 4500);
  };
  state.timer = window.setTimeout(sparkle, 2500);

  ambience = state;
  document.addEventListener('visibilitychange', onVisibility);
}

function onVisibility(): void {
  const audio = sharedContext;
  if (!audio || !ambience || ambience.stopped) return;
  const g = ambience.master.gain;
  const t = audio.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(document.hidden ? 0.0001 : AMBIENCE_LEVEL, t + (document.hidden ? 0.3 : 1.5));
}

/** Desliga o ambiente com fade-out (segundos). Seguro chamar mesmo se nunca ligou. */
export function stopHubAmbience(fade = 0.8): void {
  const current = ambience;
  const audio = sharedContext;
  if (!current || current.stopped) return;
  current.stopped = true;
  ambience = null;
  document.removeEventListener('visibilitychange', onVisibility);
  if (current.timer !== null) window.clearTimeout(current.timer);
  if (!audio) {
    current.stopAll();
    return;
  }
  const g = current.master.gain;
  const t = audio.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(Math.max(g.value, 0.0001), t);
  g.exponentialRampToValueAtTime(0.0001, t + fade);
  window.setTimeout(current.stopAll, fade * 1000 + 100);
}

/* ------------------------------------------------------------------------------------ */
/* Efeitos pontuais                                                                      */
/* ------------------------------------------------------------------------------------ */

/**
 * Ser sugado pelo vórtice de uma era (~1,2 s): um vento filtrado que sobe e fecha, um grave
 * que despenca como gravidade e, no fim, um "pum" macio de chegada. Acompanha a animação.
 */
export function playVortexSound(duration = 1.15): void {
  const audio = ready();
  if (!audio) return;
  const t = audio.currentTime;

  const noise = audio.createBufferSource();
  noise.buffer = getNoise(audio);
  const band = audio.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 4;
  band.frequency.setValueAtTime(250, t);
  band.frequency.exponentialRampToValueAtTime(2400, t + duration * 0.8);
  band.frequency.exponentialRampToValueAtTime(400, t + duration + 0.3);
  const ng = audio.createGain();
  ng.gain.setValueAtTime(0.0001, t);
  ng.gain.exponentialRampToValueAtTime(0.14, t + duration * 0.75);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.35);
  noise.connect(band);
  band.connect(ng);
  ng.connect(audio.destination);
  noise.start(t);
  noise.stop(t + duration + 0.4);

  // Grave caindo: a "gravidade" do buraco negro.
  const sub = audio.createOscillator();
  const sg = audio.createGain();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(190, t);
  sub.frequency.exponentialRampToValueAtTime(42, t + duration);
  sg.gain.setValueAtTime(0.0001, t);
  sg.gain.linearRampToValueAtTime(0.13, t + duration * 0.5);
  sg.gain.exponentialRampToValueAtTime(0.0001, t + duration + 0.2);
  sub.connect(sg);
  sg.connect(audio.destination);
  sub.start(t);
  sub.stop(t + duration + 0.25);

  // Brilho girando: um tom agudo com vibrato acelerando, como algo em órbita.
  const shimmer = audio.createOscillator();
  const shg = audio.createGain();
  const wob = audio.createOscillator();
  const wobDepth = audio.createGain();
  shimmer.type = 'triangle';
  shimmer.frequency.setValueAtTime(660, t);
  shimmer.frequency.exponentialRampToValueAtTime(1320, t + duration);
  wob.frequency.setValueAtTime(3, t);
  wob.frequency.linearRampToValueAtTime(14, t + duration);
  wobDepth.gain.value = 30;
  wob.connect(wobDepth);
  wobDepth.connect(shimmer.frequency);
  shg.gain.setValueAtTime(0.0001, t);
  shg.gain.linearRampToValueAtTime(0.035, t + duration * 0.6);
  shg.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  shimmer.connect(shg);
  shg.connect(audio.destination);
  shimmer.start(t);
  wob.start(t);
  shimmer.stop(t + duration + 0.05);
  wob.stop(t + duration + 0.05);

  // Chegada: um acorde grave e curto, sem estalo.
  tone(audio, 98, duration, 0.7, 'sine', 0.12);
  tone(audio, 147, duration + 0.02, 0.6, 'sine', 0.06);
}

/** Toque macio ao selecionar algo no mapa (era, praça, Eco). */
export function playSelectSound(): void {
  play([
    [880, 0, 0.09, 'sine', 0.07],
    [1175, 0.05, 0.14, 'sine', 0.06],
  ]);
}

/**
 * "Voz" da Senhorita Sintaxe ao falar uma nova fala: três bipes rápidos com altura
 * levemente aleatória, no estilo de balão de diálogo de jogo, bem baixinho.
 */
export function playSintaxeTalkSound(): void {
  const base = 620 + Math.random() * 120;
  play([
    [base, 0, 0.05, 'triangle', 0.06],
    [base * 1.12, 0.06, 0.05, 'triangle', 0.055],
    [base * (Math.random() < 0.5 ? 0.94 : 1.26), 0.12, 0.07, 'triangle', 0.05],
  ]);
}

/** Chama da sequência acendendo: um sopro quente e duas notas sobem. */
export function playStreakSound(): void {
  const audio = ready();
  if (!audio) return;
  const t = audio.currentTime;
  const noise = audio.createBufferSource();
  noise.buffer = getNoise(audio);
  const lp = audio.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.07, t + 0.15);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
  noise.connect(lp);
  lp.connect(g);
  g.connect(audio.destination);
  noise.start(t);
  noise.stop(t + 0.6);
  tone(audio, 587, 0.18, 0.22, 'triangle', 0.12);
  tone(audio, 880, 0.3, 0.45, 'triangle', 0.13);
}

/** Golpe certo no chefão: um impacto grave curto com um brilho por cima. */
export function playBossHitSound(): void {
  const audio = ready();
  if (!audio) return;
  const t = audio.currentTime;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(55, t + 0.2);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.18, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
  osc.connect(g);
  g.connect(audio.destination);
  osc.start(t);
  osc.stop(t + 0.3);
  tone(audio, 988, 0.03, 0.18, 'triangle', 0.08);
}

/** Levou dano do chefão (o Eco): um "glitch" curto e abafado, sem assustar. */
export function playGlitchSound(): void {
  play([
    [233, 0, 0.06, 'square', 0.035],
    [311, 0.06, 0.05, 'square', 0.03],
    [185, 0.12, 0.16, 'square', 0.03],
  ]);
}

/** Chefão vencido / era estabilizada: arpejo que sobe e abre num acorde. */
export function playVictorySound(): void {
  play([
    [523, 0, 0.16, 'triangle', 0.13],
    [659, 0.12, 0.16, 'triangle', 0.13],
    [784, 0.24, 0.16, 'triangle', 0.13],
    [1047, 0.36, 0.9, 'triangle', 0.12],
    [659, 0.36, 0.9, 'sine', 0.08],
    [392, 0.36, 1.0, 'sine', 0.08],
  ]);
}

/** Derrota no chefão: três notas descendo devagar, mais consolo que castigo. */
export function playDefeatSound(): void {
  play([
    [392, 0, 0.3, 'sine', 0.09],
    [330, 0.22, 0.3, 'sine', 0.09],
    [262, 0.44, 0.6, 'sine', 0.09],
  ]);
}
