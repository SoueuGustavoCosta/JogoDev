export type PrologueChoice = { label: string; next: string };

export type PrologueStep = {
  id: string;
  /** Falas da Sintaxe; `{name}` vira o nome do viajante. */
  say: string[];
  /** Quando presente, o passo pede o nome do viajante e segue para `next`. */
  askName?: { placeholder: string; button: string; next: string };
  choices?: PrologueChoice[];
  /** Passo final: dispara o salto para a primeira era. */
  warp?: { label: string };
};

export type PrologueScript = { start: string; steps: Record<string, PrologueStep> };

export function interpolate(text: string, name: string): string {
  return text.replaceAll('{name}', name);
}

/** Lista os erros do roteiro (passos que apontam para ids inexistentes ou sem saída). */
export function validateScript(script: PrologueScript): string[] {
  const errors: string[] = [];
  if (!script.steps[script.start]) errors.push(`passo inicial "${script.start}" não existe`);
  for (const step of Object.values(script.steps)) {
    const targets = [
      ...(step.choices?.map((c) => c.next) ?? []),
      ...(step.askName ? [step.askName.next] : []),
    ];
    for (const target of targets) {
      if (!script.steps[target]) errors.push(`passo "${step.id}" aponta para "${target}", que não existe`);
    }
    if (!step.warp && !step.askName && !step.choices?.length) {
      errors.push(`passo "${step.id}" não tem saída`);
    }
  }
  return errors;
}
