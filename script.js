async function buscarInformacoesProduto() {
  const produto = document.getElementById('produto').value;
  const resultadoDiv = document.getElementById('resultado');
  const spinner = document.getElementById('spinner');
  
  if (!produto) {
    resultadoDiv.innerHTML = "<p>Você precisa digitar um produto para realizar a pesquisa.</p>";
    return;
  }
  
  // Limpa resultados anteriores e mostra spinner
  spinner.style.display = "block";
  resultadoDiv.innerHTML = "";
  
  try {
    // Tentativa 1: Requisição direta com timeout
    await tentarRequisicaoDireta(produto, spinner, resultadoDiv);
  } catch (error) {
    console.error("Falha na requisição direta:", error);
    
    // Tentativa 2: Usando proxy CORS alternativo
    try {
      await tentarComProxyCors(produto, spinner, resultadoDiv);
    } catch (proxyError) {
      console.error("Falha com proxy CORS:", proxyError);
      resultadoDiv.innerHTML = `
        <p>Não foi possível conectar ao servidor.</p>
        <p>Detalhes: ${proxyError.message}</p>
        <p>Possível problema de configuração CORS no servidor.</p>
      `;
    }
  } finally {
    spinner.style.display = "none";
  }
}

async function tentarRequisicaoDireta(produto, spinner, resultadoDiv) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 100000); 
  
  const url = `https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`;
  
  const response = await fetch(url, {
    method: 'GET', // Força método GET
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    signal: controller.signal
  });
  
  clearTimeout(timeoutId);
  
  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }
  
  const data = await response.json();
  processarResposta(data, resultadoDiv);
}

async function tentarComProxyCors(produto, spinner, resultadoDiv) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 100000); // Timeout de 100 segundos
  
  const urlOriginal = `https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`;
  const urlComProxy = `https://cors-anywhere.herokuapp.com/${urlOriginal}`;
  
  const response = await fetch(urlComProxy, {
    method: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json'
    },
    signal: controller.signal
  });
  
  clearTimeout(timeoutId);
  
  if (!response.ok) {
    throw new Error(`Erro no proxy: ${response.status}`);
  }
  
  const data = await response.json();
  processarResposta(data, resultadoDiv);
}

function processarResposta(data, resultadoDiv) {
  if (!Array.isArray(data)) {
    throw new Error("Formato de resposta inválido");
  }

  const mensagensValidas = data.filter(m => m.content?.trim());
  
  if (mensagensValidas.length === 0) {
    throw new Error("Nenhuma informação encontrada para este produto");
  }

  const finalContent = mensagensValidas[mensagensValidas.length - 1].content;
  const markdownHtml = marked.parse(finalContent);

  resultadoDiv.innerHTML = `
    <div class="markdown-content">${markdownHtml}</div>
    <div class="accordion">
      <div class="accordion-header" onclick="toggleAccordion()">Como a IA chegou nessa resposta?</div>
      <div class="accordion-content" id="accordion-content">
        <div class="messages-container">
          ${mensagensValidas.map(m => `
            <div class="message ${m.type === 'human' ? 'human' : 'ai'}">
              <strong>${m.type === 'human' ? 'Humano' : 'IA'}:</strong> ${m.content.replace(/\n/g, "<br>")}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function toggleAccordion() {
  const content = document.getElementById('accordion-content');
  content.style.display = content.style.display === "block" ? "none" : "block";
}
