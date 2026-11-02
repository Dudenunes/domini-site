import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.111.0/+esm';
import { CAMINHOS } from './caminhos.js';

const SUPABASE_URL = 'https://onqubpwcpegbicfmkszj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucXVicHdjcGVnYmljZm1rc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTU5NjIsImV4cCI6MjEwMDk5MTk2Mn0.LQuk44Jiw8zQeioOW39f3guar84SSHjItRfFPEaZ2Ec';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const $ = (selector) => document.querySelector(selector);
const nf = new Intl.NumberFormat('pt-BR');
const fmt = (n) => nf.format(Number(n || 0));
const TZ = 'America/Sao_Paulo';

// ---------- Nomes legíveis ----------

const RECURSOS = {
  leitura: 'Leituras diárias', hora: 'Liturgia das Horas', biblia: 'Caminho da Bíblia',
  santo: 'Caminhos de santo', diario: 'Diário de oração', checkin: 'Check-in na missa',
};
const DETALHES = {
  primeira_leitura: '1ª Leitura', segunda_leitura: '2ª Leitura', salmo: 'Salmo', evangelho: 'Evangelho',
  laudes: 'Laudes', media: 'Hora Média', vesperas: 'Vésperas', completas: 'Completas',
  dominical: 'Missa dominical', festividade: 'Festividade',
};
const SANTOS = {
  'introducao-ao-domini': 'Introdução ao Domini',
  'imaculada-conceicao': 'Imaculada Conceição', 'nossa-senhora-de-lourdes': 'Nossa Senhora de Lourdes',
  'santa-catarina-de-sena': 'Santa Catarina de Sena', 'santo-agostinho': 'Santo Agostinho',
  'santo-andre': 'Santo André', 'santo-antonio-de-padua': 'Santo Antônio de Pádua',
  'sao-bento': 'São Bento', 'sao-filipe-neri': 'São Filipe Néri', 'sao-francisco-de-assis': 'São Francisco de Assis',
  'sao-jeronimo': 'São Jerônimo', 'sao-jose': 'São José', 'sao-tomas-de-aquino': 'São Tomás de Aquino',
};
const NOTIFICACOES = {
  cutucada_recebida: 'Cutucada recebida', novo_seguidor: 'Novo seguidor', medalha_conquistada: 'Medalha conquistada',
  medalha_amigo: 'Medalha de amigo', lembrete_leitura: 'Lembrete de leitura', consecutiva_em_risco: 'Sequência em risco',
  amigo_inativo: 'Amigo inativo', data_liturgica_especial: 'Data litúrgica especial',
};
const IDIOMAS = { pt: 'Português', en: 'English', es: 'Español' };
const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MESES_NOME = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const nomeRecurso = (r) => RECURSOS[r] || r;
const nomeDetalhe = (d) => DETALHES[d] || nomeSanto(d) || d || '';
const nomeSanto = (c) => CAMINHOS[c]?.nome || SANTOS[c] || c;

// Posição de uma unidade no caminho de santo: { n, total, titulo, parte }.
function unidadeSanto(curso, unidadeId) {
  const unidades = CAMINHOS[curso]?.unidades || [];
  const i = unidades.findIndex((u) => u.id === unidadeId);
  return { n: i + 1, total: unidades.length, titulo: unidades[i]?.titulo || unidadeId, parte: unidades[i]?.parte };
}

// ---------- Utilitários ----------

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function data(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const d = typeof value === 'string' && value.length === 10 ? new Date(`${value}T12:00:00`) : new Date(value);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, ...opts }).format(d);
}

function relativo(value) {
  if (!value) return 'nunca';
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ontem';
  if (d < 30) return `há ${d} dias`;
  return data(value);
}

function iniciais(nome, email) {
  const base = (nome || email || '?').trim();
  const partes = base.split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes.at(-1)[0] : '')).toUpperCase();
}

function avatar(pessoa, cls = 'avatar') {
  if (pessoa.avatar_url) return `<img class="${cls}" src="${esc(pessoa.avatar_url)}" alt="" loading="lazy">`;
  return `<div class="${cls}">${esc(iniciais(pessoa.nome, pessoa.email))}</div>`;
}

function statusAtividade(ultima) {
  if (!ultima) return '';
  const dias = (Date.now() - new Date(ultima).getTime()) / 86400000;
  return dias < 2 ? 'on' : dias < 8 ? 'mid' : '';
}

function kpi(label, value, sub = '') {
  return `<div class="card kpi"><div class="label">${label}</div><div class="value">${value}</div><div class="sub">${sub}</div></div>`;
}

function hbars(items, { gold = false } = {}) {
  if (!items.length) return '<p class="empty">Sem registros.</p>';
  const max = Math.max(1, ...items.map((i) => Number(i.valor)));
  return `<div class="hbars">${items.map((i) => `
    <div>
      <div class="hbar-head"><span>${esc(i.label)}</span><span class="muted num">${i.extra ?? fmt(i.valor)}</span></div>
      <div class="track"><div class="fill${gold ? ' gold' : ''}" style="width:${(Number(i.valor) / max) * 100}%"></div></div>
    </div>`).join('')}</div>`;
}

function rows(items) {
  if (!items.length) return '<p class="empty">Sem registros.</p>';
  return `<div class="rows">${items.map(([k, v]) => `<div class="row-item"><span>${k}</span><span class="v">${v}</span></div>`).join('')}</div>`;
}

