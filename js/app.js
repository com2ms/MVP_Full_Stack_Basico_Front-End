///////////////////////////////////////////////////////////////////////
// CONTROLE DE MEDICAÇÕES PARA PETS
///////////////////////////////////////////////////////////////////////

//
const API_BASE_URL = 'http://127.0.0.1:5000';
let todosOsTutores = []; // Armazenamento global de tutores para cruzamento de dados

//
document.addEventListener("DOMContentLoaded", () => {
    carregarTutores();
    carregarPets();
    carregarMedicoes();
});

//
function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('bg-blue-700', 'active'));

    const paginaAlvo = document.getElementById(pageId);
    if (paginaAlvo) paginaAlvo.classList.add('active');

    const linkMenu = document.getElementById('link-' + pageId);
    if (linkMenu) linkMenu.classList.add('bg-blue-700', 'active');

    ['resultadoConsultaTutor', 'resultadoConsultaPet', 'resultadoConsultaMedicamento'].forEach(id => {
        const area = document.getElementById(id);
        if (area) area.style.display = 'none';
    });
    
    if (pageId === 'cad-pet' || pageId === 'edit-tutor') {
        carregarTutores();
    }
    
    if (pageId === 'cad-medicamento' || pageId === 'edit-pet') { 
        carregarPets();
    }
    
    if (pageId === 'edit-medicamento') {
        carregarMedicoes();
    }
    
    if (pageId === 'modal-prontuario') {
        carregarPetsProntuario();
        voltarParaSelecao();
    }
    
    if (pageId === 'home') {
        carregarTutores();
        carregarPets();
        carregarMedicoes();
    }
}


// CONSULTAS TUTOR, PETS E MEDICAMENTOS


// CONSULTA TUTOR
///////////////////////////////////////////////////////////////////////
async function carregarTutores() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_tutores`);
        const dados = await response.json();
        const listaTutores = dados.tutores || dados; 
        todosOsTutores = listaTutores;
        
        const select = document.getElementById('selectTutor');
        const selectConsulta = document.getElementById('consultaTutorId');

        if (select) {
            select.innerHTML = '<option value="">Selecione um tutor...</option>';
            listaTutores.forEach(t => {
                select.innerHTML += `<option value="${t.id}" style="font-weight: bold;">(ID: ${t.id}) ${t.nome}</option>`;
            });
        }

        if (selectConsulta) {
            selectConsulta.innerHTML = '<option value="">Selecione um tutor...</option>';
            listaTutores.forEach(t => {
                selectConsulta.innerHTML += `<option value="${t.id}" style="font-weight: bold;">(ID: ${t.id}) ${t.nome}</option>`; // A opcao de negrito parece nao estar funcionando no Firefox
            });
        }

    } catch (err) { 
        console.error('Erro ao buscar tutores:', err); 
    }
}

// CONSULTA PETS
///////////////////////////////////////////////////////////////////////
async function carregarPets() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_pets`);
        const dados = await response.json();
        const listaPets = dados.pets || dados; 
        
        const select = document.getElementById('selectPet');
        const selectConsulta = document.getElementById('consultaPetId');

        // 1. Preenche o seletor do cadastro de medicamentos
        if (select) {
            select.innerHTML = '<option value="">Selecione um Pet...</option>';
            listaPets.forEach(a => {
                const tutorEncontrado = todosOsTutores.find(t => t.id === a.tutor_id);
                const textoTutor = tutorEncontrado ? tutorEncontrado.nome : `ID Tutor: ${a.tutor_id}`;
                select.innerHTML += `<option value="${a.id}" style="font-weight: bold;">(ID: ${a.id}) ${a.nome} [T: ${textoTutor}]</option>`;
            });
        }

        // 2. Preenche o seletor da busca/consulta individual de pets
        if (selectConsulta) {
            selectConsulta.innerHTML = '<option value="">Selecione um Pet...</option>';
            listaPets.forEach(a => {
                const tutorEncontrado = todosOsTutores.find(t => t.id === a.tutor_id);
                const textoTutor = tutorEncontrado ? tutorEncontrado.nome : `ID Tutor: ${a.tutor_id}`;
                selectConsulta.innerHTML += `<option value="${a.id}" style="font-weight: bold;">(ID: ${a.id}) ${a.nome} [T: ${textoTutor}]</option>`;
            });
        }

    } catch (err) { 
        console.error('Erro ao buscar pets:', err); 
    }
}



