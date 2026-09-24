import { createContext, useContext } from 'react';

export type AccountTab = 'login' | 'signup';

export type AccountSheetApi = { openAccount: (tab: AccountTab) => void };

export const AccountSheetContext = createContext<AccountSheetApi | null>(null);

/**
 * Abre a gaveta de conta (Entrar / Criar conta) por cima da tela atual, sem trocar de
 * rota: a pessoa não sai de onde está. Fora do provider (não deveria acontecer), cai
 * nas rotas `/entrar` e `/cadastro`.
 */
export function useAccountSheet(): AccountSheetApi {
  const api = useContext(AccountSheetContext);
  return (
    api ?? {
      openAccount: (tab) => {
        window.location.href = tab === 'login' ? '/entrar' : '/cadastro';
      },
    }
  );
}
