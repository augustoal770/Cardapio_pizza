const botoesFiltro = document.querySelectorAll(".filtro");
const pizzas = document.querySelectorAll(".pizza-card");
const botoesAdicionar = document.querySelectorAll(".card-final button");
const toast = document.getElementById("toast");

const abrirPedidos = document.getElementById("abrirPedidos");
const fecharPedidos = document.getElementById("fecharPedidos");
const janelaPedidos = document.getElementById("janelaPedidos");

const listaPedidos = document.getElementById("listaPedidos");
const totalPedidos = document.getElementById("totalPedidos");
const contadorPedidos = document.getElementById("contadorPedidos");
const limparPedido = document.getElementById("limparPedido");

const abrirCheckout = document.getElementById("abrirCheckout");
const checkoutArea = document.getElementById("checkoutArea");

const abaCarrinhoBtn = document.getElementById("abaCarrinhoBtn");
const abaMeusPedidosBtn = document.getElementById("abaMeusPedidosBtn");
const abaCarrinho = document.getElementById("abaCarrinho");
const abaMeusPedidos = document.getElementById("abaMeusPedidos");
const listaMeusPedidos = document.getElementById("listaMeusPedidos");

const areaPix = document.getElementById("areaPix");
const areaDinheiro = document.getElementById("areaDinheiro");
const qrCodePix = document.getElementById("qrCodePix");
const chavePix = document.getElementById("chavePix");
const copiarPix = document.getElementById("copiarPix");

const campoEndereco = document.getElementById("campoEndereco");
const nomeCliente = document.getElementById("nomeCliente");
const enderecoCliente = document.getElementById("enderecoCliente");
const observacaoPedido = document.getElementById("observacaoPedido");
const trocoPara = document.getElementById("trocoPara");
const finalizarPedidoCheckout = document.getElementById("finalizarPedidoCheckout");

const modalPix = document.getElementById("modalPix");
const fecharModalPix = document.getElementById("fecharModalPix");
const qrCodePixFinal = document.getElementById("qrCodePixFinal");
const codigoPixFinal = document.getElementById("codigoPixFinal");
const copiarCodigoPix = document.getElementById("copiarCodigoPix");
const totalPixFinal = document.getElementById("totalPixFinal");
const confirmarPedidoPix = document.getElementById("confirmarPedidoPix");
const slidesWrapper = document.getElementById("slidesWrapper");
const slideBtns = document.querySelectorAll(".slide-btn");

let slideAtual = 0;
let intervaloSlide;

let pedidos = [];
let meusPedidos = JSON.parse(localStorage.getItem("meusPedidosPizza")) || [];

atualizarPedidos();
atualizarMeusPedidos();
atualizarQRCodePix();

botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    const categoria = botao.dataset.categoria;

    botoesFiltro.forEach((item) => item.classList.remove("ativo"));
    botao.classList.add("ativo");

    pizzas.forEach((pizza) => {
      const pizzaCategoria = pizza.dataset.categoria;

      if (categoria === "todos" || categoria === pizzaCategoria) {
        pizza.classList.remove("escondido");
      } else {
        pizza.classList.add("escondido");
      }
    });
  });
});

botoesAdicionar.forEach((botao) => {
  botao.addEventListener("click", () => {
    const card = botao.closest(".pizza-card");
    const nome = card.querySelector("h3").textContent;
    const precoTexto = card.querySelector(".card-final strong").textContent;
    const preco = converterPreco(precoTexto);

    adicionarPedido(nome, preco);
    mostrarToast("Item adicionado ao pedido!");
  });
});

abrirPedidos.addEventListener("click", () => {
  janelaPedidos.classList.add("ativo");

  mostrarSlide(0);
  iniciarSlidePagamento();
});

fecharPedidos.addEventListener("click", () => {
  janelaPedidos.classList.remove("ativo");
  clearInterval(intervaloSlide);
});

janelaPedidos.addEventListener("click", (event) => {
  if (event.target === janelaPedidos) {
    janelaPedidos.classList.remove("ativo");
  }
});

limparPedido.addEventListener("click", () => {
  pedidos = [];
  checkoutArea.classList.remove("ativo");
  atualizarPedidos();
  atualizarQRCodePix();
});