// Colunas com o valor escrito em cima de cada barra e um rótulo embaixo.
function columns(values, { labels = [], titles = [], highlightLast = false, short = false, markers = [] } = {}) {
  const max = Math.max(1, ...values);
  const cols = values.map((v, i) => {
    const marker = markers[i] ? '<span class="marker"></span>' : '';
    return `<div class="col${v === 0 ? ' zero' : ''}${highlightLast && i === values.length - 1 ? ' today' : ''}" title="${esc(titles[i] || '')}">
      <span class="val">${v ? fmt(v) : ''}</span><div class="bar" style="height:${(v / max) * 82}%"></div>${marker}</div>`;
  }).join('');
  const axis = labels.length ? `<div class="axis even">${labels.map((l) => `<span>${esc(l)}</span>`).join('')}</div>` : '';
  return `<div class="columns${short ? ' short' : ''}">${cols}</div>${axis}`;
}

const pct = (parte, total) => (total ? Math.round((parte / total) * 100) : 0);

// Comparação com a semana anterior, já escrita como frase curta.
function delta(atual, antes) {
  if (!antes && !atual) return '<span class="muted">igual à semana anterior</span>';
  if (!antes) return '<span class="up">novo nesta semana</span>';
  const d = Math.round(((atual - antes) / antes) * 100);
  if (d === 0) return '<span class="muted">igual à semana anterior</span>';
  return `<span class="${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}%</span> <span class="muted">vs. ${fmt(antes)} na anterior</span>`;
}

const PERIODOS = [
  { nome: 'Madrugada', faixa: '0h–5h', de: 0, ate: 5 },
  { nome: 'Manhã', faixa: '5h–12h', de: 5, ate: 12 },
  { nome: 'Tarde', faixa: '12h–18h', de: 12, ate: 18 },
  { nome: 'Noite', faixa: '18h–24h', de: 18, ate: 24 },
];

// Horário de uso em quatro períodos, com a hora de pico escrita.
function horas(porHora) {
  const v = porHora || Array(24).fill(0);
  const total = v.reduce((a, b) => a + Number(b), 0);
  if (!total) return '<p class="empty">Sem práticas registradas.</p>';
  const pico = v.indexOf(Math.max(...v));
  const top = [...v.keys()].sort((a, b) => v[b] - v[a]).slice(0, 3).filter((h) => v[h] > 0);
  const itens = PERIODOS.map((p) => {
    const n = v.slice(p.de, p.ate).reduce((a, b) => a + Number(b), 0);
    return { label: `${p.nome} · ${p.faixa}`, valor: n, extra: `${pct(n, total)}% · ${fmt(n)}` };
  });
  return `<p class="insight">Pico às <strong>${pico}h</strong> (${pct(v[pico], total)}% das práticas). Horas mais fortes: ${top.map((h) => `${h}h`).join(', ')}.</p>${hbars(itens)}`;
}

function diasSemana(porDia) {
  const v = porDia || [];
  const total = v.reduce((a, b) => a + Number(b), 0);
  if (!total) return '<p class="empty">Sem práticas registradas.</p>';
  const melhor = v.indexOf(Math.max(...v));
  return `<p class="insight"><strong>${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][melhor]}</strong> é o dia mais forte (${pct(v[melhor], total)}%).</p>
    ${hbars(v.map((n, i) => ({ label: DIAS_SEMANA[i], valor: n, extra: `${pct(n, total)}% · ${fmt(n)}` })))}`;
}

function pessoaMini(p, direita = '') {
  return `<a class="mini" href="#pessoa/${esc(p.id)}">${avatar(p)}<span class="person-text"><strong>${esc(p.nome?.trim() || p.email)}</strong><span>${esc(p.username ? `@${p.username}` : p.email)}</span></span><span class="mini-right">${direita}</span></a>`;
}

function setNotice(message = '', error = false) {
  const el = $('#notice');
  el.textContent = message;
  el.classList.toggle('error', error);
  el.hidden = !message;
}

async function rpc(nome, args) {
  const { data: resultado, error } = await supabase.rpc(nome, args);
  if (error) {
    const naoAutorizado = /não autorizado|not authorized|permission denied/i.test(error.message || '');
    throw new Error(naoAutorizado
      ? 'Esta conta não está autorizada como administradora.'
      : `Não foi possível carregar os dados. (${error.message})`);
  }
  return resultado;
}

// ---------- Cache ----------

const cache = { resumo: null, pessoas: null, caminhos: null, perfis: new Map() };

async function getResumo(force) {
  if (force || !cache.resumo) cache.resumo = await rpc('admin_dashboard_resumo');
  return cache.resumo;
}
async function getPessoas(force) {
  if (force || !cache.pessoas) cache.pessoas = await rpc('admin_usuarios_lista');
  return cache.pessoas;
}
async function getPerfil(id, force) {
  if (force || !cache.perfis.has(id)) cache.perfis.set(id, await rpc('admin_usuario_perfil', { p_user_id: id }));
  return cache.perfis.get(id);
}

// ---------- Telas ----------

