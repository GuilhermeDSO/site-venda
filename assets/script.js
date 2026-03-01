// ====== CONFIGURE AQUI ======
const WHATSAPP_NUMBER = "55333333333"; // Troque: DDI+DDD+número ex.: 5511999999999
const COMPANY_NAME    = "Viação Santa Brígida";

// ====================================================
// PEÇAS — edite aqui para adicionar, remover ou alterar
// Campos:
//   name:        nome da peça
//   code:        código / patrimônio (deixe "" se não tiver)
//   category:    "Elétrica" | "Mecânica" | "Automação" | "Acessórios"
//   price:       número  ex: 250.60
//   status:      "Disponível" | "Últimas unidades" | "Vendido"
//   image:       caminho da imagem ex: "peca1.png" ou URL completa
//   description: descrição detalhada da peça
// ====================================================
const items = [
  {
    name: "Cabo Leitura Anjo Da Guarda",
    code: "FRT-PACA035",
    category: "Elétrica",
    price: 250.6275,
    status: "Disponível",
    image: "peca1.png",
    description: "Cabo de leitura para sistema Anjo da Guarda, com conectores originais. Peça em bom estado, retirada de equipamento sem uso. Confirmar compatibilidade antes da compra."
  },
  {
    name: "Placa Fonte Principal",
    code: "FRT-PAPL022",
    category: "Elétrica",
    price: 869.40,
    status: "Disponível",
    image: "peca2.png",
    description: "Placa de fonte principal para painel eletrônico de ônibus. Retirada de equipamento fora de operação, em bom estado geral. Verificar compatibilidade com o modelo do veículo antes da compra."
  },
  {
    name: "Placa Fonte Auxiliar",
    code: "FRT-PAPL025",
    category: "Elétrica",
    price: 114.795,
    status: "Disponível",
    image: "peca3.png",
    description: "Placa de fonte auxiliar para sistemas eletrônicos de bordo. Componente em bom estado, retirado de equipamento sem uso. Confirmar compatibilidade antes da compra."
  },
  {
    name: "Cabo Conexão Fonte Auxiliar",
    code: "FRT-PACA132X",
    category: "Elétrica",
    price: 192.2097,
    status: "Disponível",
    image: "peca4.png",
    description: "Cabo de conexão para fonte auxiliar do painel eletrônico. Peça original com etiqueta de identificação. Bom estado de conservação. Confirmar compatibilidade com o modelo antes da compra."
  },
  {
    name: "Placa LED Painel 7×112",
    code: "FRT-PAPL031",
    category: "Elétrica",
    price: 1388.63,
    status: "Disponível",
    image: "peca5.jpeg",
    description: "Placa LED para painel de destino modelo 7×112, utilizada em painéis frontais de ônibus. Grande dimensão com matriz completa de LEDs. Retirada de equipamento sem uso, em bom estado."
  },
  {
    name: "Cabo Placa LED — Fonte Auxiliar",
    code: "FRT-PACA130X",
    category: "Elétrica",
    price: 72.8957,
    status: "Disponível",
    image: "peca6.jpeg",
    description: "Cabo de interligação entre a placa LED e a fonte auxiliar do painel eletrônico. Peça original em bom estado de conservação. Confirmar compatibilidade com o equipamento antes da compra."
  },
  // ──────────────────────────────────────────
  // Para adicionar uma nova peça, copie o bloco
  // abaixo, cole ACIMA desta linha e preencha:
  //
  // {
  //   name: "Nome da Peça",
  //   code: "CODIGO-001",
  //   category: "Mecânica",
  //   price: 350.00,
  //   status: "Disponível",
  //   image: "peca7.png",
  //   description: "Descrição detalhada da peça."
  // },
  // ──────────────────────────────────────────
];

// ====== NÃO PRECISA MEXER ABAIXO DESTA LINHA ======

const fmt  = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const wa   = msg => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const esc  = s => String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const clip = (s,n) => s && s.length>n ? s.slice(0,n-1).trimEnd()+"…" : (s||"");

function statusCls(s) {
  const v = (s||"").toLowerCase();
  if (v.includes("últ")) return "warn";
  if (v.includes("vend")) return "danger";
  return "";
}

// DOM refs
const gridEl    = document.getElementById("grid");
const qEl       = document.getElementById("q");
const catEl     = document.getElementById("cat");
const sortEl    = document.getElementById("sort");
const countEl   = document.getElementById("statCount");
const avgEl     = document.getElementById("statAvg");
const resCountEl= document.getElementById("resultsCount");

