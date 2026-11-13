// === 1. ADICIONE A IDENTIDADE DO CLIENTE AQUI NA LINHA 1 ===
const ID_CLIENTE = 1;

// ATENÇÃO: Esta linha deve ficar solta no topo do arquivo script.js!
let credenciaisAdmin = { user: '', pass: '' };
let listaGlobalProdutos = [];

// ---------------------------------------------------
// COMUNICAÇÃO COM O SERVIDOR
// ---------------------------------------------------

// === 2. ALTERE AS URLs AQUI PARA INCLUIR O ID DO CLIENTE ===
// Note que agora usamos crases ( ` ) no lugar de aspas simples ( ' )
const API_URL = `https://skewers-order-backend.vercel.app/api/cardapio?usuario=${ID_CLIENTE}`;
const url = `https://skewers-order-backend.vercel.app/api/cardapio?usuario=${ID_CLIENTE}`;

// Daqui para baixo, o seu código continua EXATAMENTE IGUAL:
fetch(url)
  .then(resposta => resposta.json())
  .then(dados => {
    console.log("Meus espetinhos:", dados.produtos);
    // A LINHA MÁGICA QUE FALTAVA: Guarda os produtos na memória global!
    listaGlobalProdutos = dados.produtos;
  })
  .catch(erro => console.error("Erro:", erro));

// ... resto do seu código (comidas, bebidas, function carregarCardapio) ...

let comidas = [];
let bebidas = [];
let carrinho = {};
let dadosCliente = {};

// CORREÇÃO: A gaveta do WhatsApp foi criada aqui
let numeroZap = "";

async function carregarCardapio() {
  try {
    const API_URL = 'https://skewers-order-backend.vercel.app';
    const resposta = await fetch(url);

    if (!resposta.ok) {
      throw new Error("Erro na API");
    }

    const dadosDoServidor = await resposta.json();
    numeroZap = dadosDoServidor.whatsapp;

    // 1. Abre a "caixa grande" e prepara os produtos
    const produtosProntos = dadosDoServidor.produtos.map(item => {
      return {
        id: item.id,
        nome: item.nome,
        preco: parseFloat(item.preco),
        disponivel: item.disponivel,
        categoria: item.categoria
      };
    });

    // 2. Separa as "Comidas" e "Bebidas"
    comidas = produtosProntos.filter(item =>
      item.categoria.toLowerCase() === 'comida'
    );

    bebidas = produtosProntos.filter(item =>
      item.categoria.toLowerCase() === 'bebida'
    );

    // 3. Coloca os itens na "vitrine" da página
    renderizarLista(comidas, 'lista-carnes', 'item-carne');
    renderizarLista(bebidas, 'lista-bebidas', 'item-bebida');

  } catch (erro) {
    console.error("Erro ao buscar cardápio:", erro);
  }
}


// ---------------------------------------------------
// FUNÇÕES DE INTERFACE VISUAL E CARRINHO
// ---------------------------------------------------

// Renderizar Produtos na Tela
function renderizarLista(itens, idContainer, classeCor) {
  const container = document.getElementById(idContainer);

  // Dica de Especialista (Nível Médio): Essa trava de segurança evita que 
  // o seu site quebre caso alguém apague a div do HTML sem querer.
  if (!container) {
    console.error(`Erro: Não encontrei a div id="${idContainer}" no HTML.`);
    return;
  }

  container.innerHTML = '';

  itens.forEach(item => {
    // Se o item foi desativado no painel gerencial, ele é pulado e não aparece
    if (!item.disponivel) return;

    // Inicia a quantidade desse item no carrinho como Zero
    carrinho[item.id] = 0;

    const div = document.createElement('div');
    div.className = `item-lista ${classeCor}`; // Adicionei 'item-lista' para manter o CSS que fizemos

    // ... aqui você continua com o restante do seu código (os botões de + e -)

    let precoFormatado = item.preco.toFixed(2).replace('.', ',');

    div.innerHTML = `
            <div>
                <strong>${item.nome}</strong><br>
                <small>R$ ${precoFormatado}</small>
            </div>
            <div class="controles">
                <button class="btn-qtd" 
                        onclick="alterarQtd('${item.id}', -1)">-</button>
                <span id="qtd-${item.id}">0</span>
                <button class="btn-qtd" 
                        onclick="alterarQtd('${item.id}', 1)">+</button>
            </div>
        `;
    container.appendChild(div);
  });
}

