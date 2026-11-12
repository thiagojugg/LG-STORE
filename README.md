# L&G STORE

Loja multimarcas de moda urbana com identidade visual em preto, cinza e branco.

## Estrutura do projeto
- `index.html`: página principal.
- `assets/style.css`: estilos responsivos.
- `assets/script.js`: pesquisa, catálogo, sacola e finalização pelo WhatsApp.
- `products.json`: catálogo de produtos.

## Configuração
O atendimento de pedidos está configurado para o WhatsApp **+55 11 95859-3868**.

Para cadastrar produtos, adicione objetos ao array de `products.json` com os campos:
`id`, `name`, `brand`, `category`, `description`, `price` e `image`.

Exemplo de estrutura (substitua pelos dados reais dos produtos):
```json
[
  {
    "id": "produto-001",
    "name": "Nome do produto",
    "brand": "Marca",
    "category": "Camisetas",
    "description": "Descrição do produto",
    "price": 199.90,
    "image": "assets/products/produto-001.jpg"
  }
]
```

A busca consulta nome, marca, categoria e descrição. O carrinho monta o pedido e abre o WhatsApp com os itens e subtotal.

## Publicação do site
Ative o GitHub Pages nas configurações do repositório, selecionando a branch `main` e a pasta `/(root)`.