async function telaVisaoGeral(force) {
  const r = await getResumo(force);
  const serie = r.serie_30d || [];
  const sem = r.semana || {};
  const porRecurso = r.por_recurso_30d || [];
  const medalhaMes = (r.medalhas_por_mes || [])[0];
  const ultimos14 = serie.slice(-14);
  const mediaAtivos = serie.length ? serie.reduce((a, d) => a + Number(d.ativos), 0) / serie.length : 0;
  const melhorDia = serie.reduce((m, d) => (Number(d.ativos) > Number(m?.ativos ?? -1) ? d : m), null);
  const novos = r.novos_recentes || [];
  const sumidos = r.sumidos || [];

  return `
    <div class="kpis">
      ${kpi('Pessoas cadastradas', fmt(r.usuarios_total), `<strong>+${fmt(sem.novos)}</strong> nesta semana · ${delta(sem.novos, sem.novos_antes)}`)}
      ${kpi('Ativas nesta semana', fmt(sem.ativos), `${pct(sem.ativos, r.usuarios_total)}% da base · ${delta(sem.ativos, sem.ativos_antes)}`)}
      ${kpi('Práticas nesta semana', fmt(sem.praticas), delta(sem.praticas, sem.praticas_antes))}
      ${kpi('Ativas hoje', fmt(r.ativos_hoje), `${fmt(r.praticas_hoje)} práticas até agora`)}
    </div>

    <div class="grid-2" style="margin-top:12px">
      <div class="card card-pad">
        <h3>Chegaram nesta semana <span class="count">${fmt(novos.length)}</span></h3>
        <p class="card-sub">Contas novas dos últimos 7 dias · práticas feitas até agora</p>
        ${novos.length ? `<div class="minis">${novos.map((p) => pessoaMini(p, `${fmt(p.praticas)} ${p.praticas === 1 ? 'prática' : 'práticas'} · ${esc(relativo(p.criado_em))}`)).join('')}</div>` : '<p class="empty">Ninguém novo nesta semana.</p>'}
      </div>
      <div class="card card-pad">
        <h3>Sumiram nesta semana <span class="count warn">${fmt(sumidos.length)}</span></h3>
        <p class="card-sub">Praticavam nas duas semanas anteriores e não voltaram nos últimos 7 dias</p>
        ${sumidos.length ? `<div class="minis">${sumidos.map((p) => pessoaMini(p, `última prática ${esc(relativo(p.ultima))}`)).join('')}</div>` : '<p class="empty">Ninguém sumiu.</p>'}
      </div>
    </div>

    <h2 class="section-title">Pessoas ativas por dia <span class="muted">últimas 2 semanas</span></h2>
    <div class="card card-pad">
      <p class="insight">Média de <strong>${nf.format(Math.round(mediaAtivos * 10) / 10)}</strong> pessoas por dia nos últimos 30 dias${melhorDia ? `; o melhor dia foi <strong>${esc(data(melhorDia.data, { weekday: 'long', day: 'numeric', month: 'short' }))}</strong>, com ${fmt(melhorDia.ativos)}` : ''}.</p>
      ${columns(ultimos14.map((d) => Number(d.ativos)), {
        highlightLast: true,
        markers: ultimos14.map((d) => Number(d.novos) > 0),
        titles: ultimos14.map((d) => `${fmt(d.praticas)} práticas · ${fmt(d.novos)} contas novas`),
        labels: ultimos14.map((d, i) => (i === ultimos14.length - 1 ? 'hoje' : data(d.data, { weekday: 'short', day: 'numeric' }).replace('.', ''))),
      })}
      <div class="legend"><span><i style="background:var(--gold)"></i>Dia em que entrou conta nova</span></div>
    </div>

    <div class="grid-2" style="margin-top:12px">
      <div class="card card-pad">
        <h3>Recursos mais usados</h3>
        <p class="card-sub">Últimos 30 dias · práticas concluídas · pessoas que usaram</p>
        ${hbars(porRecurso.map((i) => ({ label: nomeRecurso(i.recurso), valor: i.total, extra: `${fmt(i.total)} · ${fmt(i.pessoas)} ${i.pessoas === 1 ? 'pessoa' : 'pessoas'}` })))}
      </div>
      <div class="card card-pad">
        <h3>Quando as pessoas rezam</h3>
        <p class="card-sub">Últimos 30 dias · horário de Brasília</p>
        ${horas(r.por_hora_30d)}
      </div>
    </div>

    <div class="grid-3" style="margin-top:12px">
      <div class="card card-pad">
        <h3>Dias da semana</h3>
        <p class="card-sub">Últimos 30 dias</p>
        ${diasSemana(r.por_dia_semana_30d)}
      </div>
      <div class="card card-pad">
        <h3>Caminhos</h3>
        <p class="card-sub">Desde o início · <a class="more" href="#caminhos">ver quem está em cada um →</a></p>
        ${rows([
          ['Bíblia · lições concluídas', fmt(r.biblia?.concluidas_total)],
          ['Bíblia · pessoas', fmt(r.biblia?.pessoas)],
          ...(r.caminhos_santos || []).map((c) => [esc(nomeSanto(c.curso)), `${fmt(c.pessoas)} ${c.pessoas === 1 ? 'pessoa' : 'pessoas'}`]),
        ])}
      </div>
      <div class="card card-pad">
        <h3>Engajamento</h3>
        <p class="card-sub">Estado atual da base</p>
        ${rows([
          ['Terminaram o onboarding', `${fmt(r.onboarding_completo)} de ${fmt(r.usuarios_total)}`],
          ['Com notificações ativas', `${fmt(r.com_lembrete)} de ${fmt(r.usuarios_total)}`],
          [`Medalhas de ${medalhaMes ? MESES_NOME[Number(medalhaMes.ano_mes.slice(5)) - 1].toLowerCase() : 'este mês'}`, fmt(medalhaMes?.total)],
          ['Cutucadas em 30 dias', fmt(r.cutucadas_30d)],
          ['Novos seguimentos em 30 dias', fmt(r.seguimentos_30d)],
        ])}
      </div>
    </div>`;
}

const filtroPessoas = { busca: '', status: 'todas' };