// Inicializa o processo buscando os dados ao abrir a página
carregarCardapio();

// ===================================================
// FUNÇÕES DE INTERAÇÃO E MODAIS
// ===================================================

function alterarQtd(id, valor) {
  // Usamos == (dois iguais em vez de três) para ignorar a diferença entre texto e número
  const produto = listaGlobalProdutos.find(item => item.id == id);

  // Escudo protetor: Se por acaso não achar o produto, a função trava sem quebrar o site
  if (!produto) {
    console.error("Erro: Produto não encontrado na memória com o ID", id);
    return;
  }

  const novaQuantidade = (carrinho[id] || 0) + valor;

  if (valor > 0) {
    if (!produto.disponivel) {
      alert("Item indisponível!");
      return;
    }
    if (produto.estoque <= 0) {
      alert("Estoque zerado!");
      return;
    }
    if (novaQuantidade > produto.estoque) {
      alert("Item em falta! Temos apenas " + produto.estoque + " unidade(s) disponível(is).");
      return;
    }
  }

  if (novaQuantidade >= 0) {
    carrinho[id] = novaQuantidade;
    document.getElementById(`qtd-${id}`).innerText = carrinho[id];
  }
}

function abrirModalCadastro() {
  document.getElementById('modalCadastro').style.display = 'block';
}

function fecharModal(id) {
  document.getElementById(id).style.display = 'none';
}

function abrirModalAdmin() {
  document.getElementById('modalAdmin').style.display = 'block';
}

function verificarEntrega() {
  const tipo = document.getElementById('cli-tipo').value;
  const divEnd = document.getElementById('div-endereco');
  divEnd.style.display = (tipo === 'entregar') ? 'block' : 'none';
}

function salvarCadastro() {
  dadosCliente = {
    nome: document.getElementById('cli-nome').value,
    telefone: document.getElementById('cli-telefone').value,
    tipo: document.getElementById('cli-tipo').value,
    endereco: document.getElementById('cli-endereco').value
  };

  if (!dadosCliente.nome) {
    return alert("Por favor, preencha o seu nome!");
  }

  fecharModal('modalCadastro');
  alert("Cadastro salvo! Escolha os seus espetinhos.");
}

// NOVA FUNÇÃO DO BOTÃO VOLTAR (Colocada logo abaixo)
function fecharModalCadastro() {
  const janelaCadastro = document.getElementById('modalCadastro');

  if (janelaCadastro) {
    janelaCadastro.style.display = 'none';
  }
}

function abrirResumo() {
  if (!dadosCliente.nome) {
    alert("Clique em INICIAR PEDIDO primeiro para se identificar.");
    return abrirModalCadastro();
  }

  let tipoTxt = dadosCliente.tipo === 'entregar'
    ? `Entrega (${dadosCliente.endereco})`
    : 'Retirada no local';

  let html = `<strong>Cliente:</strong> ${dadosCliente.nome}<br>`;
  html += `<strong>Tipo:</strong> ${tipoTxt}<br><br>`;

  let total = 0;
  const todosItens = [...comidas, ...bebidas];

  // Variável para verificar se escolheu algo
  let temItem = false;

  html += `<strong>Itens Escolhidos:</strong><br>`;

  todosItens.forEach(item => {
    let qtd = carrinho[item.id];
    if (qtd > 0) {
      temItem = true;
      let subtotal = qtd * item.preco;
      total += subtotal;
      let subFormatado = subtotal.toFixed(2).replace('.', ',');
      html += `${qtd}x ${item.nome} - R$ ${subFormatado}<br>`;
    }
  });

  // Trava: se não escolheu nada, avisa e não abre o resumo
  if (!temItem) {
    return alert("Por favor, escolha pelo menos um item antes de encerrar o pedido!");
  }

  if (dadosCliente.tipo === 'entregar') {
    html += `<br><small>* Taxa de entrega a combinar.</small>`;
  }

  document.getElementById('conteudo-resumo').innerHTML = html;
  let totalFormatado = total.toFixed(2).replace('.', ',');
  document.getElementById('valor-total').innerText = `Total: R$ ${totalFormatado}`;

  document.getElementById('modalResumo').style.display = 'block';
}