// ── Render grid ──
function render(list) {
  gridEl.innerHTML = "";
  if (!list.length) {
    gridEl.innerHTML = `
      <div class="empty-state">
        <h3>Nenhuma peça encontrada</h3>
        <p>Tente outro termo de busca ou selecione outra categoria.</p>
      </div>`;
    return;
  }

  list.forEach((it, i) => {
    const cls = statusCls(it.status);
    const el  = document.createElement("article");
    el.className = "card";
    el.style.animationDelay = `${i * 40}ms`;
    el.innerHTML = `
      <div class="card-img">
        <img src="${esc(it.image)}" alt="${esc(it.name)}"
          onerror="this.style.opacity='0.15'; this.alt='Sem imagem';" loading="lazy"/>
        <div class="card-status ${cls}">
          <span class="status-led"></span>${esc(it.status||"Disponível")}
        </div>
        <div class="card-category">${esc(it.category)}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${esc(it.name)}</div>
        <div class="card-code">${esc(it.code||"Sem código")}</div>
        <p class="card-desc">${esc(clip(it.description, 110))}</p>
        <div class="card-footer">
          <div class="card-price">${fmt(it.price)}</div>
          <div class="card-cta">
            Ver detalhes →
          </div>
        </div>
      </div>`;
    el.addEventListener("click", () => openModal(it));
    gridEl.appendChild(el);
  });
}

// ── Filtros ──
function applyFilters() {
  const q = qEl.value.trim().toLowerCase();
  const c = catEl.value;

  let list = items.filter(it => {
    const hay = `${it.name} ${it.description} ${it.code} ${it.category}`.toLowerCase();
    return (!q || hay.includes(q)) && (c === "all" || it.category === c);
  });

  const total = list.length;
  if (sortEl.value === "low")  list.sort((a,b) => a.price - b.price);
  if (sortEl.value === "high") list.sort((a,b) => b.price - a.price);
  if (sortEl.value === "az")   list.sort((a,b) => a.name.localeCompare(b.name,"pt-BR"));

  countEl.textContent    = total;
  resCountEl.textContent = total;
  avgEl.textContent      = total
    ? fmt(list.reduce((s,x)=>s+x.price,0)/total)
    : "—";

  render(list);
}

// ── Modal ──
const backdrop   = document.getElementById("backdrop");
const btnClose   = document.getElementById("btnClose");
const mImg       = document.getElementById("mImg");
const mTitle     = document.getElementById("mTitle");
const mPrice     = document.getElementById("mPrice");
const mChips     = document.getElementById("mChips");
const mStatusBadge = document.getElementById("mStatusBadge");
const mDesc      = document.getElementById("mDesc");
const mBuy       = document.getElementById("mBuy");
const mCopy      = document.getElementById("mCopy");
let current = null;

function openModal(it) {
  current = it;
  backdrop.style.display = "flex";
  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden","false");

  mImg.src             = it.image;
  mImg.alt             = `Foto: ${it.name}`;
  mTitle.textContent   = it.name;
  mPrice.textContent   = fmt(it.price);
  mStatusBadge.textContent = it.status || "Disponível";
  mDesc.textContent    = it.description || "Sem descrição.";

  mChips.innerHTML = `
    <span class="modal-chip green">${esc(it.category)}</span>
    <span class="modal-chip">Cód: ${esc(it.code||"—")}</span>
    <span class="modal-chip">${esc(it.status||"Disponível")}</span>`;

  const msg = `Olá! Vi o catálogo e tenho interesse na peça *${it.name}* (Código: ${it.code||"—"}) — ${fmt(it.price)}. Pode me passar mais informações?`;
  mBuy.href = wa(`[${COMPANY_NAME}] ${msg}`);
  document.body.style.overflow = "hidden";
}

function closeModal() {
  backdrop.style.display = "none";
  backdrop.classList.remove("open");
  backdrop.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
  current = null;
}

btnClose.addEventListener("click", closeModal);
backdrop.addEventListener("click", e => { if (e.target === backdrop) closeModal(); });
window.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

mCopy.addEventListener("click", async () => {
  if (!current) return;
  const txt = `Viação Santa Brígida — Peças\n\nPeça: ${current.name}\nCódigo: ${current.code||"—"}\nCategoria: ${current.category}\nPreço: ${fmt(current.price)}\nStatus: ${current.status||"Disponível"}\nDescrição: ${current.description||"—"}`;
  try {
    await navigator.clipboard.writeText(txt);
    mCopy.textContent = "Copiado ✓";
    mCopy.style.background = "var(--green-light)";
    setTimeout(() => {
      mCopy.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="4" y="4" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 10V2h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg> Copiar`;
      mCopy.style.background = "";
    }, 1600);
  } catch {
    alert("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
  }
});

// ── Scroll buttons ──
document.getElementById("btnScrollCatalog")?.addEventListener("click", () => {
  document.getElementById("catalog").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.getElementById("btnHeroCatalog")?.addEventListener("click", () => {
  document.getElementById("catalog").scrollIntoView({ behavior: "smooth", block: "start" });
});

// ── FAB & WhatsApp hero ──
const waMsg = `[${COMPANY_NAME}] Olá! Vi o catálogo de peças e gostaria de mais informações.`;
document.getElementById("waFloat").href = wa(waMsg);
const waHero = document.getElementById("waHero");
if (waHero) waHero.href = wa(waMsg);

// ── Eventos de filtro ──
[qEl, catEl, sortEl].forEach(el => el.addEventListener("input", applyFilters));

// ── Init ──
applyFilters();