function linhasPessoas(pessoas) {
  const q = filtroPessoas.busca.toLowerCase();
  const filtradas = pessoas.filter((p) => {
    if (q && ![p.nome, p.username, p.email, p.paroquia].some((v) => String(v || '').toLowerCase().includes(q))) return false;
    const dias = p.ultima_atividade ? (Date.now() - new Date(p.ultima_atividade).getTime()) / 86400000 : Infinity;
    if (filtroPessoas.status === 'ativas' && dias > 7) return false;
    if (filtroPessoas.status === 'inativas' && dias <= 7) return false;
    return true;
  });
  if (!filtradas.length) return '<tr><td colspan="6" class="empty">Ninguém encontrado.</td></tr>';
  return filtradas.map((p) => `
    <tr class="link" data-id="${esc(p.id)}">
      <td><div class="person">${avatar(p)}<div class="person-text"><strong>${esc(p.nome || 'Sem nome')}</strong><span>${esc(p.username ? `@${p.username}` : p.email)}</span></div></div></td>
      <td class="hide-sm">${esc(data(p.criado_em))}</td>
      <td><span class="status ${statusAtividade(p.ultima_atividade)}"></span>${esc(relativo(p.ultima_atividade))}</td>
      <td class="r num">${fmt(p.praticas_30d)}</td>
      <td class="r num hide-sm">${fmt(p.streak)}</td>
      <td class="hide-sm">${esc(p.paroquia || '—')}</td>
    </tr>`).join('');
}

async function telaPessoas(force) {
  const pessoas = await getPessoas(force);
  const chip = (valor, label) => `<button class="chip${filtroPessoas.status === valor ? ' on' : ''}" data-status="${valor}" type="button">${label}</button>`;
  return `
    <div class="toolbar">
      <input id="busca" type="search" placeholder="Buscar por nome, @, email ou paróquia" value="${esc(filtroPessoas.busca)}">
      <div class="chips">${chip('todas', `Todas · ${pessoas.length}`)}${chip('ativas', 'Ativas na semana')}${chip('inativas', 'Sem atividade na semana')}</div>
    </div>
    <div class="card table-card">
      <table>
        <thead><tr><th>Pessoa</th><th class="hide-sm">Cadastro</th><th>Última prática</th><th class="r">Práticas · 30d</th><th class="r hide-sm">Dias de oração</th><th class="hide-sm">Paróquia</th></tr></thead>
        <tbody id="pessoasBody">${linhasPessoas(pessoas)}</tbody>
      </table>
    </div>`;
}

function ligarPessoas() {
  const atualizar = () => { $('#pessoasBody').innerHTML = linhasPessoas(cache.pessoas || []); };
  $('#busca')?.addEventListener('input', (e) => { filtroPessoas.busca = e.target.value; atualizar(); });
  document.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => {
    filtroPessoas.status = b.dataset.status;
    document.querySelectorAll('[data-status]').forEach((x) => x.classList.toggle('on', x === b));
    atualizar();
  }));
  $('#pessoasBody')?.addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (tr) location.hash = `#pessoa/${tr.dataset.id}`;
  });
}

// Resumo em frase do calendário: dias ativos, sequência atual e maior sequência.
function constancia(calendario) {
  const dias = new Set((calendario || []).map((c) => c.dia));
  const iso = (d) => d.toISOString().slice(0, 10);
  const hoje = new Date(new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()) + 'T12:00:00');
  let atual = 0;
  const d = new Date(hoje);
  if (!dias.has(iso(d))) d.setDate(d.getDate() - 1);
  while (dias.has(iso(d))) { atual += 1; d.setDate(d.getDate() - 1); }
  let maior = 0;
  let corrida = 0;
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 181);
  for (const x = new Date(inicio); x <= hoje; x.setDate(x.getDate() + 1)) {
    corrida = dias.has(iso(x)) ? corrida + 1 : 0;
    maior = Math.max(maior, corrida);
  }
  const ultimos30 = [...dias].filter((x) => (hoje - new Date(`${x}T12:00:00`)) / 86400000 < 30).length;
  return `<p class="insight">Praticou em <strong>${fmt(dias.size)} dias</strong> nos últimos 6 meses e em <strong>${fmt(ultimos30)} dos últimos 30</strong>. Sequência atual: <strong>${fmt(atual)} ${atual === 1 ? 'dia' : 'dias'} seguidos</strong>; a maior foi de ${fmt(maior)}.</p>`;
}

function heatmap(calendario) {
  const porDia = new Map((calendario || []).map((c) => [c.dia, Number(c.n)]));
  const hoje = new Date(new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date()) + 'T12:00:00');
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - 181);
  inicio.setDate(inicio.getDate() - inicio.getDay());
  const cells = [];
  for (let d = new Date(inicio); d <= hoje; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const n = porDia.get(iso) || 0;
    const nivel = n === 0 ? '' : n <= 2 ? 'l1' : n <= 5 ? 'l2' : n <= 9 ? 'l3' : 'l4';
    cells.push(`<i class="${nivel}" title="${esc(data(iso))}: ${n} ${n === 1 ? 'prática' : 'práticas'}"></i>`);
  }
  return `<div class="heatmap">${cells.join('')}</div>`;
}

function medalhas(pontosPorMes) {
  if (!pontosPorMes?.length) return '<p class="empty">Ainda sem pontos.</p>';
  return `<div class="medals">${pontosPorMes.map((m) => {
    const mes = Number(m.ano_mes.slice(5)) - 1;
    return `<div class="medal"><img class="${m.medalha ? '' : 'miss'}" src="medals/${MESES[mes]}.png" alt=""><strong>${MESES_NOME[mes]}</strong><span>${fmt(m.pontos)}/60 · ${m.ano_mes.slice(0, 4)}</span></div>`;
  }).join('')}</div>`;
}