abrirCheckout.addEventListener("click", () => {
  if (pedidos.length === 0) {
    mostrarToast("Adicione um item antes de finalizar.");
    return;
  }

  checkoutArea.classList.toggle("ativo");
  atualizarQRCodePix();
});

abaCarrinhoBtn.addEventListener("click", () => {
  trocarAba("carrinho");
});

abaMeusPedidosBtn.addEventListener("click", () => {
  trocarAba("meusPedidos");
});

document.querySelectorAll("input[name='pagamento']").forEach((input) => {
  input.addEventListener("change", () => {
    const pagamento = pegarPagamento();

    if (pagamento === "pix") {
      areaPix.classList.remove("escondido");
      areaDinheiro.classList.add("escondido");
      atualizarQRCodePix();
    } else {
      areaPix.classList.add("escondido");
      areaDinheiro.classList.remove("escondido");
    }
  });
});

document.querySelectorAll("input[name='tipoEntrega']").forEach((input) => {
  input.addEventListener("change", () => {
    const tipo = pegarTipoEntrega();

    if (tipo === "entrega") {
      campoEndereco.classList.remove("escondido");
    } else {
      campoEndereco.classList.add("escondido");
    }

    atualizarQRCodePix();
  });
});

copiarPix.addEventListener("click", () => {
  navigator.clipboard.writeText(chavePix.value);
  mostrarToast("Chave Pix copiada!");
});

finalizarPedidoCheckout.addEventListener("click", () => {
  const pagamento = pegarPagamento();

  if (!validarDadosPedido()) {
    return;
  }

  if (pagamento === "pix") {
    abrirModalPixFinal();
  } else {
    enviarPedidoParaConferencia();
  }
});

fecharModalPix.addEventListener("click", () => {
  modalPix.classList.remove("ativo");
});

modalPix.addEventListener("click", (event) => {
  if (event.target === modalPix) {
    modalPix.classList.remove("ativo");
  }
});

copiarCodigoPix.addEventListener("click", () => {
  navigator.clipboard.writeText(codigoPixFinal.value);
  mostrarToast("Código Pix copiado!");
});

confirmarPedidoPix.addEventListener("click", () => {
  modalPix.classList.remove("ativo");
  enviarPedidoParaConferencia();
});

function validarDadosPedido() {
  if (pedidos.length === 0) {
    mostrarToast("Seu carrinho está vazio.");
    return false;
  }

  const nome = nomeCliente.value.trim();
  const endereco = enderecoCliente.value.trim();
  const pagamento = pegarPagamento();
  const tipoEntrega = pegarTipoEntrega();
  const troco = trocoPara.value.trim();

  if (nome === "") {
    mostrarToast("Informe seu nome.");
    return false;
  }

  if (tipoEntrega === "entrega" && endereco === "") {
    mostrarToast("Informe o endereço de entrega.");
    return false;
  }

  if (pagamento === "dinheiro" && troco === "") {
    mostrarToast("Informe se precisa de troco.");
    return false;
  }

  return true;
}

function mostrarSlide(index) {
  slideAtual = index;

  if (!slidesWrapper) return;

  slidesWrapper.style.transform = `translateX(-${index * 100}%)`;

  slideBtns.forEach((btn) => {
    btn.classList.remove("ativo");
  });

  if (slideBtns[index]) {
    slideBtns[index].classList.add("ativo");
  }
}

function iniciarSlidePagamento() {
  clearInterval(intervaloSlide);

  intervaloSlide = setInterval(() => {
    slideAtual++;

    if (slideAtual >= slideBtns.length) {
      slideAtual = 0;
    }

    mostrarSlide(slideAtual);
  }, 3500);
}

slideBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const index = Number(btn.dataset.slide);
    mostrarSlide(index);
    iniciarSlidePagamento();
  });
});

function abrirModalPixFinal() {
  const codigoPix = gerarCodigoPixSimulado();

  codigoPixFinal.value = codigoPix;
  totalPixFinal.textContent = formatarPreco(calcularTotal());

  qrCodePixFinal.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" +
    encodeURIComponent(codigoPix);

  modalPix.classList.add("ativo");
}

