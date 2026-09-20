export type TokenKind = 'kw' | 'type' | 'str' | 'num' | 'cm' | 'fn' | 'plain';
export type Token = { kind: TokenKind; text: string };

const KEYWORDS = new Set(
  (
    'select from where and or not in is null like insert into values update set delete create table drop alter add ' +
    'primary key foreign references unique check default constraint index on join inner left right full outer cross ' +
    'group by order having limit offset as distinct union all except intersect case when then else end begin commit ' +
    'rollback view function returns return trigger after before for each row execute procedure grant revoke to role ' +
    'login password with exists between asc desc cascade if replace language explain analyze isolation level ' +
    'serializable read committed column rename truncate database schema over partition rank'
  ).split(' '),
);
const TYPES = new Set(
  'serial integer int bigint smallint varchar text boolean numeric decimal timestamp date time real double precision uuid json jsonb char'.split(
    ' ',
  ),
);

const TOKEN_RE = /(--[^\n]*)|('(?:[^']|'')*')|(\b\d+(?:[.,]\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(\s*\()?|(\s+)|(.)/g;

/** Destaque leve de SQL, linha a linha (só para exibição; não interpreta o código). */
export function highlightSql(source: string): Token[][] {
  return source.split('\n').map((line) => {
    const tokens: Token[] = [];
    for (const m of line.matchAll(TOKEN_RE)) {
      if (m[1]) tokens.push({ kind: 'cm', text: m[1] });
      else if (m[2]) tokens.push({ kind: 'str', text: m[2] });
      else if (m[3]) tokens.push({ kind: 'num', text: m[3] });
      else if (m[4]) {
        const lower = m[4].toLowerCase();
        const kind: TokenKind = KEYWORDS.has(lower) ? 'kw' : TYPES.has(lower) ? 'type' : m[5] ? 'fn' : 'plain';
        tokens.push({ kind, text: m[4] });
        if (m[5]) tokens.push({ kind: 'plain', text: m[5] });
      } else tokens.push({ kind: 'plain', text: m[0] });
    }
    return tokens;
  });
}
