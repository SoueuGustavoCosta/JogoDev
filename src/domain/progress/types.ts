export type QuizAttemptResult = {
  correct: boolean;
  /** 1 = acertou de primeira. */
  triesUsed: number;
};

export type ModuleProgress = {
  moduleId: string;
  /**
   * Resultado de cada pergunta, pelo `id` dela (ver QuizItem). Até a Etapa 3.5 a chave era
   * a posição da pergunta ("0", "1"...); `migrateQuizResultKeys` converte esse formato
   * antigo ao ler o progresso (formato continua v1).
   */
  quizResults: Record<string, QuizAttemptResult>;
  /**
   * Resultados do formato antigo (por posição) que não correspondem a nenhuma pergunta do
   * conteúdo atual. Guardados intactos, pela posição, em vez de descartados. Não valem XP.
   * Campo opcional (Etapa 3.5): ausente = nada a guardar.
   */
  unmappedQuizResults?: Record<string, QuizAttemptResult>;
  completed: boolean;
  /**
   * Tela em que o viajante parou na lição em telas curtas (posição na lista de
   * `paginateModule`), para voltar de onde parou. Campo novo e opcional (Etapa 3 do plano
   * de engajamento): progresso salvo antes dele continua válido sem migração (chave
   * ausente = começa da primeira tela). Só guia a navegação: nunca vale XP nem conclusão.
   */
  screen?: number;
};

export type TrailProgress = {
  trailId: string;
  modules: Record<string, ModuleProgress>;
  missionsCompleted: Record<string, boolean>;
  trophyAwarded: boolean;
  /** Insígnia do chefe de fase de fim de era conquistada. Campo novo e opcional: progresso salvo antes dele continua válido sem migração (chave simplesmente ausente). */
  bossDefeated?: boolean;
};

