import { useNavigate } from 'react-router-dom';
import { AccountScreen } from './AccountScreen';
import { ForgotForm } from './forms';

/** Rota `/esqueci-senha`: versão em página do formulário da gaveta de conta. */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  return (
    <AccountScreen title="Esqueci minha senha" backTo="/entrar" backLabel="◂ Voltar para Entrar">
      <ForgotForm idPrefix="page" onBack={() => navigate('/entrar')} />
    </AccountScreen>
  );
}