function enviarPedidoWhatsApp() {
  // 1. Captura os dados do cliente e observações
  const nome = document.getElementById('nomeCliente')?.value || 'Cliente não identificado';
  const telefone = document.getElementById('telefoneCliente')?.value || '';
  const endereco = document.getElementById('enderecoCliente')?.value || '';

  const querFarofaElement = document.querySelector('input[name="farofa"]:checked');
  const querFarofa = querFarofaElement ? querFarofaElement.value : '';

  const querVinagreteElement = document.querySelector('input[name="vinagrete"]:checked');
  const querVinagrete = querVinagreteElement ? querVinagreteElement.value : '';

  const obsElement = document.getElementById('obs-pedido');
  const obs = obsElement ? obsElement.value : '';

  // Lógica de Entrega/Retirada
  const isEntrega = true;
  const txtEntrega = isEntrega ? "(X)" : "( )";
  const txtRetira = !isEntrega ? "(X)" : "( )";
  const taxaEntrega = isEntrega ? 5.00 : 0.00;

  // 2. Monta os itens e prepara a baixa de estoque
  let itensTexto = "*Resumo dos Itens:*\n\n";
  let totalSoma = 0;
  const itensComprados = [];

  for (let id in carrinho) {
    if (carrinho[id] > 0) {
      const produto = listaGlobalProdutos.find(item => String(item.id) === String(id));

      if (produto) {
        let subtotal = carrinho[id] * produto.preco;
        totalSoma += subtotal;

        let qtdFormatada = carrinho[id].toString().padStart(2, '0');
        itensTexto += `▪️ ${qtdFormatada}x ${produto.nome} - R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;

        itensComprados.push({ id: produto.id, quantidade: carrinho[id] });
      }
    }
  }

  // Adiciona os acompanhamentos 
  if (querFarofa || querVinagrete) {
    itensTexto += `\n*Acompanhamentos (Espetos):*\n`;
    if (querFarofa) itensTexto += `Farofa: ${querFarofa}\n`;
    if (querVinagrete) itensTexto += `Vinagrete: ${querVinagrete}\n`;
  }

  if (totalSoma === 0) {
    alert("O carrinho está vazio!");
    return;
  }

  // === A LINHA QUE FALTAVA ESTÁ AQUI ===
  let valorTotal = totalSoma + taxaEntrega;

  // 3. Geradores de Códigos (Pedido e Verificação)
  const data = new Date();
  const stringData = data.getFullYear().toString() +
    (data.getMonth() + 1).toString().padStart(2, '0') +
    data.getDate().toString().padStart(2, '0') +
    data.getHours().toString().padStart(2, '0') +
    data.getMinutes().toString().padStart(2, '0') +
    data.getSeconds().toString().padStart(2, '0');
  const randomID = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  const numPedido = `RI-${stringData}-${randomID}`;
  const hashVerificacao = Math.random().toString(36).substring(2, 14).toUpperCase();

  // 4. Monta a Mensagem Final
  let mensagem =
    `*${nome}*
${telefone}
${endereco}
Entrega: ${txtEntrega}
Retira: ${txtRetira}

${itensTexto.trim()}
-------------------------------------------------------
Soma dos Itens = R$ ${totalSoma.toFixed(2).replace('.', ',')}
Taxa de Entrega = R$ ${taxaEntrega.toFixed(2).replace('.', ',')}

*===================================*
💰 *VALOR TOTAL: R$ ${valorTotal.toFixed(2).replace('.', ',')}* 💰
*===================================*
${obs.trim() !== "" ? `\n*Observações:*\n${obs}\n` : ""}
Pedido: ${numPedido}
Verificação: ${hashVerificacao}

💰 *Pagamento via PIX:*
Chave: 30571173845
(Por favor, envie o comprovante por aqui ou solicite o link !)`;

  // 5. Envia para o WhatsApp
  let url = `https://wa.me/${numeroZap}?text=` + encodeURIComponent(mensagem);
  window.open(url, '_blank');

  // 6. Abater Estoque Automático
  if (itensComprados.length > 0) {
    fetch('https://skewers-order-backend.vercel.app/api/registrar-venda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itensCarrinho: itensComprados })
    }).catch(erro => console.error("Erro ao abater estoque:", erro));
  }

  // 7. Recarrega a página após 2 segundos
  setTimeout(() => {
    window.location.reload();
  }, 2000);
}


// ===================================================
// ÁREA DE ADMINISTRAÇÃO E GESTÃO DE ESTOQUE
// ===================================================

// Criamos uma "memória" para o site saber que o chefe entrou
let chefeLogado = false;

async function loginAdmin(event) {
  if (event) event.preventDefault();

  const userDigitado = document.getElementById('admin-user').value;
  const senhaDigitada = document.getElementById('admin-pass').value;

  const dadosDoLogin = {
    usuario: userDigitado,
    senha: senhaDigitada
  };

  console.log("O que estou enviando:", dadosDoLogin);

  try {
    // Nova URL da Vercel apontando para a verificação de Login
    const url = 'https://skewers-order-backend.vercel.app/admin/login';

    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'content-Type': 'application/json' },
      body: JSON.stringify(dadosDoLogin)
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      alert("Acesso Liberado, Chefe!");
      chefeLogado = true;

      // ==========================================
      // A MÁGICA ACONTECE AQUI:
      // Guarda os dados digitados na memória do site
      credenciaisAdmin.user = userDigitado;
      credenciaisAdmin.pass = senhaDigitada;
      // ==========================================

      fecharModal('modalAdmin');
      abrirPainelAdmin();

    } else {
      alert("Ops! " + resultado.erro);
    }

  } catch (erro) {
    console.error("Erro na comunicação:", erro);
  }
}

