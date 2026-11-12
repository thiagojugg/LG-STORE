const WHATSAPP_NUMBER = "5511958593868";
const money = value => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value)||0);
let products = [];
let cart = [];

const $ = selector => document.querySelector(selector);
const productGrid = $("#product-grid");
const emptyState = $("#catalog-empty");
const searchPanel = $("#search-panel");
const searchInput = $("#site-search");
const searchResults = $("#search-results");

async function loadProducts(){
  try{
    const response = await fetch("products.json",{cache:"no-store"});
    if(!response.ok) throw new Error("Não foi possível carregar o catálogo");
    const data = await response.json();
    products = Array.isArray(data) ? data : [];
    renderProducts(products);
  }catch(error){
    console.error(error);
    $("#product-count").textContent = "CATÁLOGO INDISPONÍVEL";
    emptyState.querySelector("p").textContent = "Não foi possível carregar os produtos agora. Tente novamente mais tarde.";
  }
}

function renderProducts(items){
  productGrid.innerHTML = "";
  $("#product-count").textContent = `CATÁLOGO / ${String(items.length).padStart(2,"0")} PRODUTOS`;
  emptyState.hidden = items.length > 0;
  items.forEach(product=>{
    const card = document.createElement("article");
    card.className = "product-card";
    const image = product.image ? `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name||"Produto L&G")}" loading="lazy">` : '<span class="product-placeholder">L&amp;G</span>';
    card.innerHTML = `<div class="product-image">${image}</div><div class="product-info"><div><h3>${escapeHTML(product.name||"Produto")}</h3><p>${escapeHTML([product.brand,product.category].filter(Boolean).join(" / "))}</p></div><strong class="product-price">${product.price ? money(product.price) : "CONSULTE"}</strong></div><button class="product-buy" type="button" data-details="${escapeHTML(String(product.id))}">VER DETALHES ↗</button>`;
    productGrid.appendChild(card);
  });
  productGrid.querySelectorAll("[data-details]").forEach(button=>button.addEventListener("click",()=>showProductDetails(button.dataset.details)));
}
let selectedProductColor = "Preta";
function showProductDetails(id){
  const product=products.find(item=>String(item.id)===String(id));
  if(!product)return;
  selectedProductColor=product.colors?.[0]||"Preta";
  const section=$("#detalhes-produto");
  const images=(product.images||[product.image]).filter(Boolean);
  section.innerHTML = `<div class="details-top"><button type="button" class="details-back" id="details-back">← VOLTAR À LOJA</button><span>DETALHES DO PRODUTO / 01</span></div><div class="details-layout"><div class="details-gallery">${images.map((src,index)=>`<img src="${escapeHTML(src)}" alt="${escapeHTML(product.name)} — foto ${index+1}" class="details-photo">`).join("")}</div><div class="details-copy"><p class="eyebrow dark-eyebrow">L&amp;G STORE / SELEÇÃO</p><h2>${escapeHTML(product.name)}</h2><p class="details-description">${escapeHTML(product.description||"Camiseta masculina. Escolha a cor e confira a disponibilidade de tamanho.")}</p><div class="details-option"><span>COR <b id="selected-color">${selectedProductColor.toUpperCase()}</b></span><div class="color-options">${(product.colors||["Preta","Vermelha"]).map((color,index)=>`<button type="button" class="color-option ${index===0?"active":""}" data-color="${escapeHTML(color)}">${escapeHTML(color)}</button>`).join("")}</div></div><div class="details-option"><span>TAMANHO <b>G DISPONÍVEL</b></span><div class="size-options">${(product.sizes||["P","M","G","GG"]).map(size=>`<button type="button" class="size-option ${size==="G"?"available":"sold-out"}" ${size==="G"?"":"disabled"}>${size}${size==="G"?"":" · ESGOTADO"}</button>`).join("")}</div></div><p class="stock-note">Disponível somente no tamanho G. Os tamanhos P, M e GG estão esgotados.</p><button type="button" class="details-buy" id="details-buy">COMPRAR PELO WHATSAPP ↗</button></div></div>`;
  section.hidden=false;
  $("#novidades").hidden=true;
  section.scrollIntoView({behavior:"smooth",block:"start"});
  $("#details-back").addEventListener("click",()=>{section.hidden=true;$("#novidades").hidden=false;$("#novidades").scrollIntoView({behavior:"smooth"});});
  section.querySelectorAll("[data-color]").forEach(button=>button.addEventListener("click",()=>{selectedProductColor=button.dataset.color;section.querySelectorAll("[data-color]").forEach(item=>item.classList.toggle("active",item===button));$("#selected-color").textContent=selectedProductColor.toUpperCase();}));
  $("#details-buy").addEventListener("click",()=>{const message=`Olá! Tenho interesse na ${product.name}, cor ${selectedProductColor}, tamanho G. Ainda está disponível?`;window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener");});
}
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function searchProducts(query){
  const term = query.trim().toLocaleLowerCase("pt-BR");
  if(!term){searchResults.innerHTML="<span>Digite para pesquisar no catálogo.</span>";return;}
  const matches = products.filter(product=>[product.name,product.brand,product.category,product.description].some(value=>String(value||"").toLocaleLowerCase("pt-BR").includes(term)));
  if(!matches.length){searchResults.innerHTML="<span>Nenhum produto encontrado. Tente outro termo.</span>";return;}
  searchResults.innerHTML = matches.slice(0,8).map(product=>`<a class="search-result" href="#novidades" data-result="${escapeHTML(String(product.id))}"><span>${escapeHTML(product.name||"Produto")} <small>— ${escapeHTML(product.brand||product.category||"L&G STORE")}</small></span><strong>${money(product.price)}</strong></a>`).join("");
  searchResults.querySelectorAll("[data-result]").forEach(link=>link.addEventListener("click",()=>{searchPanel.hidden=true;searchInput.value="";}));
}
function addToCart(id){
  const product=products.find(item=>String(item.id)===String(id));
  if(!product)return;
  const existing=cart.find(item=>String(item.id)===String(id));
  if(existing)existing.quantity+=1;else cart.push({...product,quantity:1});
  renderCart();
  openBag();
}
function renderCart(){
  $("#bag-count").textContent=cart.reduce((sum,item)=>sum+item.quantity,0);
  $("#bag-items").innerHTML=cart.length?cart.map(item=>`<div class="bag-row"><div><strong>${escapeHTML(item.name)}</strong><p>Qtd: ${item.quantity} · ${money(item.price)}</p></div><div><strong>${money(item.price*item.quantity)}</strong><br><button data-remove="${escapeHTML(String(item.id))}">REMOVER</button></div></div>`).join(""):'<p class="bag-empty">Sua sacola está vazia.</p>';
  $("#bag-total").textContent=money(cart.reduce((sum,item)=>sum+Number(item.price||0)*item.quantity,0));
  $("#checkout-button").disabled=!cart.length;
  $("#bag-items").querySelectorAll("[data-remove]").forEach(button=>button.addEventListener("click",()=>{cart=cart.filter(item=>String(item.id)!==button.dataset.remove);renderCart();}));
}
function openBag(){$("#sacola").classList.add("open");$("#drawer-backdrop").classList.add("visible");}
function closeBag(){$("#sacola").classList.remove("open");$("#drawer-backdrop").classList.remove("visible");}
function checkout(){
  if(!cart.length)return;
  const lines=cart.map(item=>`• ${item.name} | Qtd: ${item.quantity} | ${money(item.price*item.quantity)}`);
  const total=cart.reduce((sum,item)=>sum+Number(item.price||0)*item.quantity,0);
  const message=`Olá! Vim pelo site da L&G STORE e gostaria de fazer este pedido:\\n\\n${lines.join("\\n")}\\n\\n*Subtotal: ${money(total)}*\\n\\nPodem me informar as opções de pagamento e entrega?`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener");
}
$("#search-toggle").addEventListener("click",()=>{searchPanel.hidden=!searchPanel.hidden;$("#search-toggle").setAttribute("aria-expanded",String(!searchPanel.hidden));if(!searchPanel.hidden)searchInput.focus();});
$("#search-close").addEventListener("click",()=>{searchPanel.hidden=true;searchInput.value="";searchResults.innerHTML="<span>Digite para pesquisar no catálogo.</span>";});
searchInput.addEventListener("input",event=>searchProducts(event.target.value));
$("#search-form").addEventListener("submit",event=>event.preventDefault());
$(".bag-link").addEventListener("click",event=>{event.preventDefault();openBag();});
$("#bag-close").addEventListener("click",closeBag);
$("#drawer-backdrop").addEventListener("click",closeBag);
$("#checkout-button").addEventListener("click",checkout);
$("#menu-toggle").addEventListener("click",()=>{const menu=$("#mobile-menu");menu.classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(menu.classList.contains("open")));});
$("#mobile-menu").querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>$("#mobile-menu").classList.remove("open")));
$("#clear-filter").addEventListener("click",()=>{renderProducts(products);$("#clear-filter").hidden=true;});
document.querySelectorAll("[data-category]").forEach(link=>link.addEventListener("click",()=>{const category=link.dataset.category;const filtered=products.filter(product=>String(product.category||"").toLocaleLowerCase("pt-BR").includes(category.toLocaleLowerCase("pt-BR")));renderProducts(filtered);$("#clear-filter").hidden=false;}));
loadProducts();