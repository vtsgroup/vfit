'use client'

import Link from 'next/link'
import { DSIcon } from '@/components/ui/ds-icon'
import { ButtonUltra } from '@/components/ui/button-ultra'

/**
 * Ultra-Modern Hero Section
 *
 * Features:
 * - Animated SVG logo with float effect
 * - Glassmorphism buttons
 * - Gradient background with green tint
 * - Smooth animations (blur-in, scale-in)
 * - Responsive layout
 * - Accessibility-first
 */

export function HeroUltra() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      style={{
        backgroundImage: `
          radial-gradient(circle at 70% 30%, rgba(58, 181, 74, 0.08) 0%, transparent 50%),
          linear-gradient(135deg, #0a0e14 0%, #1a1f2e 50%, #121820 100%)
        `,
      }}
    >
      {/* Animated backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-sm pointer-events-none" />

      {/* Accent shapes (animated) */}
      <div
        className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: '#3AB54A',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-20 left-20 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
        style={{
          background: '#3AB54A',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div
            style={{
              animation: 'blurIn 500ms ease-out, slideUp 500ms ease-out',
            }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-2 mb-6 backdrop-blur-sm"
              style={{
                animation: 'slideUp 400ms ease-out',
              }}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-semibold text-green-300">
                30 DIAS GRÁTIS · SEM CARTÃO DE CRÉDITO
              </span>
            </div>

            {/* Heading */}
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
              style={{
                fontFamily: 'Inter, -apple-system, sans-serif',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                animation: 'slideUp 500ms ease-out 100ms backwards',
              }}
            >
              Seu personal trainer com <span className="text-brand-primary">IA</span>, no seu bolso
            </h1>

            {/* Subheading */}
            <p
              className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed"
              style={{
                animation: 'slideUp 500ms ease-out 200ms backwards',
              }}
            >
              Treinos personalizados, evolução por dados e gamificação. Transforme seu corpo com inteligência artificial.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{
                animation: 'slideUp 500ms ease-out 300ms backwards',
              }}
            >
              <ButtonUltra
                variant="glass-primary"
                size="lg"
                asChild
                className="font-bold uppercase"
              >
                <Link href="/register">
                  Começar Grátis
                  <DSIcon name="arrowRight" size={18} />
                </Link>
              </ButtonUltra>

              <ButtonUltra
                variant="glass-secondary"
                size="lg"
                asChild
                className="font-semibold uppercase"
              >
                <Link href="#features">
                  Ver como funciona
                </Link>
              </ButtonUltra>
            </div>

            {/* Trust badges */}
            <div
              className="mt-8 flex items-center gap-8 text-sm text-slate-400"
              style={{
                animation: 'slideUp 500ms ease-out 400ms backwards',
              }}
            >
              <div className="flex items-center gap-2">
                <DSIcon name="check" size={18} className="text-brand-primary" />
                <span>Seguro e criptografado</span>
              </div>
              <div className="flex items-center gap-2">
                <DSIcon name="check" size={18} className="text-brand-primary" />
                <span>LGPD Compliant</span>
              </div>
            </div>
          </div>

          {/* Right: Logo + Visual */}
          <div
            className="flex items-center justify-center"
            style={{
              animation: 'slideUp 600ms ease-out 200ms backwards',
            }}
          >
            {/* Logo SVG with floating animation */}
            <div
              className="w-80 h-80 relative"
              style={{
                animation: 'logoFloat 4s ease-in-out infinite',
                filter: 'drop-shadow(0 20px 50px rgba(58, 181, 74, 0.2))',
              }}
            >
              <svg
                version="1.1"
                viewBox="0 0 1024 1024"
                className="w-full h-full"
              >
                <defs>
                  <clipPath id="roundedClipHero">
                    <rect x="0" y="0" width="1024" height="1024" rx="220" ry="220" />
                  </clipPath>
                </defs>
                <g clipPath="url(#roundedClipHero)">
                  <rect x="0" y="0" width="1024" height="1024" fill="#3AB54A" />
                  <path fill="#08122B" opacity="1" stroke="none" d="M415.889740,248.989182 C444.136658,251.162689 462.226135,266.718750 473.780396,290.935883 C478.271240,300.348389 480.280060,310.441864 480.046539,320.978149 C479.836151,330.471497 479.935852,339.973877 480.024475,349.471069 C480.117126,359.400116 485.657867,364.938446 495.536621,364.979858 C510.033356,365.040619 524.530701,365.043030 539.027405,364.980530 C549.567200,364.935120 554.928345,359.494904 554.984741,348.860413 C555.039551,338.529510 555.419006,328.177460 554.914124,317.871033 C553.706970,293.228333 574.263855,258.341980 609.192749,250.898941 C613.690857,249.940445 618.413879,249.688309 623.031677,249.696640 C660.177246,249.763702 697.329224,249.611679 734.465027,250.295380 C751.876587,250.615967 769.342102,250.619171 786.619507,254.478531 C815.045715,260.828217 840.351074,286.761261 844.962158,315.533630 C845.508362,318.941742 846.524292,322.320129 846.668030,325.739807 C847.581482,347.470551 839.342529,366.306244 827.454590,383.757996 C805.924194,415.364990 784.163391,446.815247 762.442810,478.292297 C747.624512,499.766724 732.701965,521.169189 717.841797,542.614685 C689.229187,583.907104 660.739197,625.285095 631.982239,666.476624 C613.052307,693.591980 594.302063,720.863403 574.415283,747.269592 C560.512939,765.729492 541.158936,775.888733 517.763977,777.783997 C488.599457,780.146545 465.336060,768.807800 447.714935,746.333801 C434.496277,729.474792 422.524414,711.621826 410.317200,693.989990 C388.729797,662.809753 367.355621,631.481628 345.950073,600.175842 C330.921814,578.196838 316.052917,556.108704 301.000092,534.146606 C276.734528,498.742981 252.245895,463.491516 228.109467,428.000336 C215.301392,409.166809 202.881439,390.063232 190.594421,370.884125 C184.813751,361.860901 181.302887,351.821686 179.794647,341.141754 C179.268707,337.417450 178.047607,333.708038 178.082199,330.000580 C178.509399,284.198364 211.334473,252.452209 253.152405,249.651260 C276.025604,248.119232 299.031708,248.249298 321.978638,248.219376 C353.120789,248.178772 384.263611,248.702927 415.889740,248.989182 z" />
                  <path fill="#36AB43" opacity="0.9" stroke="none" d="M370.515564,426.502441 C387.045929,412.658386 405.914490,404.116943 426.066864,398.232544 C477.557526,383.197540 529.740784,381.604492 582.348755,390.947479 C608.449829,395.582977 633.426025,403.597351 655.868530,418.211456 C674.747253,430.504913 686.869812,446.697479 685.879578,470.490814 C685.533691,478.803284 686.046448,487.165375 685.393616,495.443787 C685.164490,498.349731 683.232300,502.501678 680.959900,503.475189 C678.718262,504.435516 674.160706,503.018066 672.161072,501.065033 C637.042786,466.765015 592.293030,458.276611 546.127869,454.272125 C509.885620,451.128418 473.914978,453.882446 438.593445,463.113312 C417.189056,468.707123 396.675995,476.436615 378.672180,489.645966 C373.730591,493.271667 369.626678,498.040405 364.679199,501.656372 C362.108490,503.535156 357.766052,505.721252 355.615570,504.734802 C353.070312,503.567322 350.688141,499.180664 350.567810,496.098328 C350.107483,484.305664 350.033112,472.438141 350.851746,460.670746 C351.838806,446.482239 360.853149,436.384308 370.515564,426.502441 z" />
                  <path fill="#36AA43" opacity="0.8" stroke="none" d="M617.420288,514.576416 C632.720886,526.339600 634.261902,542.462158 632.441101,559.449646 C631.718872,566.187744 625.874268,568.768433 620.783325,564.344421 C582.381714,530.973083 494.512115,526.111572 440.599457,550.478088 C434.431458,553.265747 428.796631,557.248657 422.971680,560.771729 C420.698761,562.146423 418.699280,563.995605 416.373108,565.255371 C410.957275,568.188477 405.868195,566.295105 405.012817,560.211365 C402.658722,543.468506 403.711823,527.518372 418.403351,515.725952 C431.949219,504.853271 447.566986,498.323517 464.249115,494.529144 C504.381042,485.401093 544.465210,484.816742 584.148193,497.143280 C596.127930,500.864532 607.436462,506.145081 617.420288,514.576416 z" />
                  <path fill="#35AA43" opacity="0.7" stroke="none" d="M570.137695,579.013245 C575.479919,586.342285 574.093933,593.249573 565.719360,597.258057 C559.336670,600.313171 552.394592,602.702759 545.442810,603.970398 C525.609924,607.586731 505.665802,607.618225 485.958008,602.898010 C481.177734,601.753052 476.388580,599.817749 472.177979,597.289246 C462.600616,591.538147 462.568787,581.645752 472.096436,575.768433 C476.136841,573.275940 480.754303,571.234924 485.377960,570.253784 C508.102966,565.431702 530.972107,564.291809 553.588562,570.617737 C559.325867,572.222473 564.461914,575.977295 570.137695,579.013245 z" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CSS Animations ─── */}
      <style>{`
        @keyframes blurIn {
          from {
            opacity: 0;
            filter: blur(4px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @media (prefers-reduced-motion: reduce) {
          @keyframes blurIn,
          @keyframes slideUp,
          @keyframes logoFloat,
          @keyframes float {
            to { transform: none; filter: none; }
          }
        }
      `}</style>
    </section>
  )
}