// ==========================================
// 1. ABRE O PAINEL E GUARDA NA MEMÓRIA
// ==========================================
async function abrirPainelAdmin() {
  const cabecalho = document.querySelector('header');
  if (cabecalho) cabecalho.style.display = 'none';

  const principal = document.querySelector('main');
  if (principal) principal.style.display = 'none';

  const rodape = document.querySelector('footer');
  if (rodape) rodape.style.display = 'none';

  const painel = document.getElementById('painel-admin');
  if (painel) {
    painel.style.display = 'block';
  } else {
    console.error("FALTA NO HTML: Não achei a div id='painel-admin'");
  }

  // Nova URL da Vercel para puxar a lista de produtos no Painel Admin
  const url = 'https://skewers-order-backend.vercel.app/api/cardapio';

  const resposta = await fetch(url);
  const dados = await resposta.json();

  // A MEMÓRIA: Guarda tudo aqui em vez de desenhar direto
  listaGlobalProdutos = dados.produtos ? dados.produtos : dados;

  desenharPainel();
}


// ==========================================
// 2. CONSTRÓI A TELA BASEADA NA MEMÓRIA (Com Estoque)
// ==========================================
function desenharPainel() {
  const divLista = document.getElementById('lista-admin');

  if (!divLista) {
    console.error("Erro: A div 'lista-admin' sumiu do HTML!");
    return;
  }

  divLista.innerHTML = ''; // Limpa a tela

  // 1. O Botão Mestre que salva o "Carrinho" do administrador
  divLista.innerHTML += `
    <button onclick="salvarTudoNoBanco()" 
      style="background-color: #007bff; color: white; padding: 15px; 
      width: 100%; border: none; border-radius: 5px; cursor: pointer; 
      font-weight: bold; font-size: 16px; margin-bottom: 20px;">
      💾 Salvar Todas as Alterações
    </button>
  `;

  // 2. Cria os blocos vazios para Carnes e Bebidas
  divLista.innerHTML += `
    <div style="margin-bottom: 30px;">
      <h3 style="color: #ffb300; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 15px;">🥩 Carnes e Acompanhamentos</h3>
      <div id="admin-container-carnes"></div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #ffb300; border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 15px;">🥤 Bebidas</h3>
      <div id="admin-container-bebidas"></div>
    </div>
  `;

  // 3. Pega as divs que acabamos de criar
  const containerCarnes = document.getElementById('admin-container-carnes');
  const containerBebidas = document.getElementById('admin-container-bebidas');

  // 4. Separa os produtos da memória
  const comidasPainel = listaGlobalProdutos.filter(item => item.categoria.toLowerCase() === 'comida');
  const bebidasPainel = listaGlobalProdutos.filter(item => item.categoria.toLowerCase() === 'bebida');

  // 5. Função interna que desenha cada item
  function desenharItemAdmin(item, containerDestino) {
    let corBotao = item.disponivel ? '#ff4757' : '#2ed573';
    let textoBotao = item.disponivel ? 'Desativar' : 'Ativar';

    // Usamos insertAdjacentHTML para melhor performance e não quebrar a tela com IDs de letras
    containerDestino.insertAdjacentHTML('beforeend', `
    <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      
      <!-- CABEÇALHO (Nome + Botão Desativar) -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div>
          <h3 style="margin: 0; color: white; font-size: 18px;">${item.nome}</h3>
          <p style="margin: 0; color: #ccc; font-size: 14px;">R$ ${parseFloat(item.preco).toFixed(2)} - ${item.categoria}</p>
        </div>
        
        <!-- Aspas simples no ID adicionadas aqui -->
        <button onclick="alternarStatus('${item.id}')" 
          style="background-color: ${corBotao}; color: white; border: none; padding: 8px 16px; border-radius: 5px; font-weight: bold; cursor: pointer; min-width: 100px;">
          ${textoBotao}
        </button>
      </div>

      <!-- CAIXA PRETA (Estoque + Estornar) -->
      <div style="display: flex; justify-content: space-between; align-items: center; background-color: #222; padding: 12px; border-radius: 5px;">
        
        <label style="color: white; font-size: 14px; font-weight: bold;">Estoque Atual:</label>
        
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="number" id="estoque_${item.id}" value="${item.estoque || 0}" 
            onchange="atualizarEstoqueLocal('${item.id}', this.value)"
            style="width: 60px; padding: 8px; border-radius: 4px; border: none; text-align: center; font-weight: bold; font-size: 14px;">
          
          <button onclick="solicitarEstorno('${item.id}', '${item.nome}')" 
            style="background-color: #ffa502; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px;">
            ↩ Estornar
          </button>
        </div>
      </div>
    </div>
    `);
  }

  // 6. Roda a função para preencher a tela
  comidasPainel.forEach(item => desenharItemAdmin(item, containerCarnes));
  bebidasPainel.forEach(item => desenharItemAdmin(item, containerBebidas));
}



