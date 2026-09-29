import type { Trail } from '@/domain/trail/types';
import { ramFastapiModules } from './modules';

/**
 * Ramificação FastAPI (Evento Nexus da Lua de Python). Conteúdo original, com base só na
 * documentação oficial do FastAPI (links no fim de cada trilha).
 */
export const ramFastapiTrail: Trail = {
  id: 'ram-fastapi',
  title: 'Ramificação FastAPI',
  tagline: 'APIs rápidas, com tipos que validam tudo e documentação que se escreve sozinha.',
  symbol: 'ram-fastapi',
  accent: '#b6ff3d',
  eyebrow: 'Ramificação de Python · FastAPI',
  intro: [
    'Viajante, a segunda Ramificação de Python é feita de APIs: endereços que respondem dados em JSON para outros programas.',
    'Quem mora aqui é a <b>Hidra 422</b>. Cada vez que um dado chega no formato errado, ela ganha uma cabeça nova.',
    'Em 5 trilhas você vai aprender a declarar tipos, validar o que chega e responder com o código certo. Aí a Hidra fica sem cabeças. Bora?',
  ],
  modules: ramFastapiModules,
  lab: null,
  bossFight: {
    bossName: 'a Hidra 422',
    tagline: 'CADA DADO TORTO É UMA CABEÇA NOVA',
    intro: [
      'A Hidra 422 cresce com cada requisição mal formada: texto no lugar de número, campo que falta, erro devolvido com 200.',
      'Corte as cabeças com tipos bem declarados e respostas honestas.',
      'Você tem <b>3 corações</b>. Toque no bloco certo: três erros na mesma rodada custam um coração. A dica tira um bloco errado, mas custa pontos.',
    ],
    lifeLabel: '♥',
    mode: 'single-shot',
    codeFile: 'hidra.py',
    rounds: [
      {
        title: 'Rodada 1 — O endereço vivo',
        description: 'A rota raiz precisa responder pedidos GET. Qual decorador?',
        talk: 'Rotas? Eu aceito qualquer coisa em qualquer lugar!',
        hint: 'Cada método HTTP tem seu decorador: GET é @app.get.',
        check: ['^@app\\.get\\(\\s*"/"\\s*\\)$'],
        choices: { correct: '@app.get("/")', wrong: ['@app.route("/")', '@app.post("/")', '@get("/")'] },
      },
      {
        title: 'Rodada 2 — O número que era texto',
        description: 'A rota /itens/{item_id} precisa garantir que item_id seja inteiro. Qual assinatura?',
        talk: 'Número, texto, tanto faz. Mais cabeças para mim.',
        hint: 'A anotação de tipo na função faz o FastAPI converter e validar.',
        check: ['def\\s+ler_item\\(\\s*item_id\\s*:\\s*int\\s*\\)'],
        choices: {
          correct: 'async def ler_item(item_id: int):',
          wrong: ['async def ler_item(item_id):', 'async def ler_item(id: int):', 'async def ler_item(item_id: "int"):'],
        },
      },
      {
        title: 'Rodada 3 — O corpo sem forma',
        description: 'O JSON de um item precisa ter nome e preço obrigatórios. Qual model?',
        talk: 'Qualquer JSON serve. Até um vazio.',
        hint: 'Campos sem valor padrão num BaseModel são obrigatórios.',
        check: ['class\\s+item\\(\\s*basemodel\\s*\\)\\s*:\\s*nome\\s*:\\s*str\\s*;?\\s*preco\\s*:\\s*float\\s*$'],
        choices: {
          correct: 'class Item(BaseModel): nome: str; preco: float',
          wrong: [
            'class Item(BaseModel): nome: str = None; preco: float = None',
            'class Item(dict): nome: str; preco: float',
            'class Item: nome = "str"; preco = "float"',
          ],
        },
      },
      {
        title: 'Rodada 4 — O erro disfarçado',
        description: 'Item não encontrado. Qual linha responde 404 de verdade?',
        talk: 'Devolve o erro com 200. Ninguém vai perceber.',
        hint: 'HTTPException se lança com raise.',
        check: ['^raise\\s+httpexception\\(\\s*status_code\\s*=\\s*404'],
        choices: {
          correct: 'raise HTTPException(status_code=404, detail="Não encontrado")',
          wrong: [
            'return HTTPException(status_code=404, detail="Não encontrado")',
            'return {"status": 404, "detail": "Não encontrado"}',
            'raise HTTPException(status_code=200, detail="Não encontrado")',
          ],
        },
      },
      {
        title: 'Rodada 5 — Golpe final: provar que funciona',
        description: 'No teste com TestClient, qual linha confere que a rota respondeu OK?',
        talk: 'Testar? Confie na sorte.',
        hint: 'assert compara com ==; o status de sucesso de um GET é 200.',
        check: ['^assert\\s+resposta\\.status_code\\s*==\\s*200$'],
        choices: {
          correct: 'assert resposta.status_code == 200',
          wrong: ['assert resposta.status_code = 200', 'assert resposta == 200', 'assert resposta.json() == 200'],
        },
      },
    ],
    badgeId: 'ram-fastapi-hidra',
    badgeTitle: 'Caçador da Hidra 422',
    badgeDescription: 'Cortou todas as cabeças da Hidra 422 com tipos, validação e status certos: a coroa da Ramificação FastAPI.',
  },
};
