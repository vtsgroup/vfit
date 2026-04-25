import React from 'react';
import Link from 'next/link';
import { DSIcon } from '@/components/ui/ds-icon';
import { AvatarWithPlanBadge } from '@/components/ui/avatar-plan-badge';
import { cn } from '@/lib/utils';

function StudentHeader() {
  // TODO: Adicionar hooks reais e lógica de scroll, breadcrumbs, etc.
  return (
    <header
      className={cn(
        'ds3-header fixed left-0 right-0 z-30 backdrop-blur-2xl backdrop-saturate-180 transition-all duration-300',
        'border-b-0'
      )}
      style={{
        background: 'linear-gradient(to bottom, #050A12 0%, #050A12 20%, #0b1627 100%)',
        backgroundColor: '#050A12',
        borderBottom: 0,
        top: 'var(--demo-banner-offset, 0px)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Overlay fixo para garantir topo sólido theme color em qualquer ambiente */}
      <div style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 24,
        background: '#050A12',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex h-14 items-center justify-between px-4">
          {/* LEFT: Breadcrumbs + Page title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-0.5">
              <Link href="/treinos" className="text-white/80 hover:text-sky-300 transition-colors shrink-0">
                <DSIcon name="home" size={14} className="text-white" />
              </Link>
              {/* Breadcrumbs e título aqui */}
            </nav>
            <h1 className="text-sm font-bold tracking-tight text-white truncate">
              {/* pageTitle aqui */}
            </h1>
          </div>
          {/* RIGHT: Bell + Avatar */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Link
                href="/perfil/notificacoes"
                className="ds3-action-btn flex"
                title={'Notificações'}
                aria-label={'Notificações'}
              >
                <DSIcon name="bell" size={16} className="text-white dark:text-white" />
              </Link>
            </div>
            <div className="shrink-0">
              <AvatarWithPlanBadge
                src={''}
                name={'U'}
                size="sm"
                linkToPlans
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export { StudentHeader };
export default StudentHeader;
