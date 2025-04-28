function buscarInformacoesProduto() {
    const produto = document.getElementById('produto').value;
    const resultadoDiv = document.getElementById('resultado');
    const spinner = document.getElementById('spinner');
    
    if (!produto) {
        resultadoDiv.textContent = "Você precisa digitar um produto para realizar a pesquisa.";
        return;
    }
    
    spinner.style.display = "block";
    resultadoDiv.textContent = "";

    const urlOriginal = `https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`;
    const urlComProxy = `https://proxy.cors.sh/${urlOriginal}`;

    fetch(urlComProxy, {
        headers: {
            'x-cors-api-key': 'temp_key'  // Pode usar 'temp_key' gratuito
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Erro na requisição: " + response.status);
        }
        return response.text();
    })
    .then(texto => {
        spinner.style.display = "none";
        let mensagens;
        try {
            mensagens = JSON.parse(texto);
        } catch (error) {
            resultadoDiv.textContent = "Erro ao interpretar resposta: " + error.message;
            return;
        }
        renderizarResposta(mensagens);
    })
    .catch(error => {
        spinner.style.display = "none";
        resultadoDiv.textContent = "Erro: " + error.message;
    });
}

function renderizarResposta(mensagens) {
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '';

    mensagens.forEach(msg => {
        if (msg.type === 'human') {
            resultadoDiv.appendChild(criarMensagem('🧑', msg.content));
        }
        else if (msg.type === 'ai') {
            resultadoDiv.appendChild(criarMensagem('🤖', msg.content));
        }
        else if (msg.type === 'tool') {
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
    if (!texto) return '';
    return texto
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/__(.*?)__/g, '<i>$1</i>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}