async function telaPerfil(id, force) {
  const p = await getPerfil(id, force);
  if (!p) return '<a class="back" href="#pessoas">← Pessoas</a><p class="empty">Pessoa não encontrada.</p>';
  const conta = p.conta || {};
  const perfil = p.perfil || {};
  const t = p.totais || {};
  const b = p.biblia || {};
  const s = p.social || {};
  const pessoal = p.pessoal || {};
  const n = p.notificacoes || {};
  const pessoa = { ...perfil, email: conta.email };
  const nome = perfil.nome || conta.email;
  $('#pageTitle').textContent = nome;

  const recursos = (p.por_recurso || []).map((r) => ({
    label: nomeRecurso(r.recurso), valor: r.total, extra: `${fmt(r.total)} · ${fmt(r.em_30d)} em 30d`,
  }));
  const detalhes = (p.por_detalhe || []).map((d) => ({ label: `${nomeRecurso(d.recurso)} · ${nomeDetalhe(d.detalhe)}`, valor: d.total }));
  const pctBiblia = b.publicadas ? Math.round((b.concluidas / b.publicadas) * 100) : 0;
  const chips = [
    perfil.paroquia && `<span class="chip static">${esc(perfil.paroquia)}</span>`,
    perfil.santo_devocao && `<span class="chip static gold">${esc(perfil.santo_devocao)}</span>`,
    perfil.leitura_favorita && `<span class="chip static">${esc(perfil.leitura_favorita)}</span>`,
  ].filter(Boolean).join('');

  return `
    <a class="back" href="#pessoas">← Pessoas</a>
    <div class="card profile-head">
      ${avatar(pessoa, 'profile-avatar')}
      <div>
        <h2>${esc(nome)}</h2>
        <p class="handle">${esc([perfil.username && `@${perfil.username}`, conta.email].filter(Boolean).join(' · '))}</p>
        ${perfil.bio ? `<p class="bio">${esc(perfil.bio)}</p>` : ''}
        <div class="chips">${chips}</div>
      </div>
      <div class="profile-meta">
        <span>Conta criada <strong>${esc(data(conta.criado_em))}</strong></span>
        <span>Último login <strong>${esc(relativo(conta.ultimo_login))}</strong></span>
        <span>Última prática <strong>${esc(relativo(t.ultima_atividade))}</strong></span>
        <span>Notificações <strong>${perfil.push ? `ativas${perfil.horario_lembrete ? ` · ${esc(String(perfil.horario_lembrete).slice(0, 5))}` : ''}` : 'desligadas'}</strong></span>
      </div>
    </div>

    <div class="kpis" style="margin-top:12px">
      ${kpi('Dias de oração', fmt(perfil.streak), `${fmt(t.dias_ativos_30d)} dias ativos nos últimos 30`)}
      ${kpi('Práticas', fmt(t.praticas), `${fmt(t.praticas_30d)} em 30 dias`)}
      ${kpi('Pontos', fmt(t.pontos_total), `${fmt(t.medalhas)} ${t.medalhas === 1 ? 'medalha' : 'medalhas'}`)}
      ${kpi('Amigos', fmt(s.seguidores), `seguidores · segue ${fmt(s.seguindo)}`)}
    </div>

    <h2 class="section-title">Constância <span class="muted">últimos 6 meses · desde ${esc(data(t.primeira_atividade))}</span></h2>
    <div class="card card-pad">${constancia(p.calendario)}${heatmap(p.calendario)}<div class="legend"><span><i style="background:var(--heat-1)"></i>1–2 práticas</span><span><i style="background:var(--heat-2)"></i>3–5</span><span><i style="background:var(--heat-3)"></i>6–9</span><span><i style="background:var(--heat-4)"></i>10 ou mais</span></div></div>

    <div class="grid-2" style="margin-top:12px">
      <div class="card card-pad">
        <h3>O que mais usa</h3>
        <p class="card-sub">Práticas concluídas · total e 30 dias</p>
        ${hbars(recursos)}
      </div>
      <div class="card card-pad">
        <h3>Quando reza</h3>
        <p class="card-sub">Desde o início · horário de Brasília</p>
        ${horas(p.por_hora)}
        <h3 style="margin-top:20px">Detalhe</h3>
        <p class="card-sub">Leituras, horas e missas</p>
        ${hbars(detalhes, { gold: true })}
      </div>
    </div>

    <h2 class="section-title">Selos devocionais <span class="muted">pontos por mês · meta 60</span></h2>
    <div class="card card-pad">${medalhas(p.pontos_por_mes)}</div>

    <div class="grid-2" style="margin-top:12px">
      <div class="card card-pad">
        <h3>Caminho da Bíblia</h3>
        <p class="card-sub">Lições concluídas</p>
        <div class="ring-row" style="margin-bottom:14px">
          <div class="ring" style="--p:${pctBiblia}" data-label="${pctBiblia}%"></div>
          <div>
            <strong>${fmt(b.concluidas)} de ${fmt(b.publicadas)}</strong>
            <div class="muted small">${b.ultima ? `Última: ${esc(b.ultima.titulo || `${b.ultima.livro} ${b.ultima.capitulo}`)} · ${esc(relativo(b.ultima.concluida_em))}` : 'Nenhuma lição concluída'}</div>
            ${b.em_andamento ? `<div class="muted small">Em andamento: ${esc(b.em_andamento.livro)} ${esc(b.em_andamento.capitulo)} (passo ${fmt(b.em_andamento.passo)}/${fmt(b.em_andamento.total_passos)})</div>` : ''}
          </div>
        </div>
        ${rows((b.por_livro || []).map((l) => [esc(l.livro), fmt(l.concluidas)]))}
      </div>
      <div class="card card-pad">
        <h3>Caminhos de santo</h3>
        <p class="card-sub">Unidades concluídas de cada caminho</p>
        ${(p.caminhos_santos || []).length ? `<div class="hbars">${p.caminhos_santos.map((c) => {
          const total = CAMINHOS[c.curso]?.unidades.length;
          return `<div><div class="hbar-head"><span>${esc(nomeSanto(c.curso))}</span><span class="muted num">${total ? `${fmt(c.concluidas)} de ${fmt(total)}` : `${fmt(c.concluidas)} concluídas`} · ${esc(relativo(c.ultima))}</span></div>
            <div class="track"><div class="fill gold" style="width:${total ? pct(c.concluidas, total) : 0}%"></div></div></div>`;
        }).join('')}</div>` : '<p class="empty">Nenhum caminho de santo iniciado.</p>'}
      </div>
    </div>

    <div class="grid-3" style="margin-top:12px">
      <div class="card card-pad">
        <h3>Social</h3>
        <p class="card-sub">Relações e gestos</p>
        ${rows([
          ['Seguidores', fmt(s.seguidores)], ['Seguindo', fmt(s.seguindo)],
          ['Cutucadas enviadas', fmt(s.cutucadas_enviadas)], ['Cutucadas recebidas', fmt(s.cutucadas_recebidas)],
          ['Visitas ao perfil', fmt(s.visitas_recebidas)], ['Bloqueou · foi bloqueada', `${fmt(s.bloqueou)} · ${fmt(s.bloqueado_por)}`],
        ])}
      </div>
      <div class="card card-pad">
        <h3>Vida pessoal no app</h3>
        <p class="card-sub">Só contagens</p>
        ${rows([
          ['Anotações no diário', fmt(pessoal.anotacoes)], ['Leituras favoritas', fmt(pessoal.favoritos)],
          ['Notas em versículos', fmt(pessoal.notas_versiculo)], ['Marcadores na Bíblia', fmt(pessoal.marcadores)],
        ])}
        <p class="privacy">O conteúdo do diário, das reflexões e das notas não sai do banco.</p>
      </div>
      <div class="card card-pad">
        <h3>Conta</h3>
        <p class="card-sub">Dados de acesso</p>
        ${rows([
          ['Email confirmado', conta.email_confirmado_em ? esc(data(conta.email_confirmado_em)) : 'não'],
          ['Onboarding', perfil.onboarding_completo ? 'completo' : 'incompleto'],
          ['Selo ativo', esc(perfil.selo_ativo || '—')],
          ['Notificações recebidas · 30d', `${fmt(n.recebidas_30d)} (${fmt(n.lidas_30d)} lidas)`],
        ])}
      </div>
    </div>

    <h2 class="section-title">Atividade recente <span class="muted">últimas 30 práticas</span></h2>
    <div class="card card-pad">
      ${(p.recentes || []).length ? `<div class="timeline">${p.recentes.map((e) => `
        <div class="tl-item"><time>${esc(data(e.em, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }))}</time>
        <span><span class="tag${e.recurso === 'santo' || e.recurso === 'biblia' ? ' gold' : e.recurso === 'diario' ? ' gray' : ''}">${esc(nomeRecurso(e.recurso))}</span>${esc(e.recurso === 'biblia' ? '' : nomeDetalhe(e.detalhe))}</span></div>`).join('')}</div>`
        : '<p class="empty">Nenhuma prática registrada.</p>'}
    </div>`;
}