// ==========================================
// 3. MUDA A COR NO CLIQUE (NA MEMÓRIA)
// ==========================================
function alternarStatus(id) {
  // O segredo está aqui: transformar os dois lados em String (texto) antes de comparar
  const produto = listaGlobalProdutos.find(item => String(item.id) === String(id));

  if (produto) {
    // Inverte o status de disponível
    produto.disponivel = !produto.disponivel;

    // Atualiza a tela na hora para o botão ficar vermelho/verde
    desenharPainel();
  } else {
    console.error("Erro: Produto não encontrado com o ID:", id);
  }
}

// ==========================================
// 3.5 FUNÇÕES DE ESTOQUE LOCAL
// ==========================================
function atualizarEstoqueLocal(idProduto, novoValor) {
  const produto = listaGlobalProdutos.find(item => item.id === idProduto);
  if (produto) {
    produto.estoque = parseInt(novoValor); // Guarda o valor na memória para salvar depois
  }
}

async function solicitarEstorno(idProduto, nomeProduto) {
  const qtdDevolvida = prompt(`Quantos espetinhos de "${nomeProduto}" foram devolvidos pelo motoboy?`);

  if (!qtdDevolvida || isNaN(qtdDevolvida) || Number(qtdDevolvida) <= 0) {
    return; // Cancela se o gestor não digitar um número válido
  }

  try {
    const url = 'https://skewers-order-backend.vercel.app/admin/estornar';
    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: credenciaisAdmin.user,
        senha: credenciaisAdmin.pass,
        itensEstorno: [{ id: idProduto, quantidade: Number(qtdDevolvida) }]
      })
    });

    if (resposta.ok) {
      alert(`${qtdDevolvida} unidade(s) devolvida(s) ao estoque com sucesso!`);
      // Recarrega o painel para puxar o novo estoque atualizado do banco
      abrirPainelAdmin();
    } else {
      alert("Erro ao processar devolução.");
    }
  } catch (erro) {
    console.error("Erro no estorno:", erro);
  }
}

