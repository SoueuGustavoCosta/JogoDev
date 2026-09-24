import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AccountSheet } from './AccountSheet';
import { AccountSheetContext, type AccountTab } from './accountSheetContext';

/** Monta a gaveta de conta uma vez só, para qualquer tela poder abri-la (ver `useAccountSheet`). */
export function AccountSheetProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<AccountTab | null>(null);
  const openAccount = useCallback((next: AccountTab) => setTab(next), []);
  const close = useCallback(() => setTab(null), []);
  const api = useMemo(() => ({ openAccount }), [openAccount]);
  return (
    <AccountSheetContext.Provider value={api}>
      {children}
      {tab ? <AccountSheet initialTab={tab} onClose={close} /> : null}
    </AccountSheetContext.Provider>
  );
}