async function getCaminhos(force) {
  if (force || !cache.caminhos) cache.caminhos = await rpc('admin_caminhos');
  return cache.caminhos;
}

function barraProgresso(feitas, total) {
  return `<div class="progress"><div class="track"><div class="fill" style="width:${pct(feitas, total)}%"></div></div><span class="num">${fmt(feitas)}/${fmt(total)}</span></div>`;
}

async function telaCaminhos(force) {
  const c = await getCaminhos(force);
  const biblia = c.biblia_pessoas || [];
  const livros = (c.biblia_livros || []).filter((l) => l.pessoas > 0);

  const porCurso = new Map();
  (c.santos_pessoas || []).forEach((s) => {
    if (!porCurso.has(s.curso)) porCurso.set(s.curso, []);
    porCurso.get(s.curso).push(s);
  });
  const cursos = [...porCurso.keys()].sort((a, b) => porCurso.get(b).length - porCurso.get(a).length);

  const ondeBiblia = (p) => {
    if (p.em_andamento) {
      return `<strong>${esc(p.em_andamento.livro)} ${esc(p.em_andamento.capitulo)}</strong> <span class="muted">· ${esc(p.em_andamento.titulo || '')}</span><div class="muted small">em andamento, passo ${fmt(p.em_andamento.passo)} de ${fmt(p.em_andamento.total_passos)}</div>`;
    }
    if (p.ultima) {
      return `<strong>${esc(p.ultima.livro)} ${esc(p.ultima.capitulo)}</strong> <span class="muted">· ${esc(p.ultima.titulo || '')}</span><div class="muted small">última concluída</div>`;
    }
    return '<span class="muted">ainda não concluiu nenhuma</span>';
  };

  const ondeSanto = (s) => {
    if (s.atual) {
      const u = unidadeSanto(s.curso, s.atual.unidade);
      return `<strong>${u.n ? `Unidade ${u.n}` : esc(s.atual.unidade)}</strong>${u.n ? ` <span class="muted">· ${esc(u.titulo)}</span>` : ''}<div class="muted small">em andamento, passo ${fmt(s.atual.passo)} de ${fmt(s.atual.total_passos)}${u.parte ? ` · ${esc(u.parte)}` : ''}</div>`;
    }
    const total = CAMINHOS[s.curso]?.unidades.length;
    if (total && s.concluidas >= total) return '<strong class="ok">Caminho concluído</strong>';
    if (s.ultima_concluida) {
      const u = unidadeSanto(s.curso, s.ultima_concluida.unidade);
      return `<strong>Unidade ${u.n}</strong> <span class="muted">· ${esc(u.titulo)}</span><div class="muted small">última concluída</div>`;
    }
    return '<span class="muted">só abriu</span>';
  };

  const tabelaSanto = (curso) => {
    const total = CAMINHOS[curso]?.unidades.length || 0;
    const pessoas = porCurso.get(curso);
    const concluiram = total ? pessoas.filter((s) => s.concluidas >= total).length : 0;
    return `
      <div class="card table-card path-card">
        <div class="path-head">
          <div><h3>${esc(nomeSanto(curso))}</h3>
          <p class="card-sub">${total ? `${fmt(total)} unidades` : 'Caminho fora do app atual'}${CAMINHOS[curso]?.seloMes ? ` · selo de ${MESES_NOME[Number(CAMINHOS[curso].seloMes) - 1].toLowerCase()}` : ''}</p></div>
          <p class="path-stats"><strong>${fmt(pessoas.length)}</strong> ${pessoas.length === 1 ? 'pessoa' : 'pessoas'}${concluiram ? ` · <strong>${fmt(concluiram)}</strong> concluiu` : ''}</p>
        </div>
        <table>
          <thead><tr><th>Pessoa</th><th>Onde está</th><th>Progresso</th><th class="r hide-sm">Última atividade</th></tr></thead>
          <tbody>${pessoas.map((s) => `
            <tr class="link" data-id="${esc(s.id)}">
              <td>${pessoaCelula(s)}</td>
              <td>${ondeSanto(s)}</td>
              <td>${total ? barraProgresso(s.concluidas, total) : `${fmt(s.concluidas)} concluídas`}</td>
              <td class="r hide-sm">${esc(relativo(s.ultima_atividade))}</td>
            </tr>`).join('')}</tbody>
        </table>
      </div>`;
  };

  return `
    <h2 class="section-title">Caminho da Bíblia <span class="muted">${fmt(c.biblia_publicadas)} lições publicadas</span></h2>
    <div class="card table-card">
      ${biblia.length ? `<table>
        <thead><tr><th>Pessoa</th><th>Onde está</th><th class="r">Concluídas</th><th class="r hide-sm">Em 30 dias</th><th class="r hide-sm">Livros</th><th class="r hide-sm">Última atividade</th></tr></thead>
        <tbody>${biblia.map((p) => `
          <tr class="link" data-id="${esc(p.id)}">
            <td>${pessoaCelula(p)}</td>
            <td>${ondeBiblia(p)}</td>
            <td class="r num"><strong>${fmt(p.concluidas)}</strong></td>
            <td class="r num hide-sm">${fmt(p.concluidas_30d)}</td>
            <td class="r num hide-sm">${fmt(p.livros)}</td>
            <td class="r hide-sm">${esc(relativo(p.ultima_atividade))}</td>
          </tr>`).join('')}</tbody>
      </table>` : '<p class="empty" style="padding:0 12px 12px">Ninguém começou o Caminho da Bíblia ainda.</p>'}
    </div>

    ${livros.length ? `
    <h2 class="section-title">Livros com alguém estudando <span class="muted">pessoas · lições concluídas / publicadas</span></h2>
    <div class="card card-pad">
      ${hbars(livros.map((l) => ({ label: l.livro, valor: l.concluidas, extra: `${fmt(l.pessoas)} ${l.pessoas === 1 ? 'pessoa' : 'pessoas'} · ${fmt(l.concluidas)}/${fmt(l.publicadas)}` })))}
    </div>` : ''}

    <h2 class="section-title">Caminhos de santo <span class="muted">${fmt(cursos.length)} com alguém percorrendo</span></h2>
    ${cursos.length ? `<div class="paths">${cursos.map(tabelaSanto).join('')}</div>` : '<div class="card card-pad"><p class="empty">Ninguém começou um caminho de santo.</p></div>'}`;
}

