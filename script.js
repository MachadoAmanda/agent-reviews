document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obter o nome do produto inserido
    const produto = document.getElementById('produto').value.trim();

    // Verificar se o produto foi inserido
    if (!produto) {
        document.getElementById('error').style.display = 'block'; // Exibe a mensagem de erro
        document.getElementById('result').style.display = 'none'; // Esconde o resultado anterior
        return;
    }

    // Esconde qualquer mensagem de erro e mostra o spinner
    document.getElementById('error').style.display = 'none';
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('result').style.display = 'none'; // Esconde o resultado anterior

    // Fazer a requisição para a API
    fetch(`https://agent-reviews-1a7024548a3d.herokuapp.com/aplication?produto=${encodeURIComponent(produto)}`)
        .then(response => response.json())
        .then(data => {
            // Esconde o spinner e mostra o resultado
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('result').style.display = 'block';
            document.getElementById('output').textContent = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            // Esconde o spinner em caso de erro e exibe uma mensagem genérica
            document.getElementById('spinner').style.display = 'none';
            document.getElementById('result').style.display = 'block';
            document.getElementById('output').textContent = 'Ocorreu um erro ao buscar as informações. Tente novamente mais tarde.';
        });
});