function gerarCodigoPixSimulado() {
  const itensTexto = pedidos
    .map((item) => `${item.quantidade}x ${item.nome}`)
    .join(" | ");

  const codigoPix = `
PIZZAS-CHEDDAR-PIX
CHAVE: 8194875455
EMPRESA: Pizza's Cheddar
CLIENTE: ${nomeCliente.value.trim()}
TOTAL: ${formatarPreco(calcularTotal())}
TIPO: ${pegarTipoEntrega() === "entrega" ? "Entrega" : "Retirada"}
ENDERECO: ${
    pegarTipoEntrega() === "entrega"
      ? enderecoCliente.value.trim()
      : "Retirada no balcão"
  }
ITENS: ${itensTexto}
`;

  return codigoPix.trim();
}

function trocarAba(aba) {
  abaCarrinhoBtn.classList.remove("ativo");
  abaMeusPedidosBtn.classList.remove("ativo");
  abaCarrinho.classList.remove("ativo");
  abaMeusPedidos.classList.remove("ativo");

  if (aba === "carrinho") {
    abaCarrinhoBtn.classList.add("ativo");
    abaCarrinho.classList.add("ativo");
  } else {
    abaMeusPedidosBtn.classList.add("ativo");
    abaMeusPedidos.classList.add("ativo");
    atualizarMeusPedidos();
  }
}

function adicionarPedido(nome, preco) {
  const itemExistente = pedidos.find((item) => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    pedidos.push({
      nome,
      preco,
      quantidade: 1
    });
  }

  atualizarPedidos();
  atualizarQRCodePix();
}

function aumentarQuantidade(index) {
  pedidos[index].quantidade++;
  atualizarPedidos();
  atualizarQRCodePix();
}

function diminuirQuantidade(index) {
  if (pedidos[index].quantidade > 1) {
    pedidos[index].quantidade--;
  } else {
    pedidos.splice(index, 1);
  }

  atualizarPedidos();
  atualizarQRCodePix();
}

function removerItem(index) {
  pedidos.splice(index, 1);
  atualizarPedidos();
  atualizarQRCodePix();

  if (pedidos.length === 0) {
    checkoutArea.classList.remove("ativo");
  }
}

function atualizarPedidos() {
  listaPedidos.innerHTML = "";

  if (pedidos.length === 0) {
    listaPedidos.innerHTML = `<p class="pedido-vazio">Nenhum item adicionado ainda.</p>`;
  } else {
    pedidos.forEach((item, index) => {
      const subtotal = item.preco * item.quantidade;

      const pedidoHTML = document.createElement("div");
      pedidoHTML.classList.add("pedido-item");

      pedidoHTML.innerHTML = `
        <div class="pedido-info">
          <div>
            <h3>${item.nome}</h3>
            <p>${item.quantidade}x ${formatarPreco(item.preco)}</p>
          </div>

          <strong>${formatarPreco(subtotal)}</strong>
        </div>

        <div class="pedido-controles">
          <div class="quantidade">
            <button onclick="diminuirQuantidade(${index})">−</button>
            <span>${item.quantidade}</span>
            <button onclick="aumentarQuantidade(${index})">+</button>
          </div>

          <button class="remover-item" onclick="removerItem(${index})">
            Remover
          </button>
        </div>
      `;

      listaPedidos.appendChild(pedidoHTML);
    });
  }

  totalPedidos.textContent = formatarPreco(calcularTotal());

  const quantidadeTotal = pedidos.reduce((soma, item) => {
    return soma + item.quantidade;
  }, 0);

  contadorPedidos.textContent = quantidadeTotal;
}