export type Progress = {
  version: number;
  /** Nome do viajante, guardado só no navegador (nunca vai para as métricas). */
  travelerName?: string;
  /**
   * Identificador anônimo do viajante para o Hall dos Viajantes (Supabase). Campo novo
   * e opcional: progresso salvo antes dele continua válido sem migração (chave ausente
   * até a primeira sincronização, quando é gerado com `crypto.randomUUID()`).
   */
  travelerUuid?: string;
  prologueSeen?: boolean;
  trails: Record<string, TrailProgress>;
  /**
   * Insígnias compartilhadas (ver domain/badges), por id -> data ISO de conquista. Campo
   * novo, de nível raiz (as insígnias atravessam trilhas), e opcional: progresso salvo
   * antes dele continua válido sem migração (chave simplesmente ausente).
   */
  badgesEarned?: Record<string, string>;
  /**
   * Cache local do cabeçalho do viajante (avatar + sequência diária), preenchido pelas
   * sincronizações com o Supabase (ver LeaderboardPort/openTimeline/uploadAvatarPhoto) e
   * lido primeiro pela UI, sem esperar rede. Campos novos e opcionais: progresso salvo
   * antes deles continua válido sem migração (chaves simplesmente ausentes).
   */
  avatarUrl?: string;
  streakCurrent?: number;
  streakBest?: number;
  ultimoDiaAtivo?: string;
  /**
   * Cache local do código de recuperação (o Supabase só guarda o hash, nunca o texto puro
   * — ver `supabase/schema.sql`). Guardado aqui pra a tela do Viajante poder mostrar o
   * código de novo a qualquer momento neste aparelho, sem o susto de "só aparece uma vez".
   * Campo novo e opcional: progresso salvo antes dele continua válido sem migração.
   */
  recoveryCode?: string;
  /**
   * Resumo curto e público sobre o viajante ("Estou cursando Ciência da Computação..."),
   * mostrado no Hall dos Viajantes. Cache local do que foi sincronizado com o Supabase
   * (ver `saveBio`). Campo novo e opcional: progresso salvo antes dele continua válido
   * sem migração (chave simplesmente ausente).
   */
  bio?: string;
  /**
   * Marca que o viajante já vinculou telefone+senha (ver `signUpWithPhone`), para
   * a caixa flutuante "Salvar progresso" não aparecer de novo neste aparelho depois
   * disso. Campo novo e opcional: progresso salvo antes dele continua válido sem
   * migração (chave simplesmente ausente, tratada como "ainda não vinculou").
   */
  phoneLinked?: boolean;
  /**
   * O progresso deste aparelho é de uma conta (telefone+senha) cuja sessão se perdeu
   * (expirou, foi encerrada em outro lugar): o app não consegue mais gravar na nuvem
   * dessa conta até a pessoa entrar de novo. Enquanto estiver marcado, nada sobe para a
   * nuvem (subiria para a conta errada) e a tela oferece "Entrar de novo". Campo
   * opcional: ausente = sessão ok.
   */
  needsSignIn?: boolean;
  /**
   * Preferência do viajante pelo "Modo leitura" (`rolagem`) em vez das telas curtas.
   * Campo novo e opcional (Etapa 3): ausente = padrão do app (`config/exploration.ts`).
   */
  lessonMode?: LessonMode;
  /**
   * Cópia de segurança dos resultados do quiz por id (trilha -> módulo -> id da pergunta),
   * na raiz do progresso. Existe só para a transição da Etapa 3.5: o app antigo (aba
   * aberta durante o deploy) junta cópias com um merge que descarta as chaves por id de
   * dentro dos módulos, mas preserva campos da raiz que não conhece. O app novo restaura
   * daqui o que tiver sumido (ver `quizBackup.ts`). Campo opcional.
   * TODO(autor): remover a partir de 2026-10-24 (4 semanas depois da Etapa 3.5).
   */
  quizBackup?: QuizBackup;
  /**
   * Anomalias do Dia consertadas, por dia (AAAA-MM-DD, fuso de São Paulo). Cada registro
   * guarda o que foi ganho (XP e Fragmentos Temporais): é o histórico de ganhos que a
   * Etapa 9 usa como base da moeda. Campo novo e opcional (Etapa 7).
   */
  anomalies?: Record<string, AnomalyResult>;
  /**
   * Linha do Tempo (Etapa 8). A sequência continua em streakCurrent/streakBest/ultimoDiaAtivo
   * (agora contada só em dias jogados); estes campos novos e opcionais guardam o resto:
   * âncoras guardadas, a era em que o Eco está, os dias jogados e ancorados recentes e o dia
   * em que a linha ramificou.
   */
  anchors?: number;
  ecoEra?: number;
  playedDays?: string[];
  anchoredDays?: string[];
  lineBrokenOn?: string;
  /** Última lição aberta, para o "Continuar de onde parou" da tela Início. Opcional (Etapa 7). */
  lastLesson?: { trailId: string; moduleId: string; at: string };
  /**
   * Fragmentos Temporais (Etapa 9): histórico de ganhos e gastos, cada lançamento com id
   * único. O saldo nunca é guardado, é calculado daqui (ver `fragments.ts`). Os ganhos das
   * anomalias não entram aqui: vêm de `anomalies`. Campo novo e opcional.
   */
  fragmentLedger?: FragmentEntry[];
  /** Cosméticos equipados no avatar: encaixe (moldura, cor, acessório, cabelo) -> id do item. Opcional (Etapa 9). */
  equippedCosmetics?: Record<string, string>;
  /**
   * XP por semana da Liga (Etapa 10): segunda-feira (AAAA-MM-DD) -> fonte -> XP. Só as
   * últimas semanas ficam guardadas. Opcional: ausente = nada ganho desde a Etapa 10.
   */
  weeklyXp?: Record<string, Record<string, number>>;
  /** Semanas (segunda-feira) em que o viajante ficou no top 3 e ganhou o selo. Opcional (Etapa 10). */
  leagueSeals?: string[];
  /** XP extra de eventos (Surto Temporal), por fonte -> XP a mais. Opcional (Etapa 11). */
  xpBonus?: Record<string, number>;
  /** Dias (AAAA-MM-DD) em que venceu o Eco Solto. Opcional (Etapa 11). */
  ecoSoltoWins?: string[];
  /** Oficinas do Viajante resolvidas, por id. Opcional (Etapa 13). */
  workshops?: Record<string, WorkshopResult>;
  /** Quando a tela "Adicionar à tela inicial" apareceu sozinha (uma vez só). Opcional (Etapa 12). */
  installPromptShownAt?: string;
};

/** Uma oficina resolvida (Etapa 13). */
export type WorkshopResult = {
  /** Instante ISO da primeira vez que passou em todos os testes. */
  solvedAt: string;
  /** Linguagens em que já resolveu. */
  langs: string[];
  hintsUsed: number;
  /** XP ganho (50 menos as dicas, nunca abaixo de 20; +25 com o extra). */
  xp: number;
  extra?: boolean;
};

/** Um lançamento de Fragmentos Temporais: `amount` positivo = ganho, negativo = gasto. */
export type FragmentEntry = {
  id: string;
  amount: number;
  /** Instante ISO. */
  at: string;
  /** Item comprado ou ganho (compras e prêmios de evento). */
  itemId?: string;
};

export type AnomalyResult = {
  anomalyId: string;
  /** Tentativas até acertar (1 = de primeira). */
  tries: number;
  /** Instante ISO em que foi consertada. */
  solvedAt: string;
  xp: number;
  fragments: number;
};

/** Resultados do quiz por trilha -> módulo -> id da pergunta. */
export type QuizBackup = Record<string, Record<string, Record<string, QuizAttemptResult>>>;

export type ExplorationMode = 'sequential' | 'free';

/** Como a lição aparece: em telas curtas intercaladas com perguntas, ou tudo numa página ("Modo leitura"). */
export type LessonMode = 'telas' | 'rolagem';
