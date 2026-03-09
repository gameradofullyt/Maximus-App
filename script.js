// ==========================================
// 1. CARROSSEL PRINCIPAL (TOPO)
// ==========================================
let slideIndex = 1;
const slides = document.querySelectorAll('.carousel-item');

function showSlides(n) {
    if (slides.length === 0) return;
    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;
    slides.forEach(s => s.style.display = "none");
    slides[slideIndex - 1].style.display = "flex";
}

function changeSlide(n) {
    showSlides(slideIndex += n);
}

if(slides.length > 0) {
    showSlides(slideIndex);
    setInterval(() => changeSlide(1), 6000); // Passa sozinho a cada 6s
}

// ==========================================
// 2. MOVIMENTO DOS SLIDERS DE CATEGORIA (SETAS)
// ==========================================
function scrollSlider(button, direction) {
    const track = button.parentElement.querySelector('.slider-track');
    const scrollAmount = track.clientWidth * 0.8; // Rola 80% da tela visível
    track.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

// ==========================================
// 3. SISTEMA DE BANCO DE DADOS E CONTA (SIMULADO VIA LOCALSTORAGE)
// ==========================================
const BD = {
    USUARIO_CHAVE: 'cine_db_usuario_logado',
    FAVORITOS_CHAVE: 'cine_db_favoritos',
    HISTORICO_CHAVE: 'cine_db_historico',
    TEMAS_CHAVE: 'cine_db_tema',

    // --- AUTENTICAÇÃO E CONTA ---
    logar: (username) => {
        // Simula um login de moderador/verificado se for @gamerado ou @gameradozinho
        let type = 'user';
        if(username === '@gamerado' || username === '@gameradozinho') type = 'moderator';
        
        const userData = {
            username: username,
            displayName: (username === '@gameradozinho' ? 'Renan Cervinski' : 'Moderador Principal'),
            type: type,
            points: Math.floor(Math.random() * 2000), // Pontos aleatórios
            joined: '30/09/2023'
        };
        localStorage.setItem(BD.USUARIO_CHAVE, JSON.stringify(userData));
    },

    getUsuarioLogado: () => {
        const user = localStorage.getItem(BD.USUARIO_CHAVE);
        return user ? JSON.parse(user) : null;
    },

    deslogar: () => {
        localStorage.removeItem(BD.USUARIO_CHAVE);
        window.location.href = 'index.html'; // Redireciona para home
    },

    // --- MÍDIA DE PERFIL (VÍDEO/GIF) ---
    salvarMidiaPerfil: (tipo, content, contentType) => {
        localStorage.setItem(`cine_db_${tipo}`, JSON.stringify({content, contentType}));
        location.reload(); // Recarrega para aplicar
    },

    getMidiaPerfil: (tipo) => {
        const midia = localStorage.getItem(`cine_db_${tipo}`);
        return midia ? JSON.parse(midia) : null;
    },

    // --- FAVORITOS (Carrossel na Conta) ---
    adicionarFavorito: (item) => {
        let favoritos = BD.getFavoritos();
        if(!favoritos.find(f => f.title === item.title)) {
            favoritos.push(item);
            localStorage.setItem(BD.FAVORITOS_CHAVE, JSON.stringify(favoritos));
        }
    },

    getFavoritos: () => {
        const favs = localStorage.getItem(BD.FAVORITOS_CHAVE);
        return favs ? JSON.parse(favs) : [];
    },

    removerFavorito: (title) => {
        let favoritos = BD.getFavoritos();
        favoritos = favoritos.filter(f => f.title !== title);
        localStorage.setItem(BD.FAVORITOS_CHAVE, JSON.stringify(favoritos));
    },

    // --- HISTÓRICO (Carrossel e Retomada Simulada) ---
    adicionarHistorico: (item) => {
        let historico = BD.getHistorico();
        // Remove duplicata se já existir para colocar no topo
        historico = historico.filter(h => h.title !== item.title);
        // Adiciona ao topo automaticamente
        historico.unshift(item);
        // Limita o histórico (ex: 15 itens)
        if(historico.length > 15) historico.pop();
        
        localStorage.setItem(BD.HISTORICO_CHAVE, JSON.stringify(historico));
    },

    getHistorico: () => {
        const hist = localStorage.getItem(BD.HISTORICO_CHAVE);
        return hist ? JSON.parse(hist) : [];
    },

    // --- CONFIGURAÇÕES E TEMAS (5 temas) ---
    getTemaAtivo: () => {
        return localStorage.getItem(BD.TEMAS_CHAVE) || 'dark'; // Dark é o padrão Vermelho
    },

    mudarTema: (tema, element) => {
        document.body.setAttribute('data-theme', tema);
        localStorage.setItem(BD.TEMAS_CHAVE, tema);
        // Atualiza os pontos de tema
        document.querySelectorAll('.theme-dot').forEach(dot => dot.classList.remove('active'));
        element.classList.add('active');
    },

    // --- MODERAÇÃO SIMULADA ---
    banirSimulado: (username) => {
        alert(`O usuário ${username} foi banido (Funcionalidade simulada no Banco de Dados local).`);
    },

    // --- CARREGAR DADOS NA PÁGINA CONTA ---
    carregarDadosContaPage: () => {
        const user = BD.getUsuarioLogado();
        if(!user) return; // Não logado, ignora

        // 1. Info Básica e Selo de Verificação Giratório
        const nameElement = document.getElementById('user-display-name');
        nameElement.innerHTML = `${user.displayName} <i class="fas fa-check-circle verified-badge" style="display:${(user.type === 'moderator' ? 'inline-block' : 'none')}"></i>`;
        if(user.username === '@gamerado' || user.username === '@gameradozinho') {
            nameElement.querySelector('.verified-badge').style.display = 'inline-block';
        }
        
        document.getElementById('user-points').innerText = user.points;

        // 2. Mídia de Perfil (Avatar e Banner - Suporte a vídeo)
        const renderMidia = (containerId, midiaData, isAvatar) => {
            const container = document.getElementById(containerId);
            if(!midiaData) {
                // Placeholder padrão se não houver mídia
                const initials = user.displayName.split(' ').map(n=>n[0]).join('').toUpperCase();
                container.innerHTML = `<img src="https://via.placeholder.com/150/ffa502/fff?text=${initials}" class="profile-avatar">`;
                return;
            }

            if(midiaData.contentType === 'video') {
                container.innerHTML = `<video src="${midiaData.content}" loop muted autoplay playsinline class="${(isAvatar ? 'profile-avatar' : 'profile-banner')}"></video>`;
            } else {
                container.innerHTML = `<img src="${midiaData.content}" class="${(isAvatar ? 'profile-avatar' : 'profile-banner')}">`;
            }
        }
        renderMidia('banner-content', BD.getMidiaPerfil('banner'), false);
        renderMidia('avatar-content', BD.getMidiaPerfil('avatar'), true);

        // 3. Painel de Moderação (Aparece apenas para moderadores)
        if(user.type === 'moderator') {
            document.getElementById('mod-panel').style.display = 'block';
        }

        // 4. Carregar Carrosséis (Favoritos e Histórico)
        BD.carregarCarrosselLocal('favoritos-track', BD.getFavoritos(), false);
        BD.carregarCarrosselLocal('historico-track', BD.getHistorico(), true); // true para retomada simulada

        // 5. Carregar Tema Ativo
        const tema = BD.getTemaAtivo();
        document.body.setAttribute('data-theme', tema);
        const activeDot = document.querySelector(`.theme-dot[onclick*="${tema}"]`);
        if(activeDot) activeDot.classList.add('active');
    },

    // Função genérica para carregar carrosséis do LocalStorage
    carregarCarrosselLocal: (trackId, items, isHistory) => {
        const track = document.getElementById(trackId);
        if(!track) return;
        if(items.length === 0) {
            track.innerHTML = '<p style="color:#666; font-size:0.8rem; padding: 10px;">Ainda não há itens aqui.</p>';
            return;
        }

        items.forEach(item => {
            // Se for histórico, simula uma retomada de 2 minutos (120 segundos)
            let urlFinal = isHistory ? `detalhes.html?title=${encodeURIComponent(item.title)}&img=${encodeURIComponent(item.img)}&url=${encodeURIComponent(item.url)}&time=120` : `detalhes.html?title=${encodeURIComponent(item.title)}&img=${encodeURIComponent(item.img)}&url=${encodeURIComponent(item.url)}`;
            
            track.innerHTML += `
                <div class="card" onclick="window.location.href='${urlFinal}'">
                    <img src="${item.img}">
                    <div class="card-info">
                        <h4>${item.title}</h4>
                        <p class="card-date">${(isHistory ? '<i class="fas fa-play" style="font-size:0.7rem; color:var(--primary-red);"></i> Retomar' : 'Favorito')}</p>
                    </div>
                </div>
            `;
        });
    }
};

// ==========================================
// 4. PESQUISA EM TEMPO REAL (ATUALIZADA)
// ==========================================
// Clona cards reais do site para a grade de busca e clona do tamanho correto
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchInput');
    const mainContentWrapper = document.getElementById('main-content-wrapper'); // Pega tudo: Carrossel + Listas
    const searchResultsScreen = document.getElementById('search-results-screen');
    const searchGridContainer = document.getElementById('search-grid-container');
    const termoDigitado = document.getElementById('termo-digitado');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            const allCards = document.querySelectorAll('.content .card'); // Pega todos os cards reais dos sliders

            if (termo.length > 0) {
                // 1. Esconde a página principal e mostra a tela de busca
                if (mainContentWrapper) mainContentWrapper.style.display = 'none';
                if (searchResultsScreen) searchResultsScreen.classList.add('active');
                if (termoDigitado) termoDigitado.innerText = termo;

                // 2. Limpa resultados anteriores
                searchGridContainer.innerHTML = '';

                // 3. Filtra e adiciona clones dos cards reais à grade
                let encontrouAlgo = false;
                allCards.forEach(card => {
                    const titulo = card.querySelector('h4').innerText.toLowerCase();
                    const info = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : '';

                    if (titulo.includes(termo) || info.includes(termo)) {
                        const clone = card.cloneNode(true);
                        // Garante que o card ocupe o espaço correto na grade
                        clone.style.minWidth = "100%"; 
                        clone.style.flex = "none";
                        searchGridContainer.appendChild(clone);
                        encontrouAlgo = true;
                    }
                });

                if(!encontrouAlgo) {
                    searchGridContainer.innerHTML = '<p style="color:#888; text-align:center; grid-column: 1 / -1; padding-top:20px;">Nenhum filme ou série encontrado para esta pesquisa.</p>';
                }

            } else {
                // CAMPO VAZIO: Esconde a pesquisa e volta pro site normal
                if (mainContentWrapper) mainContentWrapper.style.display = 'block';
                if (searchResultsScreen) searchResultsScreen.classList.remove('active');
            }
        });
    }

    // Carrega o Tema Ativo ao iniciar (Simulado do LocalStorage)
    const tema = BD.getTemaAtivo();
    document.body.setAttribute('data-theme', tema);
});
