/**
 * O php-wasm nem sempre separa aviso/erro do PHP (`Warning`, `Notice`, `Parse error`...)
 * do canal normal de saída — muita coisa sai misturada com o `echo` do aluno, no mesmo
 * texto (ver `PhpEnginePort.run`). Por isso a checagem de "isso parece um erro?" é feita
 * pelo próprio texto, não por qual canal (stdout/stderr) ele veio.
 */
export function phpLooksLikeError(text: string): boolean {
  return /\b(Parse error|Fatal error|Warning|Notice|Deprecated):/i.test(text);
}

/** Traduz mensagens de erro comuns do PHP em dicas para iniciantes, mesmo espírito de `hintFor` (SQL). */
export function phpHintFor(msg: string): string {
  let m: RegExpMatchArray | null;
  if ((m = msg.match(/syntax error, unexpected (.+?)(?:,|\s+in\s)/))) {
    return `Erro de sintaxe perto de ${m[1]}. Procure um ; faltando na linha de cima, ou um parêntese/chave sem fechar.`;
  }
  if (/syntax error, unexpected end of file/.test(msg)) {
    return 'O arquivo terminou antes da hora: falta fechar uma chave { }, parêntese ( ) ou colchete [ ].';
  }
  if ((m = msg.match(/Undefined variable \$(\w+)/))) {
    return `A variável $${m[1]} não foi definida antes de ser usada. Toda variável em PHP começa com $.`;
  }
  if ((m = msg.match(/Call to undefined function (\w+)\(\)/))) {
    return `Não existe nenhuma função chamada ${m[1]}(). Confira a grafia — PHP diferencia maiúsculas de minúsculas em nomes de variáveis, mas não em nomes de função.`;
  }
  if (/Undefined array key/.test(msg)) {
    return 'Essa posição não existe no array. Confira o índice (arrays começam em 0) ou se a chave foi escrita certo.';
  }
  if (/Division by zero/.test(msg)) {
    return 'Divisão por zero: confira se o divisor pode mesmo ser 0 antes de dividir.';
  }
  return '';
}
