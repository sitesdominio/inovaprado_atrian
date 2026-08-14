document.addEventListener('DOMContentLoaded', () => {

    /* ---------- menu mobile ---------- */
    const header = document.querySelector('.header');
    const menuToggle = document.getElementById('menuToggle');

    /* ---------- header flutuante e contador flutuante só aparecem após rolar abaixo do hero (home) ---------- */
    const hero = document.querySelector('.hero');
    const contagem = document.querySelector('.contagem--flutuante');

    if (hero && (header?.classList.contains('header--flutuante') || contagem)) {
        const observadorHero = new IntersectionObserver(
            ([entrada]) => {
                const estaNaHero = entrada.isIntersecting;

                if (header && header.classList.contains('header--flutuante')) {
                    header.classList.toggle('visivel', !estaNaHero);
                }

                // o contador só volta a aparecer se o usuário não o tiver fechado
                if (contagem && !contagem.classList.contains('fechado')) {
                    contagem.classList.toggle('visivel', !estaNaHero);
                }
            },
            { threshold: 0 }
        );
        observadorHero.observe(hero);
    } else if (contagem && !contagem.classList.contains('fechado')) {
        // páginas sem hero (ex: desafios, regulamentação) já começam com o contador visível
        contagem.classList.add('visivel');
    }

    /* ---------- botões do contador flutuante: minimizar e fechar ---------- */
    if (contagem) {
        const botaoMinimizar = document.getElementById('contagemMinimizar');
        const botaoFechar = document.getElementById('contagemFechar');

        // no celular o widget já nasce minimizado, mostrando só o essencial
        const ehMobile = window.matchMedia('(max-width: 900px)').matches;
        if (ehMobile && botaoMinimizar) {
            contagem.classList.add('contagem--minimizado');
            botaoMinimizar.textContent = '+';
            botaoMinimizar.setAttribute('aria-label', 'Expandir contagem');
            botaoMinimizar.setAttribute('aria-expanded', 'false');
        }

        if (botaoMinimizar) {
            botaoMinimizar.addEventListener('click', () => {
                const minimizado = contagem.classList.toggle('contagem--minimizado');
                botaoMinimizar.textContent = minimizado ? '+' : '−';
                botaoMinimizar.setAttribute('aria-label', minimizado ? 'Expandir contagem' : 'Minimizar contagem');
                botaoMinimizar.setAttribute('aria-expanded', String(!minimizado));
            });
        }

        if (botaoFechar) {
            botaoFechar.addEventListener('click', () => {
                contagem.classList.remove('visivel');
                contagem.classList.add('fechado');
            });
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            header.classList.toggle('aberto');
        });

        document.querySelectorAll('.menu a').forEach(link => {
            link.addEventListener('click', () => header.classList.remove('aberto'));
        });
    }

    /* ---------- FAQ accordion ---------- */
    document.querySelectorAll('.faq-item').forEach(item => {
        const pergunta = item.querySelector('.faq-pergunta');
        const resposta = item.querySelector('.faq-resposta');

        pergunta.addEventListener('click', () => {
            const jaAberto = item.classList.contains('aberto');

            // fecha os outros itens
            document.querySelectorAll('.faq-item.aberto').forEach(outro => {
                if (outro !== item) {
                    outro.classList.remove('aberto');
                    outro.querySelector('.faq-resposta').style.maxHeight = null;
                }
            });

            if (jaAberto) {
                item.classList.remove('aberto');
                resposta.style.maxHeight = null;
            } else {
                item.classList.add('aberto');
                resposta.style.maxHeight = resposta.scrollHeight + 'px';
            }
        });
    });

    /* ---------- cards de desafio: modal contextual sob o card selecionado ---------- */
    let modalAberto = null;
    let cardAtivo = null;
    let overlayModal = null;

    function posicionarModal() {
        // O modal é centralizado pela folha de estilos para permanecer no centro da viewport.
        if (!modalAberto) return;
        modalAberto.style.width = `${Math.min(820, window.innerWidth - 48)}px`;
    }

    function prepararOverlay() {
        if (overlayModal) return overlayModal;
        overlayModal = document.createElement('div');
        overlayModal.className = 'desafio-modal-overlay';
        overlayModal.setAttribute('aria-hidden', 'true');
        overlayModal.addEventListener('click', fecharModal);
        document.body.appendChild(overlayModal);
        return overlayModal;
    }

    function fecharModal() {
        if (overlayModal) overlayModal.classList.remove('aberto');
        document.body.classList.remove('modal-desafio-aberto');
        if (modalAberto) {
            modalAberto.classList.remove('aberto');
            modalAberto.setAttribute('aria-hidden', 'true');
            modalAberto.querySelector('.desafio-painel-corpo').innerHTML = '';
        }
        if (cardAtivo) {
            cardAtivo.classList.remove('ativo');
            cardAtivo.setAttribute('aria-expanded', 'false');
        }
        modalAberto = null;
        cardAtivo = null;
    }

    function abrirDetalheCard(card) {
        const eixo = card.closest('.eixo-bloco');
        const painel = eixo?.querySelector('.desafio-painel');
        const corpo = painel?.querySelector('.desafio-painel-corpo');
        const template = card.querySelector('.desafio-detalhe');
        if (!painel || !corpo || !template) return;

        if (card === cardAtivo) {
            fecharModal();
            return;
        }
        fecharModal();

        cardAtivo = card;
        modalAberto = painel;
        prepararOverlay().classList.add('aberto');
        document.body.classList.add('modal-desafio-aberto');
        card.classList.add('ativo');
        card.setAttribute('aria-expanded', 'true');
        corpo.innerHTML = '';
        corpo.appendChild(template.content.cloneNode(true));
        painel.setAttribute('role', 'dialog');
        painel.setAttribute('aria-modal', 'false');
        painel.setAttribute('aria-hidden', 'false');
        painel.classList.add('aberto');
        posicionarModal();

        corpo.querySelectorAll('.detalhe-item').forEach(item => {
            item.querySelector('.detalhe-pergunta').addEventListener('click', () => {
                const estaAberto = item.classList.contains('aberto');
                corpo.querySelectorAll('.detalhe-item.aberto').forEach(outro => {
                    if (outro !== item) outro.classList.remove('aberto');
                });
                item.classList.toggle('aberto', !estaAberto);
            });
        });

        painel.querySelector('.desafio-painel-fechar')?.focus();
    }

    document.querySelectorAll('.desafio-card-completo').forEach(card => {
        card.addEventListener('click', () => abrirDetalheCard(card));
        card.addEventListener('keydown', evento => {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                abrirDetalheCard(card);
            }
        });
    });

    document.querySelectorAll('.desafio-painel-fechar').forEach(botao => {
        botao.addEventListener('click', fecharModal);
    });
    window.addEventListener('scroll', posicionarModal, { passive: true });
    window.addEventListener('resize', posicionarModal);
    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') fecharModal();
    });

    /* ---------- contagem regressiva ---------- */
    // Ajuste a data/hora alvo do evento aqui:
    const dataEvento = new Date('2026-09-12T08:00:00-03:00').getTime();

    const elDias = document.getElementById('cd-dias');
    const elHoras = document.getElementById('cd-horas');
    const elMinutos = document.getElementById('cd-minutos');
    const elSegundos = document.getElementById('cd-segundos');

    function atualizarContagem() {
        const agora = new Date().getTime();
        const diferenca = dataEvento - agora;

        if (diferenca <= 0) {
            [elDias, elHoras, elMinutos, elSegundos].forEach(el => { if (el) el.textContent = '00'; });
            return;
        }

        const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);

        const doisDigitos = n => String(n).padStart(2, '0');

        if (elDias) elDias.textContent = doisDigitos(dias);
        if (elHoras) elHoras.textContent = doisDigitos(horas);
        if (elMinutos) elMinutos.textContent = doisDigitos(minutos);
        if (elSegundos) elSegundos.textContent = doisDigitos(segundos);
    }

    if (elDias) {
        atualizarContagem();
        setInterval(atualizarContagem, 1000);
    }

});