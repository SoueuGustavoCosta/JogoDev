import { useEffect, type RefObject } from 'react';
import { reportModuleLeft } from '@/application/usecases';
import { scrollDepthPercent } from '@/domain/metrics';
import { useServices } from '@/presentation/app/ServicesContext';

/**
 * Mede até onde o aluno rolou dentro do módulo (o `<article>` da lição) e, quando ele sai
 * sem concluir, envia `module_left` com esse percentual (a regra de "sem concluir" fica em
 * `reportModuleLeft`). Conta como saída: trocar de módulo, ir para outra tela do app ou
 * fechar/recarregar a aba (`pagehide`). Só uma vez por visita ao módulo.
 *
 * Limite conhecido: no celular, quem só troca de app e o sistema mata a aba em segundo
 * plano pode sair sem disparar `pagehide`; essas saídas não são contadas.
 */
export function useModuleLeftTracking(
  articleRef: RefObject<HTMLElement>,
  trailId: string | undefined,
  moduleId: string | undefined,
): void {
  const { progressRepository, analytics } = useServices();

  useEffect(() => {
    if (!trailId || !moduleId) return;
    let maxPercent = 0;
    let reported = false;

    // Mede direto no evento (sem requestAnimationFrame, que fica parado com a aba em
    // segundo plano e perderia a medida). Ler o retângulo na rolagem é barato.
    const measure = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const percent = scrollDepthPercent({
        scrollTop: -rect.top,
        viewportHeight: window.innerHeight,
        contentHeight: rect.height,
      });
      maxPercent = Math.max(maxPercent, percent);
    };
    const report = () => {
      if (reported) return;
      reported = true;
      reportModuleLeft({ repository: progressRepository, analytics }, { trailId, moduleId, percent: maxPercent });
    };
    const onPageHide = () => {
      measure();
      report();
    };

    // Primeira medida depois do layout: o que já aparece sem rolar também conta.
    const firstMeasure = window.setTimeout(measure, 0);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('pagehide', onPageHide);
    return () => {
      window.clearTimeout(firstMeasure);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('pagehide', onPageHide);
      report();
    };
  }, [articleRef, trailId, moduleId, progressRepository, analytics]);
}