// CONSULTA MEDICAMENTOS (ACABOU SAINDO COMO ""MEDICOES"")
///////////////////////////////////////////////////////////////////////
async function carregarMedicoes() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_medicacoes`);
        const dados = await response.json();
        
        const listaMedicacoes = dados.medicacoes || dados; 
        
        const selectConsulta = document.getElementById('consultaMedicamentoId');
        
        if (selectConsulta) {
            selectConsulta.innerHTML = '<option value="">Selecione um medicamento...</option>';
            if (Array.isArray(listaMedicacoes)) {
                listaMedicacoes.forEach(m => {
                    selectConsulta.innerHTML += `<option value="${m.id}" style="font-weight: bold;">(ID: ${m.id}) ${m.nome_medicacao} [Pet: ${m.nome_pet}]</option>`;
                });
            }
        }
    } catch (err) { 
        console.error('Erro ao buscar medicações:', err); 
    }
}


// OPCOES DE CADASTRO

//CADASTRO TUTOR
///////////////////////////////////////////////////////////////////////
async function CadastrarTutor(event) {
    event.preventDefault();
    const formData = new FormData();
    const cpfLimpo = document.getElementById('tutorCpf').value.replace(/\D/g, '');
    const telefoneLimpo = document.getElementById('tutorTelefone').value.replace(/\D/g, '');

    formData.append('nome', document.getElementById('tutorNome').value);
    formData.append('cpf', cpfLimpo);
    formData.append('telefone', telefoneLimpo);
    
    const email = document.getElementById('tutorEmail').value;
    if (email) formData.append('email', email);
    const endereco = document.getElementById('tutorEndereco').value;
    if (endereco) formData.append('endereco', endereco);

    try {
        const response = await fetch(`${API_BASE_URL}/add_tutor`, { method: 'POST', body: formData });
        if (!response.ok) { 
            const res = await response.json(); 
            throw new Error(res.erro || 'Erro ao cadastrar'); 
        }
        alert('Tutor cadastrado com sucesso!');
        event.target.reset(); 
        carregarTutores(); 
        switchPage('home');
    } catch (err) { alert(`Erro: ${err.message}`); }
}

//CADASTRO PETS
///////////////////////////////////////////////////////////////////////
async function CadastrarPet(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append('nome', document.getElementById('petNome').value);
    formData.append('especie', document.getElementById('petEspecie').value);
    formData.append('tutor_id', document.getElementById('selectTutor').value);
    formData.append('raca', document.getElementById('petRaca').value || 'null');
    formData.append('idade', document.getElementById('petIdade').value || 'null');
    formData.append('peso', document.getElementById('petPeso').value || 'null');

    try {
        const response = await fetch(`${API_BASE_URL}/add_pet`, { method: 'POST', body: formData });
        if (!response.ok) { 
            const res = await response.json(); 
            throw new Error(res.erro || 'Erro na validação dos dados.'); 
        }
        alert('Pet cadastrado e vinculado com sucesso!');
        event.target.reset(); 
        carregarPets(); 
        switchPage('home');
    } catch (err) { alert(`Erro: ${err.message}`); }
}

//CADASTRO MEDICAMENTOS

// CADASTRO MEDICAMENTOS
///////////////////////////////////////////////////////////////////////
async function CadastrarMedicamento(event) {
    event.preventDefault();
    const selectPetElement = document.getElementById('selectPet');
    const selectPetValue = selectPetElement ? selectPetElement.value : null;
    
    if (!selectPetValue) {
        alert('Por favor, selecione um Pet antes de salvar o medicamento.');
        return;
    }
    
    const formData = new FormData();
    formData.append('pet_id', parseInt(selectPetValue, 10));
    formData.append('nome_medicacao', document.getElementById('medNome').value);
    formData.append('dosagem', document.getElementById('medDosagem').value.trim().toString());
    // ... (código anterior igual)
    formData.append('frequencia', document.getElementById('medFrequencia').value);

    // Captura o YYYY-MM-DD do input date e converte de forma segura
    const dataInicioRaw = document.getElementById('medDataInicio').value;
    formData.append('data_inicio', converterDataParaBackend(dataInicioRaw));

    // AJUSTE DE SEGURANÇA AQUI:
    const dataFimInput = document.getElementById('medDataFim')?.value;

    // Só converte se o usuário realmente escolheu uma data, caso contrário envia "null" direto
    if (dataFimInput && dataFimInput.trim() !== "") {
        formData.append('data_fim', converterDataParaBackend(dataFimInput));
    } else {
        formData.append('data_fim', "null");
    }

    try {

        const response = await fetch(`${API_BASE_URL}/add_medicacao`, { method: 'POST', body: formData });
        const res = await response.json();

        if (!response.ok) {
            let mensagemErro = res.erro || res.detail;
            if (typeof mensagemErro === 'object') mensagemErro = JSON.stringify(mensagemErro);
            throw new Error(mensagemErro || 'Erro na validação do servidor (422).');
        }
        
        alert('Medicamento registrado com sucesso!');
        event.target.reset();
        carregarMedicoes();
        switchPage('home');
    } catch (err) { alert(`Erro: ${err.message}`); }
}




// OPCOES DE EDICAO

// EDICAO TUTOR
///////////////////////////////////////////////////////////////////////
async function salvarEdicaoTutorTabela(id) {
    const payload = {
        nome: document.getElementById(`edit-t-nome-${id}`).value,
        telefone: document.getElementById(`edit-t-tel-${id}`).value,
        email: document.getElementById(`edit-t-email-${id}`).value || null,
        endereco: document.getElementById(`edit-t-end-${id}`).value || null
    };
    const res = await fetch(`${API_BASE_URL}/edit_tutor/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { carregarTutores(); carregarPets(); }
}

