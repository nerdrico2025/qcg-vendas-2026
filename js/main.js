/* =====================================================================
   QCG 2026 — main.js
   Vanilla JS, sem dependências externas.
   ===================================================================== */

/* =====================================================================
   TRACKING — PIXELS E TAG MANAGER
   Insira seus snippets de rastreamento aqui, antes de qualquer código.

   Meta Pixel (Facebook):
   -----------------------------------------------------------------------
   !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){...};
   fbq('init', 'SEU_PIXEL_ID');
   fbq('track', 'PageView');
   -----------------------------------------------------------------------

   Google Tag Manager:
   -----------------------------------------------------------------------
   (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
   new Date().getTime(),event:'gtm.js'});...})
   (window,document,'script','dataLayer','GTM-XXXXXXX');
   -----------------------------------------------------------------------

   Para rastrear cliques no CTA, use o evento abaixo como referência:
   document.querySelectorAll('.btn-cta').forEach(btn => {
     btn.addEventListener('click', () => {
       fbq('track', 'InitiateCheckout');           // Meta Pixel
       gtag('event', 'click', { event_category: 'CTA', event_label: btn.id });
     });
   });
   ===================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------
     1. COUNTDOWN TIMER
     ------------------------------------------------------------------- */

  const DATA_FIM = new Date(Date.now() + 8 * 60 * 60 * 1000);

  function formatarNumero(n) {
    return String(n).padStart(2, '0');
  }

  function atualizarCountdown() {
    const agora     = new Date();
    const diferenca = DATA_FIM - agora;

    const elDias = document.getElementById('cd-dias');
    const elHoras = document.getElementById('cd-horas');
    const elMin  = document.getElementById('cd-min');
    const elSeg  = document.getElementById('cd-seg');

    // Sai silenciosamente se os elementos não existirem na página
    if (!elDias || !elHoras || !elMin || !elSeg) return;

    if (diferenca <= 0) {
      // Tempo esgotado: esconde o bloco de countdown e exibe mensagem
      const countdown = document.getElementById('countdown');
      if (countdown) {
        countdown.innerHTML = '<span style="color:#fff;font-weight:700;font-size:15px;">Oferta encerrada</span>';
      }
      clearInterval(intervaloCountdown);
      return;
    }

    const dias    = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas   = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

    elDias.textContent  = formatarNumero(dias);
    elHoras.textContent = formatarNumero(horas);
    elMin.textContent   = formatarNumero(minutos);
    elSeg.textContent   = formatarNumero(segundos);
  }

  // Executa imediatamente para evitar flash de "00:00:00"
  atualizarCountdown();
  const intervaloCountdown = setInterval(atualizarCountdown, 1000);


  /* -------------------------------------------------------------------
     2. ACCORDION FAQ
     ------------------------------------------------------------------- */

  function iniciarAccordion() {
    const itens = document.querySelectorAll('.faq-item');

    itens.forEach(item => {
      const botao    = item.querySelector('.faq-pergunta');
      const resposta = item.querySelector('.faq-resposta');

      if (!botao || !resposta) return;

      botao.addEventListener('click', () => {
        const estaAberto = botao.getAttribute('aria-expanded') === 'true';

        // Fecha todos os outros itens primeiro
        itens.forEach(outroItem => {
          const outroBotao    = outroItem.querySelector('.faq-pergunta');
          const outraResposta = outroItem.querySelector('.faq-resposta');
          if (outroBotao && outraResposta && outroItem !== item) {
            fecharItem(outroBotao, outraResposta);
          }
        });

        // Alterna o item clicado
        if (estaAberto) {
          fecharItem(botao, resposta);
        } else {
          abrirItem(botao, resposta);
        }
      });
    });
  }

  function abrirItem(botao, resposta) {
    botao.setAttribute('aria-expanded', 'true');
    resposta.removeAttribute('hidden');
    // Força reflow para que a transição de max-height funcione
    resposta.style.maxHeight = resposta.scrollHeight + 'px';
    resposta.style.paddingBottom = '20px';
  }

  function fecharItem(botao, resposta) {
    botao.setAttribute('aria-expanded', 'false');
    resposta.style.maxHeight = '0';
    resposta.style.paddingBottom = '0';
    // Recoloca o atributo hidden após a transição terminar
    resposta.addEventListener('transitionend', function handler() {
      if (botao.getAttribute('aria-expanded') === 'false') {
        resposta.setAttribute('hidden', '');
      }
      resposta.removeEventListener('transitionend', handler);
    });
  }

  iniciarAccordion();


  /* -------------------------------------------------------------------
     3. ANIMAÇÃO DE ENTRADA — Intersection Observer
     ------------------------------------------------------------------- */

  function iniciarAnimacoes() {
    // Seleciona todos os elementos marcados com data-animate
    const elementos = document.querySelectorAll('[data-animate]');

    if (!elementos.length) return;

    // Adiciona o estado inicial (invisível + deslocado)
    elementos.forEach(el => {
      el.classList.add('fade-in-hidden');
    });

    // Cria o observer
    const observer = new IntersectionObserver((entradas) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          // Respeita atraso definido pelo atributo data-delay (ex: data-delay="200")
          const delay = entrada.target.dataset.delay || 0;
          setTimeout(() => {
            entrada.target.classList.remove('fade-in-hidden');
            entrada.target.classList.add('fade-in-visible');
          }, Number(delay));
          observer.unobserve(entrada.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    });

    elementos.forEach(el => observer.observe(el));
  }

  // Injeta os estilos de animação via JS para não depender de nenhuma classe extra no CSS
  (function injetarEstilosAnimacao() {
    const estilo = document.createElement('style');
    estilo.textContent = `
      .fade-in-hidden {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .fade-in-visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(estilo);
  })();

  iniciarAnimacoes();


  /* -------------------------------------------------------------------
     4. STICKY HEADER COM SCROLL
     ------------------------------------------------------------------- */

  function iniciarScrollSpy() {
    const LIMITE_SCROLL = 400;

    function checarScroll() {
      if (window.scrollY > LIMITE_SCROLL) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    }

    // Throttle manual para não sobrecarregar o scroll
    let aguardando = false;
    window.addEventListener('scroll', () => {
      if (aguardando) return;
      aguardando = true;
      requestAnimationFrame(() => {
        checarScroll();
        aguardando = false;
      });
    }, { passive: true });

    checarScroll(); // Verifica estado inicial (útil ao recarregar com scroll)
  }

  iniciarScrollSpy();


  /* -------------------------------------------------------------------
     5. SMOOTH SCROLL com offset (compensa a barra sticky)
     ------------------------------------------------------------------- */

  function iniciarSmoothScroll() {
    const OFFSET = 80; // Altura da barra de urgência sticky

    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function (e) {
        const alvo = this.getAttribute('href');

        // Ignora links que são só "#" (sem destino real)
        if (alvo === '#') return;

        const secao = document.querySelector(alvo);
        if (!secao) return;

        e.preventDefault();

        const posicaoTopo = secao.getBoundingClientRect().top + window.scrollY - OFFSET;

        window.scrollTo({
          top: posicaoTopo,
          behavior: 'smooth',
        });

        // Atualiza a URL sem rolar novamente
        history.pushState(null, '', alvo);
      });
    });
  }

  iniciarSmoothScroll();


  /* -------------------------------------------------------------------
     INIT — Log de confirmação (remover em produção)
     ------------------------------------------------------------------- */
  console.log('[QCG 2026] main.js carregado com sucesso.');

})();
