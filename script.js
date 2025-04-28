async function buscarInformacoesProduto() {
  const produto = document.getElementById('produto').value;
  const resultadoDiv = document.getElementById('resultado');
  const spinner = document.getElementById('spinner');
  
  if (!produto) {
    resultadoDiv.innerHTML = "<p>Você precisa digitar um produto para realizar a pesquisa.</p>";
    return;
  }
  
  spinner.style.display = "block";
  resultadoDiv.innerHTML = "";

  try {
    // URL direta (teste primeiro sem proxy)
    const url = `https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`;
    
    const response = await fetch(url, {
      mode: 'cors', // força o modo CORS
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Processamento da resposta
    if (!Array.isArray(data)) {
      throw new Error("Formato de resposta inválido");
    }

    const mensagensValidas = data.filter(m => m.content?.trim());
    
    if (mensagensValidas.length === 0) {
      resultadoDiv.innerHTML = "<p>Nenhuma informação encontrada para este produto.</p>";
      return;
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
  } catch (error) {
    console.error("Erro na requisição:", error);
    resultadoDiv.innerHTML = `
      <p>Não foi possível obter as informações. Erro: ${error.message}</p>
      <p>Tente novamente ou verifique sua conexão.</p>
    `;
    
    // Tentativa alternativa com proxy CORS
    await tentarComProxyCors(produto, spinner, resultadoDiv);
  } finally {
    spinner.style.display = "none";
  }
}

async function tentarComProxyCors(produto, spinner, resultadoDiv) {
  try {
    spinner.style.display = "block";
    const urlOriginal = `https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`;
    const urlComProxy = `https://cors-anywhere.herokuapp.com/${urlOriginal}`;
    
    const response = await fetch(urlComProxy, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error(`Erro no proxy: ${response.status}`);
    
    const data = await response.json();
    
    // ... (mesmo processamento da resposta que na função principal)
  } catch (proxyError) {
    console.error("Erro no proxy CORS:", proxyError);
    resultadoDiv.innerHTML += `<p>Também falhou com proxy CORS: ${proxyError.message}</p>`;
  }
}

function toggleAccordion() {
  const content = document.getElementById('accordion-content');
  content.style.display = content.style.display === "block" ? "none" : "block";
}
