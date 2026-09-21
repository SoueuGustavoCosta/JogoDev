/**
 * Insígnias 3D dos chefes de fase de fim de era, extraídas verbatim do protótipo (mesmos
 * gradientes, filtros de relevo e traçado), convertidas para JSX. Cada uma é um SVG puro,
 * sem imagem externa, então escala de um perfil pequeno até a tela de vitória do boss fight.
 */
import type { ReactElement } from 'react';

export function DatabaseBadge({ size = 220 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Insígnia Guardião do Banco de Dados: medalha dourada com uma gema ciano gravada com um cilindro de banco de dados"
    >
      <defs>
        <linearGradient id="dbMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fdeeb0" />
          <stop offset="35%" stopColor="#e8b54d" />
          <stop offset="70%" stopColor="#a5731e" />
          <stop offset="100%" stopColor="#5c3f10" />
        </linearGradient>
        <radialGradient id="dbBezel" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#1a2440" />
          <stop offset="100%" stopColor="#080c18" />
        </radialGradient>
        <radialGradient id="dbGem" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#bdf3ff" />
          <stop offset="45%" stopColor="#4fd1c5" />
          <stop offset="100%" stopColor="#0d5a52" />
        </radialGradient>
        <filter id="dbEmboss" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4.5"
            specularConstant="0.85"
            specularExponent="18"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="60" y="40" z="180" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
          <feComposite in="SourceGraphic" in2="specClip" operator="arithmetic" k1="0" k2="1" k3="1.1" k4="0" />
        </filter>
        <filter id="dbGemGloss" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="6"
            specularConstant="1"
            specularExponent="24"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="55" y="35" z="140" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
          <feComposite in="SourceGraphic" in2="specClip" operator="arithmetic" k1="0" k2="1" k3="1.2" k4="0" />
        </filter>
      </defs>

      <polygon
        points="190,100 162.8,126.0 163.6,163.6 126.0,162.8 100,190 74.0,162.8 36.4,163.6 37.2,126.0 10,100 37.2,74.0 36.4,36.4 74.0,37.2 100,10 126.0,37.2 163.6,36.4 162.8,74.0"
        fill="url(#dbMetal)"
        stroke="#3b280a"
        strokeWidth="1.5"
        filter="url(#dbEmboss)"
      />

      <circle cx="100" cy="100" r="62" fill="url(#dbBezel)" stroke="#e8b54d" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#00000055" strokeWidth="5" />

      <polygon points="100,54 132,76 120,116 80,116 68,76" fill="url(#dbGem)" stroke="#0d5a52" strokeWidth="2" filter="url(#dbGemGloss)" />

      <g stroke="#eafffb" strokeWidth="2.6" fill="none" opacity=".92">
        <ellipse cx="100" cy="80" rx="14" ry="5.5" />
        <path d="M86,80 v18 c0,3 6.3,5.5 14,5.5 s14,-2.5 14,-5.5 v-18" />
        <path d="M86,89 c0,3 6.3,5.5 14,5.5 s14,-2.5 14,-5.5" />
      </g>

      <path d="M84,178 h32 l-6,14 h-20 z" fill="#3b280a" />
      <path d="M84,178 h32 l-6,14 h-20 z" fill="url(#dbMetal)" opacity=".85" />
    </svg>
  );
}

export function GitBadge({ size = 220 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Insígnia Guardião do Versionamento: medalha cromada com uma gema neon gravada com um branch de Git"
    >
      <defs>
        <linearGradient id="gitMetal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eafcff" />
          <stop offset="35%" stopColor="#7fdfff" />
          <stop offset="70%" stopColor="#1c2a44" />
          <stop offset="100%" stopColor="#05060c" />
        </linearGradient>
        <radialGradient id="gitBezel" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#151a2b" />
          <stop offset="100%" stopColor="#020306" />
        </radialGradient>
        <radialGradient id="gitGem" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffd6f6" />
          <stop offset="45%" stopColor="#ff2ec4" />
          <stop offset="100%" stopColor="#5c0a45" />
        </radialGradient>
        <filter id="gitEmboss" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="4.5"
            specularConstant="0.9"
            specularExponent="18"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="60" y="40" z="180" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
          <feComposite in="SourceGraphic" in2="specClip" operator="arithmetic" k1="0" k2="1" k3="1.1" k4="0" />
        </filter>
        <filter id="gitGemGloss" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="blur" />
          <feSpecularLighting
            in="blur"
            surfaceScale="6"
            specularConstant="1"
            specularExponent="24"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="55" y="35" z="140" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specClip" />
          <feComposite in="SourceGraphic" in2="specClip" operator="arithmetic" k1="0" k2="1" k3="1.2" k4="0" />
        </filter>
      </defs>

      <polygon
        points="190,100 162.8,126.0 163.6,163.6 126.0,162.8 100,190 74.0,162.8 36.4,163.6 37.2,126.0 10,100 37.2,74.0 36.4,36.4 74.0,37.2 100,10 126.0,37.2 163.6,36.4 162.8,74.0"
        fill="url(#gitMetal)"
        stroke="#00151a"
        strokeWidth="1.5"
        filter="url(#gitEmboss)"
      />

      <circle cx="100" cy="100" r="62" fill="url(#gitBezel)" stroke="#00f0ff" strokeWidth="2.5" />
      <circle cx="100" cy="100" r="62" fill="none" stroke="#00000066" strokeWidth="5" />

      <polygon points="100,54 132,76 120,116 80,116 68,76" fill="url(#gitGem)" stroke="#5c0a45" strokeWidth="2" filter="url(#gitGemGloss)" />

      <g stroke="#fff0fb" strokeWidth="2.6" fill="none" opacity=".95">
        <circle cx="85" cy="72" r="4.2" fill="#fff0fb" stroke="none" />
        <circle cx="85" cy="100" r="4.2" fill="#fff0fb" stroke="none" />
        <circle cx="113" cy="86" r="4.2" fill="#fff0fb" stroke="none" />
        <path d="M85,76 v20" />
        <path d="M85,86 c0,-8 8,-8 8,-8 h12" />
      </g>

      <path d="M84,178 h32 l-6,14 h-20 z" fill="#05060c" />
      <path d="M84,178 h32 l-6,14 h-20 z" fill="url(#gitMetal)" opacity=".85" />
    </svg>
  );
}

const BADGE_BY_TRAIL: Record<string, (props: { size?: number }) => ReactElement> = {
  'banco-de-dados': DatabaseBadge,
  'git-github': GitBadge,
};

/** Dispatcher por trilha, no mesmo espírito do `IslandSymbol` (símbolo por `id`). */
export function TrailBadge({ trailId, size = 220 }: { trailId: string; size?: number }) {
  const Badge = BADGE_BY_TRAIL[trailId] ?? DatabaseBadge;
  return <Badge size={size} />;
}
