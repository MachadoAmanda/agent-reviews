// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const input = document.querySelector('input');
  const resultadoDiv = document.getElementById('resultado');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const produto = input.value.trim();
    if (!produto) return;

    resultadoDiv.innerHTML = "Carregando...";

    try {
      const response = await fetch(`https://api.exemplo.com/produto?q=${encodeURIComponent(produto)}`);
      const data = await response.json();
      renderizarResposta(data);
    } catch (error) {
      console.error(error);
      resultadoDiv.innerHTML = "Erro ao buscar informações.";
    }
  });

  function renderizarResposta(mensagens) {
    resultadoDiv.innerHTML = '';

    mensagens.forEach(msg => {
      if (msg.type === 'human') {
        resultadoDiv.appendChild(criarMensagem('🧑', msg.content));
      }
      else if (msg.type === 'ai') {
        resultadoDiv.appendChild(criarMensagem('🤖', msg.content));
      }
      else if (msg.type === 'tool') {
        // Trata conteúdo vindo de "tool"
        const partes = extrairSnippets(msg.content);
        partes.forEach(parte => {
          resultadoDiv.appendChild(criarCardSnippet(parte));
        });
      }
      else if (msg.type === 'function' || (msg.additional_kwargs?.tool_calls?.length > 0)) {
        const toolCalls = msg.additional_kwargs?.tool_calls || [msg];
        toolCalls.forEach(toolCall => {
          resultadoDiv.appendChild(criarMensagem('🛠️ Função', formatarFunction(toolCall)));
        });
      }
    });
  }

  function criarMensagem(prefixo, texto) {
    const div = document.createElement('div');
    div.className = 'mensagem';
    div.innerHTML = `<strong>${prefixo}</strong> ${formatarMarkdown(texto)}`;
    return div;
  }

  function criarCardSnippet({ snippet, title, link }) {
    const div = document.createElement('div');
    div.className = 'card-snippet';
    div.innerHTML = `
      <h3><a href="${link}" target="_blank">${title}</a></h3>
      <p>${snippet}</p>
    `;
    return div;
  }

  function extrairSnippets(textoBruto) {
    const partes = [];
    const regex = /snippet:\s(.*?),\s*title:\s(.*?),\s*link:\s(https?:\/\/[^\s,]+)/gms;

    let match;
    while ((match = regex.exec(textoBruto)) !== null) {
      partes.push({
        snippet: match[1].trim(),
        title: match[2].trim(),
        link: match[3].trim()
      });
    }

    return partes;
  }

  function formatarFunction(toolCall) {
    try {
      const funcao = toolCall.function || toolCall;
      const nome = funcao.name || 'Função desconhecida';
      const args = JSON.parse(funcao.arguments || '{}');
      return `<strong>${nome}</strong><br><pre>${JSON.stringify(args, null, 2)}</pre>`;
    } catch (error) {
      return `<pre>${JSON.stringify(toolCall, null, 2)}</pre>`;
    }
  }

  function formatarMarkdown(texto) {
    // Simples - pode ser melhorado usando 'marked' se quiser
    if (!texto) return '';
    return texto
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Negrito
      .replace(/__(.*?)__/g, '<i>$1</i>')     // Itálico
      .replace(/`([^`]+)`/g, '<code>$1</code>'); // Código
  }
});