// EDICAO PETS
///////////////////////////////////////////////////////////////////////
async function salvarEdicaoPet(id) {
    const payload = {
        nome: document.getElementById(`edit-a-nome-${id}`).value,
        especie: document.getElementById(`edit-a-esp-${id}`).value
    };
    const res = await fetch(`${API_BASE_URL}/edit_pet/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) carregarPets();
}

// EDICAO MEDICAMENTOS
///////////////////////////////////////////////////////////////////////
async function salvarEdicaoMedicacao(id) {
    // CORRIGIDO: Captura os novos campos de data criados dinamicamente com o ID da linha
    const payload = {
        nome_medicacao: document.getElementById(`edit-med-nome-${id}`).value,
        dosagem: document.getElementById(`edit-med-dose-${id}`).value,
        frequencia: document.getElementById(`edit-med-freq-${id}`).value,
        data_inicio: document.getElementById(`edit-med-data-inicio-${id}`).value, 
        data_fim: document.getElementById(`edit-med-data-fim-${id}`).value        
    };
    
    const res = await fetch(`${API_BASE_URL}/edit_medicacao/${id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
    });
    
    if (res.ok) carregarMedicoes();
}



// OPCOES DE DELECAO

//DELECAO TUTOR
///////////////////////////////////////////////////////////////////////
async function deletarTutor(id) {
    if (!id) return alert("Nenhum tutor selecionado para exclusão.");
    if (confirm("⚠️ Alerta: Remover este tutor deletará TODOS os pets e históricos vinculados a ele automaticamente em cascata! Deseja continuar?")) {
        try {
            const res = await fetch(`${API_BASE_URL}/del_tutor/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error((await res.json()).erro || 'Erro ao remover o registro.');
            alert("Tutor e todos os dados vinculados foram deletados com sucesso!");
            carregarTutores(); carregarPets(); carregarMedicoes();
            document.getElementById('resultadoConsultaTutor').style.display = 'none';
            document.getElementById('consultaTutorId').value = '';
        } catch (err) { alert(`Erro: ${err.message}`); }
    }
}

//DELECAO PETS
///////////////////////////////////////////////////////////////////////
async function deletarPet(id) {
    if (confirm("Deseja remover o prontuário deste pet permanentemente?")) {
        try {
            await fetch(`${API_BASE_URL}/del_pet/${id}`, { method: 'DELETE' });
            carregarPets(); carregarMedicoes();
        } catch (err) { console.error(err); }
    }
}

//DELECAO MEDICAMENTOS
///////////////////////////////////////////////////////////////////////
async function deletarMedicacao(id) {
    if (confirm("Deseja remover esta receita de medicamento?")) {
        try {
            await fetch(`${API_BASE_URL}/del_medicacao/${id}`, { method: 'DELETE' });
            carregarMedicoes();
        } catch (err) { console.error(err); }
    }
}

//OPCOES DE CARDS


let idTutorAtual = null;
let idPetAtual = null;
let idMedicamentoAtual = null;

// TUTORES
///////////////////////////////////////////////////////////////////////
async function consultarTutorFormulario(event) {
    event.preventDefault(); 
    const idTutor = document.getElementById('consultaTutorId').value;
    const areaResultado = document.getElementById('resultadoConsultaTutor');
    areaResultado.style.display = 'none';
    document.getElementById('blocoVisualizacaoTutor').style.display = 'block';
    document.getElementById('blocoEdicaoTutor').style.display = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/get_tutor/${idTutor}`);
        const dados = await response.json();
        if (!response.ok) throw new Error(dados.erro || 'Tutor não encontrado.');

        const tutor = dados.tutor; idTutorAtual = tutor.id;

        document.getElementById('resTutorNome').innerText = tutor.nome;
        document.getElementById('resTutorCpf').innerText = formatarTextoCPF(tutor.cpf);
        document.getElementById('resTutorEmail').innerText = tutor.email || 'Não informado';
        document.getElementById('resTutorTelefone').innerText = formatarTextoTelefone(tutor.telefone);
        document.getElementById('resTutorEndereco').innerText = tutor.endereco || 'Não informado';

        document.getElementById('edit-t-nome').value = tutor.nome;
        document.getElementById('edit-t-email').value = tutor.email || '';
        document.getElementById('edit-t-tel').value = formatarTextoTelefone(tutor.telefone);
        document.getElementById('edit-t-end').value = tutor.endereco || '';
        areaResultado.style.display = 'block';
    } catch (erro) { alert(`Erro: ${erro.message}`); }
}

// PETS
///////////////////////////////////////////////////////////////////////
async function consultarPetFormulario(event) {
    event.preventDefault();
    const idPet = document.getElementById('consultaPetId').value;
    const areaResultado = document.getElementById('resultadoConsultaPet');
    areaResultado.style.display = 'none';
    fecharModoEdicaoPetCard();

    try {
        const response = await fetch(`${API_BASE_URL}/get_pet/${idPet}`);
        const dados = await response.json();
        if (!response.ok) throw new Error(dados.erro || 'Pet não encontrado.');

        const pet = dados.pet; idPetAtual = pet.id;
        
        // Busca o tutor correspondente usando a lista global
        const tutorEncontrado = todosOsTutores.find(t => t.id === pet.tutor_id);
        const textoTutorFinal = tutorEncontrado ? tutorEncontrado.nome : `Não encontrado (ID: ${pet.tutor_id})`;

        document.getElementById('resPetNome').innerText = pet.nome;
        document.getElementById('resPetEspecie').innerText = pet.especie;
        document.getElementById('resPetRaca').innerText = pet.raca || 'Não informada';
        document.getElementById('resPetIdade').innerText = pet.idade !== null ? `${pet.idade} anos` : 'Não informada';
        document.getElementById('resPetPeso').innerText = pet.peso !== null ? `${pet.peso} kg` : 'Não informado';
        
        // Injeta o nome de forma segura, checando se o elemento existe no HTML primeiro
        const txtTutor = document.getElementById('resPetTutor');
        if (txtTutor) {
            txtTutor.innerText = textoTutorFinal;
        }

        document.getElementById('edit-p-nome').value = pet.nome;
        document.getElementById('edit-p-especie').value = pet.especie;
        document.getElementById('edit-p-raca').value = pet.raca || '';
        document.getElementById('edit-p-idade').value = pet.idade !== null ? pet.idade : '';
        document.getElementById('edit-p-peso').value = pet.peso !== null ? pet.peso : '';
        areaResultado.style.display = 'block';
    } catch (erro) { alert(`Erro: ${erro.message}`); }
}



// MEDICAMENTOS

// CONSULTA MEDICAMENTO (PREENCHIMENTO DO CARD)
///////////////////////////////////////////////////////////////////////
async function consultarMedicamentoFormulario(event) {
    event.preventDefault();
    const idMedicamento = document.getElementById('consultaMedicamentoId').value;
    const areaResultado = document.getElementById('resultadoConsultaMedicamento');
    areaResultado.style.display = 'none';
    fecharModoEdicaoMedicamentoCard(); 

    try {
        const response = await fetch(`${API_BASE_URL}/get_medicacao/${idMedicamento}`);
        const dados = await response.json();
        if (!response.ok) throw new Error(dados.erro || 'Medicamento não encontrado.');

        const m = dados.medicacao || dados; 
        idMedicamentoAtual = m.id; 

        // TELA 1: Preenche o Bloco de Visualização (mantém o texto original em formato BR)
        document.getElementById('resMedNomePet').innerText = m.nome_pet || `ID Pet: ${m.pet_id}`;
        document.getElementById('resMedNome').innerText = m.nome_medicacao;
        document.getElementById('resMedDosagem').innerText = m.dosagem;
        document.getElementById('resMedFrequencia').innerText = m.frequencia;
        document.getElementById('resMedDataInicio').innerText = m.data_inicio || m.data || 'Não informada';
        document.getElementById('resMedDataFim').innerText = m.data_fim || 'Não informada';

        // TELA 2: Preenche os Inputs do Modo de Edição
        document.getElementById('edit-med-nome').value = m.nome_medicacao;
        document.getElementById('edit-med-dose').value = m.dosagem;
        document.getElementById('edit-med-freq').value = m.frequencia;
        
        // CONVERSÃO AQUI: Transforma "DD/MM/AAAA" vindo do Python para "YYYY-MM-DD" exigido pelo input date
        const dataInicioBR = m.data_inicio || m.data || '';
        const dataFimBR = m.data_fim || '';
        
        document.getElementById('edit-med-data-inicio').value = converterDataParaHTML(dataInicioBR);
        document.getElementById('edit-med-data-fim').value = converterDataParaHTML(dataFimBR);
        
        areaResultado.style.display = 'block'; 
    } catch (erro) { 
        alert(`Erro: ${erro.message}`); 
    }
}


// OPÇÕES DE EDICAO

// TUTORES
///////////////////////////////////////////////////////////////////////
async function salvarEdicaoTutor(id) {
    if (!id) return;
    const formData = new FormData();
    const nome = document.getElementById('edit-t-nome').value;
    const email = document.getElementById('edit-t-email').value;
    const telefone = document.getElementById('edit-t-tel').value.replace(/\D/g, '');
    const endereco = document.getElementById('edit-t-end').value;

    if (nome) formData.append('nome', nome);
    if (email) formData.append('email', email);
    if (telefone) formData.append('telefone', telefone);
    if (endereco) formData.append('endereco', endereco);

    try {
        const res = await fetch(`${API_BASE_URL}/edit_tutor/${id}`, { method: 'PUT', body: formData });
        if (!res.ok) throw new Error((await res.json()).erro || 'Erro ao atualizar tutor.');
        
        alert('Dados do tutor atualizados com sucesso!');
        carregarTutores(); carregarPets();
        document.getElementById('resTutorNome').innerText = nome;
        document.getElementById('resTutorEmail').innerText = email || 'Não informado';
        document.getElementById('resTutorTelefone').innerText = formatarTextoTelefone(telefone);
        document.getElementById('resTutorEndereco').innerText = endereco || 'Não informado';
        fecharModoEdicaoCard();
    } catch (erro) { alert(`Erro ao salvar: ${erro.message}`); }
}

//PETS
///////////////////////////////////////////////////////////////////////
async function salvarEdicaoPetCard(id) {
    if (!id) return;
    const formData = new FormData();
    const nome = document.getElementById('edit-p-nome').value;
    const especie = document.getElementById('edit-p-especie').value;
    const raca = document.getElementById('edit-p-raca').value;
    const idade = document.getElementById('edit-p-idade').value;
    const peso = document.getElementById('edit-p-peso').value;

    if (nome) formData.append('nome', nome);
    if (especie) formData.append('especie', especie);
    formData.append('raca', raca || 'null');
    formData.append('idade', idade !== '' ? idade : 'null');
    formData.append('peso', peso !== '' ? peso : 'null');

    try {
        const res = await fetch(`${API_BASE_URL}/edit_pet/${id}`, { method: 'PUT', body: formData });
        if (!res.ok) throw new Error((await res.json()).erro || 'Erro ao atualizar pet.');

        alert('Dados do pet atualizados com sucesso!');
        carregarPets(); carregarMedicoes();
        document.getElementById('resPetNome').innerText = nome;
        document.getElementById('resPetEspecie').innerText = especie;
        document.getElementById('resPetRaca').innerText = raca || 'Não informada';
        document.getElementById('resPetIdade').innerText = idade !== '' ? `${idade} anos` : 'Não informada';
        document.getElementById('resPetPeso').innerText = peso !== '' ? `${peso} kg` : 'Não informado';
        fecharModoEdicaoPetCard();
    } catch (erro) { alert(`Erro ao salvar: ${erro.message}`); }
}

// MEDICAMENTOS

// SALVAR EDIÇÃO DO CARD
///////////////////////////////////////////////////////////////////////
async function salvarEdicaoMedicamentoCard(id) {
    const dataInicioRaw = document.getElementById('edit-med-data-inicio').value.trim();
    const dataFimRaw = document.getElementById('edit-med-data-fim').value.trim();

    const dataInicioBR = converterDataParaBackend(dataInicioRaw);
    const dataFimBR = converterDataParaBackend(dataFimRaw);

    const formData = new FormData();
    formData.append('nome_medicacao', document.getElementById('edit-med-nome').value.trim());
    formData.append('dosagem', document.getElementById('edit-med-dose').value.trim().toString());
    formData.append('frequencia', document.getElementById('edit-med-freq').value.trim());
    formData.append('data_inicio', dataInicioBR); // Envia formato DD/MM/AAAA
    
    formData.append('data_fim', dataFimRaw !== "" ? dataFimBR : "null");

    try {
        const res = await fetch(`${API_BASE_URL}/edit_medicacao/${id}`, { 
            method: 'PUT', 
            body: formData 
        });

        const dadosResposta = await res.json();

        if (res.ok) {
            alert('Medicamento atualizado com sucesso!');
            carregarMedicoes(); 
            
            // Dá refresh visual nos textos de visualização do card usando o formato BR
            document.getElementById('resMedNome').innerText = formData.get('nome_medicacao');
            document.getElementById('resMedDosagem').innerText = formData.get('dosagem');
            document.getElementById('resMedFrequencia').innerText = formData.get('frequencia');
            document.getElementById('resMedDataInicio').innerText = dataInicioBR;
            document.getElementById('resMedDataFim').innerText = dataFimRaw !== "" ? dataFimBR : 'Não informada';
            
            fecharModoEdicaoMedicamentoCard();
        } else {
            throw new Error(dadosResposta.erro || 'Erro ao salvar os dados no servidor.');
        }
    } catch (err) { 
        alert(`Erro: ${err.message}`); 
    }
}



// BOTOES CARDS

// CARD TUTOR
///////////////////////////////////////////////////////////////////////
function abrirModoEdicaoCard() { document.getElementById('blocoVisualizacaoTutor').style.display = 'none'; document.getElementById('blocoEdicaoTutor').style.display = 'block'; }
function fecharModoEdicaoCard() { document.getElementById('blocoEdicaoTutor').style.display = 'none'; document.getElementById('blocoVisualizacaoTutor').style.display = 'block'; }
function dispararSalvarCard() { salvarEdicaoTutor(idTutorAtual); }
function dispararDeletarCard() { deletarTutor(idTutorAtual); }
function voltarParaHomeCard() { document.getElementById('resultadoConsultaTutor').style.display = 'none'; document.getElementById('consultaTutorId').value = ''; switchPage('home'); }

// CARD PET
///////////////////////////////////////////////////////////////////////
function abrirModoEdicaoPetCard() { document.getElementById('blocoVisualizacaoPet').style.display = 'none'; document.getElementById('blocoEdicaoPet').style.display = 'block'; }
function fecharModoEdicaoPetCard() { document.getElementById('blocoEdicaoPet').style.display = 'none'; document.getElementById('blocoVisualizacaoPet').style.display = 'block'; }
function dispararSalvarPetCard() { salvarEdicaoPetCard(idPetAtual); }
function dispararDeletarPetCard() { if (confirm("Deseja remover o prontuário deste pet permanentemente?")) { deletarPet(idPetAtual); voltarParaHomePetCard(); } }
function voltarParaHomePetCard() { document.getElementById('resultadoConsultaPet').style.display = 'none'; document.getElementById('consultaPetId').value = ''; switchPage('home'); }

// CARD MEDICAMENTO
///////////////////////////////////////////////////////////////////////
function abrirModoEdicaoMedicamentoCard() { document.getElementById('blocoVisualizacaoMedicamento').style.display = 'none'; document.getElementById('blocoEdicaoMedicamento').style.display = 'block'; }
/*
function fecharModoEdicaoMedicamentoCard() { document.getElementById('blocoEdicaoMedicamento').style.display = 'none'; document.getElementById('blocoVisualizacaoMedicamento').style.display = 'block'; }
*/

// Antes: document.getElementById('edit-del-pet').style.display = 'none'...
// Ajustado para o ID correto do escopo de medicamentos:
function fecharModoEdicaoMedicamentoCard() { 
    document.getElementById('blocoEdicaoMedicamento').style.display = 'none'; 
    document.getElementById('blocoVisualizacaoMedicamento').style.display = 'block'; 
}


function dispararSalvarMedicamentoCard() { salvarEdicaoMedicamentoCard(idMedicamentoAtual); }
function dispararDeletarMedicamentoCard() { if (confirm("Deseja remover esta receita permanentemente?")) { deletarMedicacao(idMedicamentoAtual); voltarParaHomeMedicamentoCard(); } }
function voltarParaHomeMedicamentoCard() { document.getElementById('resultadoConsultaMedicamento').style.display = 'none'; document.getElementById('consultaMedicamentoId').value = ''; switchPage('home'); }


//GERACAO PRONTUÁRIO
///////////////////////////////////////////////////////////////////////
let listaPetsProntuario = [];

/*async function abrirSeletorProntuario() {
    const modal = document.getElementById('modal-prontuario');
    if (modal) modal.style.display = 'flex';
    voltarParaSelecao();

    try {
        const resposta = await fetch(`${API_BASE_URL}/get_pets`); 
        if (!resposta.ok) throw new Error('Não foi possível carregar a lista de pets.');
        listaPetsProntuario = await resposta.json();
        const pets = listaPetsProntuario.pets || listaPetsProntuario;
        listaPetsProntuario = pets;

        const select = document.getElementById('select-pet-prontuario');
        select.innerHTML = '<option value="">-- Selecione um Pet --</option>';
        pets.forEach(pet => {
              select.innerHTML += `<option value="${pet.id}">(ID: ${pet.id}) ${pet.nome} [T: ${pet.nome_tutor || 'ID: ' + pet.tutor_id}]</option>`;
        });        
    } catch (erro) { alert(`Erro: ${erro.message}`); }
}

function fecharProntuario() { document.getElementById('modal-prontuario').style.display = 'none'; }

*/

// AJUSTE: Nova função de carga isolada (Substituiu a antiga abrirSeletorProntuario)
async function carregarPetsProntuario() {
    try {
        const resposta = await fetch(`${API_BASE_URL}/get_pets`); 
        if (!resposta.ok) throw new Error('Não foi possível carregar a lista de pets.');
        const dados = await resposta.json();
        const pets = dados.pets || dados;
        listaPetsProntuario = pets;

        const select = document.getElementById('select-pet-prontuario');
        if (select) {
            select.innerHTML = '<option value="">Selecione um Pet...</option>';
            pets.forEach(pet => {
                select.innerHTML += `<option value="${pet.id}">(ID: ${pet.id}) ${pet.nome} [T: ${pet.nome_tutor || 'ID: ' + pet.tutor_id}]</option>`;
            });        
        }
    } catch (erro) { 
        console.error(`Erro ao carregar seletor de prontuário: ${erro.message}`); 
    }
}

// Mantida para controle de abas internas no relatório
function voltarParaSelecao() { 
    document.getElementById('selecao-pet-prontuario').style.display = 'block'; 
    document.getElementById('conteudo-relatorio-prontuario').style.display = 'none'; 
}



function voltarParaSelecao() { document.getElementById('selecao-pet-prontuario').style.display = 'block'; document.getElementById('conteudo-relatorio-prontuario').style.display = 'none'; }

async function gerarDadosProntuario() {
    const petId = parseInt(document.getElementById('select-pet-prontuario').value, 10);
    if (!petId) return alert("Por favor, selecione um Pet antes de prosseguir!");

    const pet = listaPetsProntuario.find(a => a.id === petId);
    if (!pet) return alert("Pet não encontrado na base de dados.");

    try {
        const resTutor = await fetch(`${API_BASE_URL}/get_tutor/${pet.tutor_id}`);
        const dadosTutorJson = await resTutor.json();
        const tutor = dadosTutorJson.tutor;

        const resMed = await fetch(`${API_BASE_URL}/get_medicacoes`);
        const dadosMedicoes = await resMed.json();
        const listaMedicoesBruta = dadosMedicoes.medicacoes || dadosMedicoes;
        const medicacoesDoPet = listaMedicoesBruta.filter(med => med.pet_id === petId);

        document.getElementById('dados-pet-prontuario').innerHTML = `
            <p><strong>ID do Paciente:</strong> #${pet.id}</p>
            <p><strong>Nome:</strong> ${pet.nome}</p>
            <p><strong>Espécie/Raça:</strong> ${pet.especie} / ${pet.raca || '<span>Não informada</span>'}</p>
            <p><strong>Idade:</strong> ${pet.idade !== null ? pet.idade + ' anos' : '<span>Não informada</span>'}</p>
            <p><strong>Peso:</strong> ${pet.peso !== null ? pet.peso + ' kg' : '<span>Não informado</span>'}</p>`;

        document.getElementById('dados-tutor-prontuario').innerHTML = `
            <p><strong>Nome do Responsável:</strong> ${tutor.nome}</p>
            <p><strong>CPF:</strong> ${formatarTextoCPF(tutor.cpf)}</p>
            <p><strong>Telefone de Contato:</strong> ${formatarTextoTelefone(tutor.telefone)}</p>
            <p><strong>E-mail:</strong> ${tutor.email || '<span>Não cadastrado</span>'}</p>
            <p><strong>Endereço:</strong> ${tutor.endereco || '<span>Não cadastrado</span>'}</p>`;

        const listaMed = document.getElementById('dados-medicamentos-prontuario');
        listaMed.innerHTML = ""; 

        if (medicacoesDoPet.length === 0) {
            listaMed.innerHTML = `<li class="sem-tratamento">Nenhum tratamento ativo.</li>`;
        } else {
            medicacoesDoPet.forEach(med => {
                const nomeRemedio = med.nome_medicacao || med.nome_medicamento;
                const terminoTratamento = (med.data_fim && med.data_fim !== "null") ? med.data_fim : "novas orientações.";
                
                listaMed.innerHTML += `
                    <li class="item-medicacao-prontuario">
                        <span class="medicacao-nome">🔹 ${nomeRemedio}</span>
                        <span class="medicacao-detalhe"><strong>Dosagem:</strong> ${med.dosagem}</span>
                        <span class="medicacao-detalhe"><strong>Frequência:</strong> ${med.frequencia}</span>
                        <span class="medicacao-detalhe"><strong>Período:</strong> De ${med.data_inicio} até ${terminoTratamento}</span>
                    </li>`;
            });
        }
        
        document.getElementById('selecao-pet-prontuario').style.display = 'none';
        document.getElementById('conteudo-relatorio-prontuario').style.display = 'block';
    } catch (erro) { alert(`Erro ao gerar prontuário: ${erro.message}`); }
}

function fecharPagina(idPagina) {
    // 1. Esconde a página que foi passada por parâmetro
    const paginaAtual = document.getElementById(idPagina);
    if (paginaAtual) {
        paginaAtual.classList.remove('active');
    }
    
    // 2. Sempre mostra a página principal (home)
    const pageHome = document.getElementById('home');
    if (pageHome) {
        pageHome.classList.add('active');
    }
}


// FORMATAÇÕES
///////////////////////////////////////////////////////////////////////
function mascaraCPF(input) {
    let v = input.value.replace(/\D/g, "");
    if (v.length <= 11) v = v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    input.value = v;
}

function mascaraTelefone(input) {
    let v = input.value.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.length <= 13 ? v.replace(/(\d{4})(\d)/, "$1-$2") : v.replace(/(\d{5})(\d)/, "$1-$2");
    input.value = v;
}

function formatarTextoCPF(cpf) {
    if (!cpf) return 'Não informado';
    let v = cpf.replace(/\D/g, "");
    return v.length <= 11 ? v.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2") : v;
}

function formatarTextoTelefone(tel) {
    if (!tel) return 'Não informado';
    let v = tel.replace(/\D/g, "");
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    return v.length <= 13 ? v.replace(/(\d{4})(\d)/, "$1-$2") : v.replace(/(\d{5})(\d)/, "$1-$2");
}


// Transforma "YYYY-MM-DD" (HTML) para "DD/MM/AAAA" (Backend)
function converterDataParaBackend(dataISO) {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Transforma "DD/MM/AAAA" (Backend) para "YYYY-MM-DD" (HTML)
function converterDataParaHTML(dataBR) {
    if (!dataBR || dataBR.includes("Não informada") || dataBR.toLowerCase() === "null") return "";
    const partes = dataBR.trim().split('/');
    if (partes.length !== 3) return "";
    const [dia, mes, ano] = partes;
    return `${ano}-${mes}-${dia}`;
}

