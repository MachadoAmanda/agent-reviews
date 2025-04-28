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
    .then(data => {
        spinner.style.display = "none";
        resultadoDiv.textContent = data;
    })
    .catch(error => {
        spinner.style.display = "none";
        resultadoDiv.textContent = "Erro: " + error.message;
    });
}