// ==========================================
// 4. ENVIA O LOTE PARA O BANCO DE DADOS
// ==========================================
async function salvarTudoNoBanco() {
  try {
    const url = 'https://skewers-order-backend.vercel.app/admin/atualizar-lote';

    const resposta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: credenciaisAdmin.user,
        senha: credenciaisAdmin.pass,
        produtos: listaGlobalProdutos // <-- Atenção à mudança de nome aqui
      })
    });

    if (resposta.ok) {
      alert("Cardápio e Estoque salvos definitivamente no banco de dados!");
    } else {
      const resultado = await resposta.json();
      alert("Erro ao salvar: " + resultado.erro);
    }
  } catch (erro) {
    console.error("Falha na comunicação:", erro);
  }
}
// ==========================================
// 5. FECHAR O PAINEL E VOLTAR PARA A LOJA
// ==========================================
function fecharPainelAdmin() {
  // 1. Esconde o painel do gerente
  const painel = document.getElementById('painel-admin');
  if (painel) painel.style.display = 'none';

  // 2. Mostra a loja dos clientes novamente
  const cabecalho = document.querySelector('header');
  if (cabecalho) cabecalho.style.display = 'block';

  const principal = document.querySelector('main');
  if (principal) principal.style.display = 'block';

  const rodape = document.querySelector('footer');
  if (rodape) rodape.style.display = 'block';

  // 3. Limpa a memória por segurança (faz "logout")
  credenciaisAdmin = { user: '', pass: '' };

  // 4. Recarrega o cardápio da tela inicial para mostrar as alterações
  if (typeof carregarCardapio === 'function') {
    carregarCardapio();
  }
}

function limparCarrinho() {
  // 1. Zera a memória do pedido
  carrinho = {};

  // 2. Zera todos os números que aparecem na tela para o cliente
  listaGlobalProdutos.forEach(item => {
    const contador = document.getElementById(`qtd-${item.id}`);
    if (contador) {
      contador.innerText = "0";
    }
  });

  alert("O seu pedido foi limpo!");
}