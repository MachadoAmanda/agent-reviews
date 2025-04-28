.then(text => {
  spinner.style.display = "none";
  
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    resultadoDiv.innerHTML = "<p>Erro ao interpretar resposta da IA.</p>";
    return;
  }

  if (!Array.isArray(data)) {
    resultadoDiv.innerHTML = "<p>Formato inesperado na resposta.</p>";
    return;
  }

  // ⚡️ Filtrar apenas mensagens que têm `content` não vazio
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