function enviarPedidoParaConferencia() {
  if (pedidos.length === 0) {
    mostrarToast("Seu carrinho está vazio.");
    return;
  }

  const nome = nomeCliente.value.trim();
  const endereco = enderecoCliente.value.trim();
  const observacao = observacaoPedido.value.trim();
  const pagamento = pegarPagamento();
  const tipoEntrega = pegarTipoEntrega();
  const troco = trocoPara.value.trim();

  if (nome === "") {
    mostrarToast("Informe seu nome.");
    return;
  }

  if (tipoEntrega === "entrega" && endereco === "") {
    mostrarToast("Informe o endereço de entrega.");
    return;
  }

  if (pagamento === "dinheiro" && troco === "") {
    mostrarToast("Informe se precisa de troco.");
    return;
  }

  const novoPedido = {
    id: Date.now(),
    data: new Date().toLocaleString("pt-BR"),
    itens: pedidos,
    total: calcularTotal(),
    pagamento,
    tipoEntrega,
    nome,
    endereco: tipoEntrega === "entrega" ? endereco : "Retirada no balcão",
    observacao: observacao || "Sem observação",
    troco: pagamento === "dinheiro" ? troco : "Pagamento via Pix",
    status: "Aguardando conferência"
  };

  meusPedidos.unshift(novoPedido);
  localStorage.setItem("meusPedidosPizza", JSON.stringify(meusPedidos));

  pedidos = [];
  nomeCliente.value = "";
  enderecoCliente.value = "";
  observacaoPedido.value = "";
  trocoPara.value = "";
  checkoutArea.classList.remove("ativo");

  atualizarPedidos();
  atualizarMeusPedidos();
  trocarAba("meusPedidos");

  mostrarToast("Pedido enviado para conferência!");
}

function atualizarMeusPedidos() {
  listaMeusPedidos.innerHTML = "";

  if (meusPedidos.length === 0) {
    listaMeusPedidos.innerHTML = `<p class="pedido-vazio">Você ainda não enviou nenhum pedido.</p>`;
    return;
  }

  meusPedidos.forEach((pedido) => {
    const card = document.createElement("div");
    card.classList.add("meu-pedido-card");

    const itensHTML = pedido.itens
      .map((item) => {
        return `<li>${item.quantidade}x ${item.nome} — ${formatarPreco(item.preco * item.quantidade)}</li>`;
      })
      .join("");

    card.innerHTML = `
      <span class="status-pedido">${pedido.status}</span>

      <h3>Pedido #${pedido.id}</h3>

      <ul class="itens-meu-pedido">
        ${itensHTML}
      </ul>

      <p><strong>Total:</strong> ${formatarPreco(pedido.total)}</p>
      <p><strong>Pagamento:</strong> ${pedido.pagamento === "pix" ? "Pix" : "Dinheiro"}</p>
      <p><strong>Tipo:</strong> ${pedido.tipoEntrega === "entrega" ? "Entrega" : "Retirada"}</p>
      <p><strong>Cliente:</strong> ${pedido.nome}</p>
      <p><strong>Endereço:</strong> ${pedido.endereco}</p>
      <p><strong>Observação:</strong> ${pedido.observacao}</p>
      <p><strong>Troco/Pix:</strong> ${pedido.troco}</p>
      <p><strong>Enviado em:</strong> ${pedido.data}</p>
    `;

    listaMeusPedidos.appendChild(card);
  });
}

function atualizarQRCodePix() {
  if (!qrCodePix) return;

  const total = formatarPreco(calcularTotal());
  const textoPix = `
Pizza's Cheddar
Chave Pix: ${chavePix.value}
Total: ${total}
Tipo: ${pegarTipoEntrega() === "entrega" ? "Entrega" : "Retirada"}
Cliente: ${nomeCliente.value || "Não informado"}
Endereço: ${enderecoCliente.value || "Não informado"}
`;

  qrCodePix.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(textoPix);
}

function calcularTotal() {
  return pedidos.reduce((soma, item) => {
    return soma + item.preco * item.quantidade;
  }, 0);
}

function pegarPagamento() {
  return document.querySelector("input[name='pagamento']:checked").value;
}

function pegarTipoEntrega() {
  return document.querySelector("input[name='tipoEntrega']:checked").value;
}

function converterPreco(precoTexto) {
  return Number(
    precoTexto
      .replace("R$", "")
      .replace(".", "")
      .replace(",", ".")
      .trim()
  );
}

function formatarPreco(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.classList.add("ativo");

  setTimeout(() => {
    toast.classList.remove("ativo");
  }, 1800);
}