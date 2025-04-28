function buscarInformacoesProduto() {
    const produto = document.getElementById('produto').value; // Captura o valor inserido
    const resultadoDiv = document.getElementById('resultado'); // Onde o resultado será exibido
    const spinner = document.getElementById('spinner'); // Spinner de carregamento
    
    if (!produto) {
        resultadoDiv.textContent = "Você precisa digitar um produto para realizar a pesquisa";
        return;
    }
    
    // Exibe o spinner enquanto faz a requisição
    spinner.style.display = "block";
    
    // Usando ThingProxy para contornar o CORS
    fetch(`https://thingproxy.freeboard.io/fetch/https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`)
        .then(response => response.text()) // Pega a resposta como texto simples
        .then(data => {
            // Oculta o spinner
            spinner.style.display = "none";
            // Exibe a resposta diretamente como texto
            resultadoDiv.textContent = data;
        })
        .catch(error => {
            // Oculta o spinner
            spinner.style.display = "none";
            resultadoDiv.textContent = "Ocorreu um erro ao buscar as informações. Tente novamente mais tarde.";
        });
}
