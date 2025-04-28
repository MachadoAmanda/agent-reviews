function buscarInformacoesProduto() {
  const produto = document.getElementById('produto').value;
  const resultadoDiv = document.getElementById('resultado');
  const spinner = document.getElementById('spinner');
  
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
      'x-cors-api-key': 'temp_key'
    }
  })
  .then(response => response.text())
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

    const finalContent = data[data.length - 1].content;
    const markdownHtml = marked.parse(finalContent);

    resultadoDiv.innerHTML = `
      <div class="markdown-content">${markdownHtml}</div>
      <div class="accordion">
        <div class="accordion-header" onclick="toggleAccordion()">Como a IA chegou nessa resposta?</
