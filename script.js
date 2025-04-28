function buscarInformacoesProduto() {
    const produto = document.getElementById('produto').value;
    const resultadoDiv = document.getElementById('resultado');
    const spinner = document.getElementById('spinner');
    
    if (!produto) {
        resultadoDiv.textContent = "Você precisa digitar um produto para realizar a pesquisa.";
        return;
    }
    
    spinner.style.display = "block";
    resultadoDiv.textContent = "Buscando...";

    const urlOriginal = `https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`;
    const urlComProxy = `https://corsproxy.io/?${encodeURIComponent(urlOriginal)}`;

    fetch(urlComProxy)
        .then(response => {
            if (!response.ok) {
                throw new Error("Erro na requisição: " + response.status);
            }
            return response.text(); // Aqui tratamos como texto mesmo!
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
