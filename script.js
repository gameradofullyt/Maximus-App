// ==========================================
// 1. SISTEMA DE ALERTAS PROFISSIONAIS (Substitui alert e prompt)
// ==========================================
const SystemModal = {
    init: () => {
        if(document.getElementById('sys-modal')) return;
        const html = `
        <div class="sys-modal-overlay" id="sys-modal">
            <div class="sys-modal-box">
                <h3 class="sys-modal-title" id="sys-modal-title">Aviso</h3>
                <p class="sys-modal-text" id="sys-modal-text">Mensagem</p>
                <input type="text" class="sys-modal-input" id="sys-modal-input">
                <button class="sys-modal-btn" id="sys-modal-btn-ok">OK</button>
                <button class="sys-modal-btn sys-modal-cancel" id="sys-modal-btn-cancel" style="display:none;">Cancelar</button>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },
    alert: (title, message, callback) => {
        SystemModal.init();
        const modal = document.getElementById('sys-modal');
        document.getElementById('sys-modal-title').innerHTML = title;
        document.getElementById('sys-modal-text').innerHTML = message;
        document.getElementById('sys-modal-input').style.display = 'none';
        document.getElementById('sys-modal-btn-cancel').style.display = 'none';
        
        const btnOk = document.getElementById('sys-modal-btn-ok');
        btnOk.onclick = () => { modal.classList.remove('active'); if(callback) callback(); };
        modal.classList.add('active');
    },
    prompt: (title, message, callback) => {
        SystemModal.init();
        const modal = document.getElementById('sys-modal');
        const input = document.getElementById('sys-modal-input');
        document.getElementById('sys-modal-title').innerHTML = title;
        document.getElementById('sys-modal-text').innerHTML = message;
        
        input.style.display = 'block';
        input.value = '';
        document.getElementById('sys-modal-btn-cancel').style.display = 'block';
        
        document.getElementById('sys-modal-btn-ok').onclick = () => { 
            modal.classList.remove('active'); 
            if(callback) callback(input.value.trim()); 
        };
        document.getElementById('sys-modal-btn-cancel').onclick = () => { modal.classList.remove('active'); };
        
        modal.classList.add('active');
        setTimeout(() => input.focus(), 100);
    }
};

// ==========================================
// 2. BANCO DE DADOS E CONTA (Com os novos alertas)
// ==========================================
const BD = {
    init: () => {
        if(!localStorage.getItem('cine_users_db')) localStorage.setItem('cine_users_db', JSON.stringify([]));
    },
    getUsers: () => JSON.parse(localStorage.getItem('cine_users_db')),
    saveUsers: (users) => localStorage.setItem('cine_users_db', JSON.stringify(users)),
    getLogado: () => JSON.parse(localStorage.getItem('cine_logged_in')),
    atualizarLogado: (user) => {
        localStorage.setItem('cine_logged_in', JSON.stringify(user));
        let users = BD.getUsers();
        const idx = users.findIndex(u => u.id === user.id);
        if(idx !== -1) { users[idx] = user; BD.saveUsers(users); }
    },
    deslogar: () => {
        localStorage.removeItem('cine_logged_in');
        window.location.href = 'login.html';
    },
    acaoModerador: (acao, targetUsername, amount = 0) => {
        if(!targetUsername) return;
        if(targetUsername === '@gamerado' || targetUsername === '@gameradozinho') {
            if(acao !== 'pontos') { SystemModal.alert("Erro", "Ação negada: Você não pode punir moderadores supremos!"); return; }
        }
        let users = BD.getUsers();
        const index = users.findIndex(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if(index === -1) { SystemModal.alert("Erro", "Usuário não encontrado."); return; }

        if(acao === 'banir') { users[index].isBanned = true; SystemModal.alert("Sucesso", `Usuário ${targetUsername} foi banido!`); }
        if(acao === 'desbanir') { users[index].isBanned = false; SystemModal.alert("Sucesso", `Usuário ${targetUsername} foi desbanido.`); }
        if(acao === 'deletar') { users.splice(index, 1); SystemModal.alert("Sucesso", `Conta ${targetUsername} deletada permanentemente.`); }
        if(acao === 'pontos') {
            users[index].points = amount.toLowerCase() === "infinito" ? "INFINITO" : Number(users[index].points) + Number(amount);
            SystemModal.alert("Sucesso", `Pontos atualizados para ${targetUsername}.`);
        }
        BD.saveUsers(users);
        closeModal();
    },
    mudarTema: (tema) => {
        document.body.setAttribute('data-theme', tema);
        localStorage.setItem('cine_db_tema', tema);
    }
};
BD.init();

// ==========================================
// 3. PESQUISA EM TEMPO REAL (CORRIGIDA)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchInput');
    const mainContentWrapper = document.getElementById('main-content-wrapper');
    const searchResultsScreen = document.getElementById('search-results-screen');
    const searchGridContainer = document.getElementById('search-grid-container');
    const termoDigitado = document.getElementById('termo-digitado');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const termo = e.target.value.toLowerCase().trim();
            // Pega todos os cards da página (seja no carrossel ou em grades)
            const allCards = document.querySelectorAll('.card:not(#search-grid-container .card)'); 

            if (termo.length > 0) {
                if (mainContentWrapper) mainContentWrapper.style.display = 'none';
                if (searchResultsScreen) searchResultsScreen.classList.add('active');
                if (termoDigitado) termoDigitado.innerText = termo;
                searchGridContainer.innerHTML = '';

                let encontrouAlgo = false;
                allCards.forEach(card => {
                    const titulo = card.querySelector('h4') ? card.querySelector('h4').innerText.toLowerCase() : '';
                    if (titulo.includes(termo)) {
                        const clone = card.cloneNode(true);
                        clone.style.minWidth = "100%"; clone.style.flex = "none";
                        searchGridContainer.appendChild(clone);
                        encontrouAlgo = true;
                    }
                });

                if(!encontrouAlgo) {
                    searchGridContainer.innerHTML = '<p style="color:#888; text-align:center; grid-column: 1 / -1; padding-top:20px;">Nenhum conteúdo encontrado.</p>';
                }
            } else {
                if (mainContentWrapper) mainContentWrapper.style.display = 'block';
                if (searchResultsScreen) searchResultsScreen.classList.remove('active');
            }
        });
    }

    // Aplica Tema
    const temaSalvo = localStorage.getItem('dark_tema') || 'dark';
    document.body.setAttribute('data-theme', temaSalvo);
});

// Funções de Modal Específicos
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none'); }