function pessoaCelula(p) {
  return `<div class="person">${avatar(p)}<div class="person-text"><strong>${esc(p.nome?.trim() || 'Sem nome')}</strong><span>${esc(p.username ? `@${p.username}` : p.email)}</span></div></div>`;
}

function ligarLinhasPessoa() {
  document.querySelectorAll('tr[data-id]').forEach((tr) => tr.addEventListener('click', () => { location.hash = `#pessoa/${tr.dataset.id}`; }));
}

async function telaConteudo(force) {
  const r = await getResumo(force);
  const tabela = (cab, linhas) => `<div class="card table-card"><table><thead><tr>${cab.map((c, i) => `<th class="${i ? 'r' : ''}">${c}</th>`).join('')}</tr></thead><tbody>${
    linhas.length ? linhas.map((l) => `<tr>${l.map((v, i) => `<td class="${i ? 'r num' : ''}">${esc(v)}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${cab.length}" class="empty">Sem dados.</td></tr>`
  }</tbody></table></div>`;
  return `
    <h2 class="section-title">Caminhos <span class="muted">lições no banco</span></h2>
    ${tabela(['Percurso', 'Total', 'Publicadas', 'Rascunhos'], (r.caminhos || []).map((c) => [c.curso === 'biblia' ? 'Bíblia' : c.curso, fmt(c.total), fmt(c.publicadas), fmt(c.rascunhos)]))}
    <h2 class="section-title">Leituras diárias <span class="muted">calendário armazenado por idioma</span></h2>
    ${tabela(['Idioma', 'Dias', 'Próximos 30 dias', 'Até'], (r.leituras_por_idioma || []).map((l) => [IDIOMAS[l.idioma] || l.idioma, fmt(l.total), `${fmt(l.proximos_30_dias)}/31`, data(l.ultima_data)]))}
    <h2 class="section-title">Liturgia das Horas <span class="muted">textos próprios</span></h2>
    ${tabela(['Idioma', 'Textos', 'Revisados', 'Rascunhos'], (r.oficio_por_idioma || []).map((o) => [IDIOMAS[o.idioma] || o.idioma, fmt(o.total), fmt(o.revisados), fmt(o.rascunhos)]))}`;
}

async function telaOperacao(force) {
  const r = await getResumo(force);
  const notifs = r.notificacoes_por_tipo_7d || [];
  const ultimos14 = (r.serie_30d || []).slice(-14);
  const rotulos = ultimos14.map((d, i) => (i === ultimos14.length - 1 ? 'hoje' : data(d.data, { weekday: 'short', day: 'numeric' }).replace('.', '')));
  const totalNotif = notifs.reduce((a, x) => a + Number(x.total), 0);
  const lidas = notifs.reduce((a, x) => a + Number(x.lidas), 0);
  return `
    <div class="card card-pad">
      <h3>Notificações nos últimos 7 dias</h3>
      <p class="card-sub">Criadas dentro do app · quantas foram abertas</p>
      ${totalNotif ? `<p class="insight"><strong>${fmt(totalNotif)}</strong> notificações, <strong>${pct(lidas, totalNotif)}%</strong> abertas.</p>` : ''}
      ${hbars(notifs.map((x) => ({ label: NOTIFICACOES[x.tipo] || x.tipo, valor: x.total, extra: `${fmt(x.total)} · ${pct(x.lidas, x.total)}% abertas` })))}
    </div>
    <h2 class="section-title">Novas contas por dia <span class="muted">últimas 2 semanas</span></h2>
    <div class="card card-pad">${columns(ultimos14.map((d) => Number(d.novos)), { short: true, highlightLast: true, labels: rotulos })}</div>
    <h2 class="section-title">Práticas por dia <span class="muted">últimas 2 semanas</span></h2>
    <div class="card card-pad">${columns(ultimos14.map((d) => Number(d.praticas)), { short: true, highlightLast: true, labels: rotulos })}</div>`;
}

// ---------- Rotas ----------

const TITULOS = { 'visao-geral': 'Visão geral', pessoas: 'Pessoas', caminhos: 'Caminhos', conteudo: 'Conteúdo', operacao: 'Operação' };

async function render(force = false) {
  const hash = location.hash.replace(/^#/, '') || 'visao-geral';
  const [rota, id] = hash.split('/');
  const nav = rota === 'pessoa' ? 'pessoas' : (TITULOS[rota] ? rota : 'visao-geral');
  document.querySelectorAll('[data-route]').forEach((a) => a.classList.toggle('active', a.dataset.route === nav));
  $('#pageTitle').textContent = rota === 'pessoa' ? 'Pessoa' : TITULOS[nav];
  $('#refreshButton').disabled = true;
  setNotice(force ? 'Atualizando…' : '');
  try {
    let html;
    if (rota === 'pessoa' && id) html = await telaPerfil(id, force);
    else if (nav === 'pessoas') html = await telaPessoas(force);
    else if (nav === 'caminhos') html = await telaCaminhos(force);
    else if (nav === 'conteudo') html = await telaConteudo(force);
    else if (nav === 'operacao') html = await telaOperacao(force);
    else html = await telaVisaoGeral(force);
    $('#view').innerHTML = html;
    if (nav === 'pessoas' && rota !== 'pessoa') ligarPessoas();
    if (nav === 'caminhos') ligarLinhasPessoa();
    setNotice('');
    $('#updatedAt').textContent = `Atualizado às ${new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date())}`;
    if (!force) window.scrollTo(0, 0);
  } catch (e) {
    setNotice(e.message, true);
  } finally {
    $('#refreshButton').disabled = false;
  }
}

// ---------- Sessão ----------

function showLogin(message = '', success = false) {
  $('#appView').hidden = true;
  $('#loginView').hidden = false;
  $('#loginMessage').textContent = message;
  $('#loginMessage').classList.toggle('success', success);
}

async function entrar(session) {
  if (!session) return showLogin();
  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  $('#accountEmail').textContent = session.user.email || '';
  await render();
}

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const botao = $('#loginButton');
  botao.disabled = true;
  botao.textContent = 'Entrando…';
  $('#loginMessage').textContent = '';
  const form = new FormData(event.target);
  const { data: resposta, error } = await supabase.auth.signInWithPassword({
    email: String(form.get('email')).trim(),
    password: String(form.get('password')),
  });
  botao.disabled = false;
  botao.textContent = 'Entrar';
  if (error) return showLogin('Não foi possível entrar. Confira o email e a senha.');
  await entrar(resposta.session);
});

$('#forgotPassword').addEventListener('click', async () => {
  const email = $('#email').value.trim();
  if (!email) {
    showLogin('Informe seu email para receber o link de redefinição.');
    $('#email').focus();
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
  showLogin(error ? 'Não foi possível enviar o email agora.' : 'Se o email estiver cadastrado, você receberá um link de redefinição.', !error);
});

$('#refreshButton').addEventListener('click', () => render(true));
$('#logoutButton').addEventListener('click', async () => {
  await supabase.auth.signOut();
  cache.resumo = null; cache.pessoas = null; cache.caminhos = null; cache.perfis.clear();
  showLogin();
});
window.addEventListener('hashchange', () => { if (!$('#appView').hidden) render(); });

supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) showLogin();
});

const { data: { session } } = await supabase.auth.getSession();
await entrar(session);
