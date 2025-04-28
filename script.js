function buscarInformacoesProduto() {
  const produto = document.getElementById('produto').value;
  const resultadoDiv = document.getElementById('resultado');
  const spinner = document.getElementById('spinner'); // Corrigi o ID para 'spinner' (tinha um typo)
  
  if (!produto) {
    resultadoDiv.innerHTML = "<p>Você precisa digitar um produto para realizar a pesquisa.</p>";
    return;
  }
  
  spinner.style.display = "block";
  resultadoDiv.innerHTML = "";

  const urlOriginal = `https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`;
  const urlComProxy = `https://proxy.cors.sh/${urlOriginal}`;

  fetch(urlComProxy, {
    headers: {
      'x-cors-api-key': 'temp_key',
      'Origin': window.location.origin
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text(); // Primeiro pegamos o texto da resposta
  })
  .then(text => {
    spinner.style.display = "none";
    
    let data;
    try {
      data = JSON.parse(text); // Tentamos parsear o texto como JSON
    } catch (e) {
      console.error("Erro ao parsear JSON:", e);
      resultadoDiv.innerHTML = "<p>Erro ao interpretar resposta da IA.</p>";
      return;
    }

    if (!Array.isArray(data)) {
      resultadoDiv.innerHTML = "<p>Formato inesperado na resposta.</p>";
      return;
    }

    // Filtrar apenas mensagens que têm `content` não vazio
    const mensagensValidas = data.filter(m => m.content && m.content.trim() !== "");

    if (mensagensValidas.length === 0) {
      resultadoDiv.innerHTML = "<p>Nenhuma resposta válida encontrada.</p>";
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
  })
  .catch(error => {
    spinner.style.display = "none";
    console.error("Erro na requisição:", error);
    resultadoDiv.innerHTML = `<p>Erro ao buscar informações: ${error.message}</p>`;
  });
}

function toggleAccordion() {
  const content = document.getElementById('accordion-content');
  content.style.display = content.style.display === "block" ? "none" : "block";
}
