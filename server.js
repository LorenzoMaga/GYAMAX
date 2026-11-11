"use strict";

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const bcrypt = require("bcrypt");
const Database = require("better-sqlite3");
const nodemailer = require("nodemailer");

/* =========================================================
CONFIGURAÇÃO
========================================================= */

const PORT =
Number(process.env.PORT) || 3000;

const HOST =
"0.0.0.0";

const ROOT =
__dirname;

const PUBLIC =
ROOT;

const DATA_DIR =
path.join(
ROOT,
"data"
);

const DB_FILE =
path.join(
DATA_DIR,
"gyamax.db"
);

const MAX_BODY_BYTES =
10 * 1024 * 1024;

const SESSION_DAYS =
30;

/* =========================================================
E-MAIL
========================================================= */

const EMAIL_GYAMAX =
"gyamax3d@gmail.com";

const SMTP_USER =
process.env.GYAMAX_SMTP_USER ||
EMAIL_GYAMAX;

const SMTP_PASS =
process.env.GYAMAX_SMTP_PASS ||
"";

const emailTransporter =
nodemailer.createTransport({
service: "gmail",
auth: {
user: SMTP_USER,
pass: SMTP_PASS
}
});

/* =========================================================
MERCADO PAGO
========================================================= */

function credencialReal(
valor,
placeholders = []
) {


const texto =
    String(
        valor || ""
    ).trim();

if (!texto) {
    return "";
}

if (
    placeholders.some(
        placeholder =>
            texto === placeholder
    )
) {
    return "";
}

return texto;


}

const MERCADOPAGO_ACCESS_TOKEN =
credencialReal(
process.env.MERCADOPAGO_ACCESS_TOKEN,
[
"SEU_ACCESS_TOKEN",
"SEU_ACCESS_TOKEN_AQUI",
"YOUR_ACCESS_TOKEN",
"YOUR_ACCESS_TOKEN_HERE"
]
);

const MERCADOPAGO_PUBLIC_KEY =
credencialReal(
process.env.MERCADOPAGO_PUBLIC_KEY,
[
"SUA_PUBLIC_KEY",
"SUA_PUBLIC_KEY_AQUI",
"YOUR_PUBLIC_KEY",
"YOUR_PUBLIC_KEY_HERE"
]
);

const MERCADOPAGO_API =
"https://api.mercadopago.com";

const MERCADOPAGO_REAL_ATIVO =
String(
process.env.MERCADOPAGO_REAL_ATIVO || ""
)
.trim()
.toLowerCase() === "true" &&
Boolean(
MERCADOPAGO_ACCESS_TOKEN
);

const MERCADOPAGO_CARTAO_ATIVO =
MERCADOPAGO_REAL_ATIVO &&
Boolean(
MERCADOPAGO_ACCESS_TOKEN &&
MERCADOPAGO_PUBLIC_KEY
);

/* =========================================================
BANCO
========================================================= */

if (
!fs.existsSync(
DATA_DIR
)
) {


fs.mkdirSync(
    DATA_DIR,
    {
        recursive: true
    }
);


}

const db =
new Database(
DB_FILE
);

db.pragma(
"journal_mode = WAL"
);

db.pragma(
"foreign_keys = ON"
);

/* =========================================================
TABELAS
========================================================= */

db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
id INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
email TEXT NOT NULL UNIQUE,
senha TEXT NOT NULL,
admin INTEGER NOT NULL DEFAULT 0,
foto TEXT,
foto_zoom REAL NOT NULL DEFAULT 1,
foto_x REAL NOT NULL DEFAULT 0,
foto_y REAL NOT NULL DEFAULT 0,
idioma TEXT NOT NULL DEFAULT 'pt-BR',
aparencia TEXT NOT NULL DEFAULT 'escuro',
notificacoes INTEGER NOT NULL DEFAULT 0,
criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS sessoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    usuario_id INTEGER NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_em INTEGER NOT NULL,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessoes_token
    ON sessoes(token);

CREATE INDEX IF NOT EXISTS idx_sessoes_usuario
    ON sessoes(usuario_id);

CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    external_reference TEXT NOT NULL UNIQUE,
    total_centavos INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    status_detail TEXT,
    metodo_pagamento TEXT,
    parcelas INTEGER NOT NULL DEFAULT 1,
    mercado_pago_payment_id TEXT,
    cupom_codigo TEXT,
    desconto_centavos INTEGER NOT NULL DEFAULT 0,
    cupom_contabilizado INTEGER NOT NULL DEFAULT 0,
    status_producao TEXT NOT NULL DEFAULT 'aguardando_producao',
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pedidos_usuario
    ON pedidos(usuario_id);

CREATE INDEX IF NOT EXISTS idx_pedidos_external_reference
    ON pedidos(external_reference);

CREATE INDEX IF NOT EXISTS idx_pedidos_payment
    ON pedidos(mercado_pago_payment_id);

CREATE TABLE IF NOT EXISTS itens_pedido (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    preco_centavos INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    subtotal_centavos INTEGER NOT NULL,

    FOREIGN KEY (pedido_id)
        REFERENCES pedidos(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido
    ON itens_pedido(pedido_id);

CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT '',
    preco_centavos INTEGER NOT NULL DEFAULT 0,
    foto TEXT,
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_produtos_ativo
    ON produtos(ativo);

CREATE TABLE IF NOT EXISTS cupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL DEFAULT 'percentual',
    valor REAL NOT NULL DEFAULT 0,
    ativo INTEGER NOT NULL DEFAULT 1,
    primeira_compra INTEGER NOT NULL DEFAULT 0,
    limite_usos INTEGER,
    usos INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cupons_codigo
    ON cupons(codigo);

CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    experiencia INTEGER NOT NULL,
    atendimento INTEGER NOT NULL,
    qualidade INTEGER NOT NULL,
    entrega INTEGER NOT NULL,
    geral INTEGER NOT NULL,
    comentario TEXT,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario
    ON avaliacoes(usuario_id);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_criado
    ON avaliacoes(criado_em);

CREATE TABLE IF NOT EXISTS conversas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'aberta',
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_conversas_usuario
    ON conversas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_conversas_atualizado
    ON conversas(atualizado_em);

CREATE TABLE IF NOT EXISTS mensagens_chat (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversa_id INTEGER NOT NULL,
    remetente_tipo TEXT NOT NULL,
    remetente_usuario_id INTEGER,
    mensagem TEXT NOT NULL,
    lida INTEGER NOT NULL DEFAULT 0,
    criada_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (conversa_id)
        REFERENCES conversas(id)
        ON DELETE CASCADE,

    FOREIGN KEY (remetente_usuario_id)
        REFERENCES usuarios(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mensagens_chat_conversa
    ON mensagens_chat(conversa_id);

CREATE INDEX IF NOT EXISTS idx_mensagens_chat_lida
    ON mensagens_chat(lida);

CREATE INDEX IF NOT EXISTS idx_mensagens_chat_criada
    ON mensagens_chat(criada_em);


`);

/* =========================================================
MIGRAÇÕES
========================================================= */

function obterColunasTabela(
tabela
) {


return db
    .prepare(
        `PRAGMA table_info(${tabela})`
    )
    .all()
    .map(
        coluna =>
            coluna.name
    );


}

function adicionarColunaSeNaoExiste(
tabela,
coluna,
definicao
) {


const colunas =
    obterColunasTabela(
        tabela
    );

if (
    colunas.includes(
        coluna
    )
) {
    return;
}

try {

    db.exec(`
        ALTER TABLE ${tabela}
        ADD COLUMN ${coluna} ${definicao}
    `);

    console.log(
        `✓ Coluna ${tabela}.${coluna} adicionada.`
    );

} catch (erro) {

    console.error(
        `ERRO AO ADICIONAR ${tabela}.${coluna}:`,
        erro
    );

}

}

[
[
"usuarios",
"admin",
"INTEGER NOT NULL DEFAULT 0"
],
[
"usuarios",
"foto",
"TEXT"
],
[
"usuarios",
"foto_zoom",
"REAL NOT NULL DEFAULT 1"
],
[
"usuarios",
"foto_x",
"REAL NOT NULL DEFAULT 0"
],
[
"usuarios",
"foto_y",
"REAL NOT NULL DEFAULT 0"
],
[
"usuarios",
"idioma",
"TEXT NOT NULL DEFAULT 'pt-BR'"
],
[
"usuarios",
"aparencia",
"TEXT NOT NULL DEFAULT 'escuro'"
],
[
"usuarios",
"notificacoes",
"INTEGER NOT NULL DEFAULT 0"
],
[
"pedidos",
"usuario_id",
"INTEGER"
],
[
"pedidos",
"external_reference",
"TEXT"
],
[
"pedidos",
"total_centavos",
"INTEGER NOT NULL DEFAULT 0"
],
[
"pedidos",
"status",
"TEXT NOT NULL DEFAULT 'pending'"
],
[
"pedidos",
"status_detail",
"TEXT"
],
[
"pedidos",
"metodo_pagamento",
"TEXT"
],
[
"pedidos",
"parcelas",
"INTEGER NOT NULL DEFAULT 1"
],
[
"pedidos",
"mercado_pago_payment_id",
"TEXT"
],
[
"pedidos",
"cupom_codigo",
"TEXT"
],
[
"pedidos",
"desconto_centavos",
"INTEGER NOT NULL DEFAULT 0"
],
[
"pedidos",
"cupom_contabilizado",
"INTEGER NOT NULL DEFAULT 0"
],
[
"pedidos",
"status_producao",
"TEXT NOT NULL DEFAULT 'aguardando_producao'"
],
[
"cupons",
"tipo",
"TEXT NOT NULL DEFAULT 'percentual'"
],
[
"cupons",
"valor",
"REAL NOT NULL DEFAULT 0"
],
[
"cupons",
"ativo",
"INTEGER NOT NULL DEFAULT 1"
],
[
"cupons",
"primeira_compra",
"INTEGER NOT NULL DEFAULT 0"
],
[
"cupons",
"limite_usos",
"INTEGER"
],
[
"cupons",
"usos",
"INTEGER NOT NULL DEFAULT 0"
],
[
"cupons",
"criado_em",
"TEXT NOT NULL DEFAULT ''"
],
[
"cupons",
"atualizado_em",
"TEXT NOT NULL DEFAULT ''"
]
].forEach(
(
[
tabela,
coluna,
definicao
]
) =>
adicionarColunaSeNaoExiste(
tabela,
coluna,
definicao
)
);

/* =========================================================
PRODUTOS INICIAIS
========================================================= */

const quantidadeProdutos =
db.prepare(`         SELECT COUNT(*) AS total
        FROM produtos
    `).get();

if (
Number(
quantidadeProdutos?.total
) === 0
) {


const inserir =
    db.prepare(`
        INSERT INTO produtos (
            nome,
            descricao,
            preco_centavos,
            foto,
            ativo
        )
        VALUES (?, ?, ?, ?, 1)
    `);

inserir.run(
    "Modelo GYAMAX 01",
    "Produto pronto para impressão.",
    1990,
    null
);

inserir.run(
    "Modelo GYAMAX 02",
    "Produto pronto para impressão.",
    2990,
    null
);

inserir.run(
    "Modelo GYAMAX 03",
    "Produto pronto para impressão.",
    3990,
    null
);


}

/* =========================================================
ADMIN / CUPOM INICIAL
========================================================= */

db.prepare(`    UPDATE usuarios
    SET admin = 1
    WHERE LOWER(email) = LOWER(?)`).run(
EMAIL_GYAMAX
);

const cupomInicial =
db.prepare(`         SELECT id
        FROM cupons
        WHERE UPPER(codigo) = UPPER(?)
        LIMIT 1
    `).get(
"PRIMEIRACOMPRA"
);

if (!cupomInicial) {


db.prepare(`
    INSERT INTO cupons (
        codigo,
        tipo,
        valor,
        ativo,
        primeira_compra,
        limite_usos,
        usos
    )
    VALUES (
        ?,
        'percentual',
        10,
        1,
        1,
        1,
        0
    )
`).run(
    "PRIMEIRACOMPRA"
);


}

/* =========================================================
RESPOSTAS
========================================================= */

function aplicarCabecalhosComuns(
res,
contentType
) {


res.setHeader(
    "Content-Type",
    contentType
);

res.setHeader(
    "Cache-Control",
    "no-store"
);


}

function enviarJSON(
res,
status,
dados
) {


const corpo =
    JSON.stringify(
        dados
    );

aplicarCabecalhosComuns(
    res,
    "application/json; charset=utf-8"
);

res.setHeader(
    "Content-Length",
    Buffer.byteLength(
        corpo
    )
);

res.writeHead(
    status
);

res.end(
    corpo
);


}

function enviarTexto(
res,
status,
texto,
contentType =
"text/html; charset=utf-8"
) {


aplicarCabecalhosComuns(
    res,
    contentType
);

res.writeHead(
    status
);

res.end(
    texto
);


}

function redirecionar(
res,
destino
) {


res.writeHead(
    302,
    {
        Location:
            destino
    }
);

res.end();

}

/* =========================================================
CORPO
========================================================= */

function lerCorpo(
req
) {


return new Promise(
    (
        resolve,
        reject
    ) => {

        let corpo = "";
        let tamanho = 0;
        let finalizado = false;

        req.on(
            "data",
            parte => {

                if (
                    finalizado
                ) {
                    return;
                }

                tamanho +=
                    Buffer.byteLength(
                        parte
                    );

                if (
                    tamanho >
                    MAX_BODY_BYTES
                ) {

                    finalizado = true;

                    reject(
                        new Error(
                            "Requisição muito grande."
                        )
                    );

                    req.destroy();

                    return;

                }

                corpo +=
                    parte;

            }
        );

        req.on(
            "end",
            () => {

                if (
                    finalizado
                ) {
                    return;
                }

                finalizado = true;

                resolve(
                    corpo
                );

            }
        );

        req.on(
            "error",
            erro => {

                if (
                    finalizado
                ) {
                    return;
                }

                finalizado = true;

                reject(
                    erro
                );

            }
        );

    }
);

}

async function lerFormulario(
req
) {


const corpo =
    await lerCorpo(
        req
    );

const contentType =
    String(
        req.headers[
            "content-type"
        ] || ""
    ).toLowerCase();

if (
    contentType.includes(
        "application/json"
    )
) {

    try {

        const dados =
            JSON.parse(
                corpo || "{}"
            );

        return (
            dados &&
            typeof dados === "object" &&
            !Array.isArray(dados)
        )
            ? dados
            : {};

    } catch {

        throw new Error(
            "JSON inválido."
        );

    }

}

const params =
    new URLSearchParams(
        corpo
    );

const dados = {};

for (
    const [
        chave,
        valor
    ]
    of params.entries()
) {

    dados[chave] =
        valor;

}

return dados;


}

/* =========================================================
COOKIES / SESSÃO
========================================================= */

function obterCookies(
req
) {


const cookies = {};

const header =
    String(
        req.headers.cookie ||
        ""
    );

for (
    const parte
    of header.split(";")
) {

    const indice =
        parte.indexOf("=");

    if (
        indice === -1
    ) {
        continue;
    }

    const nome =
        parte.slice(
            0,
            indice
        ).trim();

    const valor =
        parte.slice(
            indice + 1
        ).trim();

    if (!nome) {
        continue;
    }

    try {

        cookies[nome] =
            decodeURIComponent(
                valor
            );

    } catch {

        cookies[nome] =
            valor;

    }

}

return cookies;


}

function criarTokenSessao() {


return crypto
    .randomBytes(48)
    .toString("hex");


}

function criarSessao(
res,
usuarioId
) {


const token =
    criarTokenSessao();

const expira =
    Date.now() +
    SESSION_DAYS *
    24 *
    60 *
    60 *
    1000;

db.prepare(`
    DELETE FROM sessoes
    WHERE usuario_id = ?
`).run(
    usuarioId
);

db.prepare(`
    INSERT INTO sessoes (
        token,
        usuario_id,
        expira_em
    )
    VALUES (?, ?, ?)
`).run(
    token,
    usuarioId,
    expira
);

res.setHeader(
    "Set-Cookie",
    [
        [
            `gyamax_session=${encodeURIComponent(token)}`,
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            "Max-Age=2592000"
        ].join("; ")
    ]
);

return token;


}

function destruirSessao(
req,
res
) {


const token =
    obterCookies(
        req
    ).gyamax_session;

if (token) {

    db.prepare(`
        DELETE FROM sessoes
        WHERE token = ?
    `).run(
        token
    );

}

res.setHeader(
    "Set-Cookie",
    [
        [
            "gyamax_session=",
            "Path=/",
            "HttpOnly",
            "SameSite=Lax",
            "Max-Age=0"
        ].join("; ")
    ]
);

}

/* =========================================================
UTILITÁRIOS
========================================================= */

function normalizarIdioma(
valor,
fallback = "pt-BR"
) {


const idiomas = [
    "pt-BR",
    "en",
    "es"
];

const idioma =
    String(
        valor || ""
    );

return idiomas.includes(
    idioma
)
    ? idioma
    : fallback;


}

function validarEmail(
valor
) {


return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(
        valor || ""
    )
);


}

function limparTexto(
valor,
limite = 200
) {


return String(
    valor || ""
)
    .trim()
    .slice(
        0,
        limite
    );


}

function escaparHTML(
valor
) {


return String(
    valor ?? ""
)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");


}

function normalizarCpf(
valor
) {


return String(
    valor || ""
)
    .replace(
        /\D/g,
        ""
    )
    .slice(
        0,
        11
    );


}

function cpfValido(
valor
) {


return /^\d{11}$/.test(
    valor
);


}

function normalizarCep(
valor
) {


return String(
    valor || ""
)
    .replace(
        /\D/g,
        ""
    )
    .slice(
        0,
        8
    );


}

function normalizarEstado(
valor
) {


return limparTexto(
    valor,
    2
).toUpperCase();


}

function gerarExternalReference() {


return (
    "GYAMAX-" +
    crypto.randomUUID().replace(
        /-/g,
        ""
    )
).slice(
    0,
    64
);


}

function gerarIdempotencyKey() {


return crypto.randomUUID();


}

function centavosParaReais(
centavos
) {


return Number(
    (
        Number(
            centavos
        ) / 100
    ).toFixed(2)
);


}

function pagamentoFoiAprovado(
status
) {


return [
    "approved",
    "paid",
    "completed",
    "delivered"
].includes(
    String(
        status || ""
    )
        .trim()
        .toLowerCase()
);


}

function extrairNome(
usuario,
dados
) {


const nome =
    limparTexto(
        dados.checkoutName ||
        dados.nome ||
        usuario.nome ||
        "Cliente",
        150
    );

const partes =
    nome
        .split(/\s+/)
        .filter(Boolean);

return {

    first_name:
        partes.shift() ||
        "Cliente",

    last_name:
        partes.join(" ") ||
        "GYAMAX"

};


}

function erroPagamento(
codigo,
mensagem,
status = 400
) {


const erro =
    new Error(
        mensagem
    );

erro.codigo =
    codigo;

erro.status =
    status;

return erro;


}

/* =========================================================
USUÁRIO
========================================================= */

function obterUsuario(
req
) {


const token =
    obterCookies(
        req
    ).gyamax_session;

if (!token) {
    return null;
}

const row =
    db.prepare(`
        SELECT
            s.expira_em,
            u.id,
            u.nome,
            u.email,
            u.admin,
            u.foto,
            u.foto_zoom,
            u.foto_x,
            u.foto_y,
            u.idioma,
            u.aparencia,
            u.notificacoes
        FROM sessoes s
        INNER JOIN usuarios u
            ON u.id = s.usuario_id
        WHERE s.token = ?
        LIMIT 1
    `).get(
        token
    );

if (!row) {
    return null;
}

if (
    Number(
        row.expira_em
    ) < Date.now()
) {

    db.prepare(`
        DELETE FROM sessoes
        WHERE token = ?
    `).run(
        token
    );

    return null;

}

return {

    id:
        row.id,

    nome:
        row.nome,

    email:
        row.email,

    admin:
        Number(
            row.admin
        ) === 1
            ? 1
            : 0,

    foto:
        row.foto || null,

    fotoZoom:
        Number(
            row.foto_zoom
        ) || 1,

    fotoX:
        Number(
            row.foto_x
        ) || 0,

    fotoY:
        Number(
            row.foto_y
        ) || 0,

    idioma:
        normalizarIdioma(
            row.idioma
        ),

    aparencia:
        [
            "escuro",
            "claro",
            "automatico"
        ].includes(
            row.aparencia
        )
            ? row.aparencia
            : "escuro",

    notificacoes:
        Boolean(
            row.notificacoes
        )

};


}

function usuarioJSON(
usuario
) {


if (!usuario) {
    return null;
}

return {

    id:
        usuario.id ?? null,

    nome:
        usuario.nome ?? "",

    email:
        usuario.email ?? "",

    admin:
        Number(
            usuario.admin
        ) === 1
            ? 1
            : 0,

    foto:
        usuario.foto || null,

    fotoZoom:
        Number(
            usuario.fotoZoom
        ) || 1,

    fotoX:
        Number(
            usuario.fotoX
        ) || 0,

    fotoY:
        Number(
            usuario.fotoY
        ) || 0,

    idioma:
        normalizarIdioma(
            usuario.idioma
        ),

    aparencia:
        [
            "escuro",
            "claro",
            "automatico"
        ].includes(
            usuario.aparencia
        )
            ? usuario.aparencia
            : "escuro",

    notificacoes:
        Boolean(
            usuario.notificacoes
        )

};


}

/* =========================================================
ADMIN
========================================================= */

function verificarAdministrador(
req
) {


const usuario =
    obterUsuario(
        req
    );

if (!usuario) {

    return {
        autorizado:
            false,

        usuario:
            null,

        motivo:
            "notLogged"
    };

}

if (
    Number(
        usuario.admin
    ) !== 1
) {

    return {
        autorizado:
            false,

        usuario,

        motivo:
            "notAdmin"
    };

}

return {
    autorizado:
        true,

    usuario,

    motivo:
        null
};


}

/* =========================================================
CONFIGURAÇÕES HTML
========================================================= */

function renderizarConfiguracoes(
usuario
) {


const arquivo =
    path.join(
        PUBLIC,
        "configuracoes.html"
    );

if (
    !fs.existsSync(
        arquivo
    )
) {

    throw new Error(
        "configuracoes.html não encontrado."
    );

}

let html =
    fs.readFileSync(
        arquivo,
        "utf8"
    );

const substituir =
    (
        chave,
        valor
    ) => {

        html =
            html.replaceAll(
                chave,
                String(
                    valor ?? ""
                )
            );

    };

const idioma =
    normalizarIdioma(
        usuario.idioma
    );

substituir(
    "__NOME__",
    escaparHTML(
        usuario.nome
    )
);

substituir(
    "__EMAIL__",
    escaparHTML(
        usuario.email
    )
);

substituir(
    "__FOTO_PERFIL__",
    escaparHTML(
        usuario.foto || ""
    )
);

substituir(
    "__FOTO_ZOOM__",
    usuario.fotoZoom
);

substituir(
    "__FOTO_X__",
    usuario.fotoX
);

substituir(
    "__FOTO_Y__",
    usuario.fotoY
);

substituir(
    "__IDIOMA__",
    idioma
);

substituir(
    "__IDIOMA_PT__",
    idioma === "pt-BR"
        ? "selected"
        : ""
);

substituir(
    "__IDIOMA_EN__",
    idioma === "en"
        ? "selected"
        : ""
);

substituir(
    "__IDIOMA_ES__",
    idioma === "es"
        ? "selected"
        : ""
);

substituir(
    "__APARENCIA__",
    escaparHTML(
        usuario.aparencia
    )
);

substituir(
    "__NOTIFICACOES__",
    usuario.notificacoes
        ? "checked"
        : ""
);

return html;


}

/* =========================================================
FOTO
========================================================= */

function normalizarFoto(
valor
) {


if (
    !valor ||
    typeof valor !== "string" ||
    !valor.startsWith(
        "data:image/"
    )
) {

    return null;

}

if (
    valor.length >
    8 * 1024 * 1024
) {

    return "PHOTO_TOO_LARGE";

}

return valor;


}

/* =========================================================
PRODUTOS
========================================================= */

function rotaListarProdutosPublicos(
req,
res
) {


try {

    const produtos =
        db.prepare(`
            SELECT
                id,
                nome,
                descricao,
                preco_centavos,
                foto
            FROM produtos
            WHERE ativo = 1
            ORDER BY id ASC
        `).all();

    return enviarJSON(
        res,
        200,
        {
            sucesso:
                true,

            produtos:
                produtos.map(
                    produto => ({

                        id:
                            produto.id,

                        nome:
                            produto.nome,

                        descricao:
                            produto.descricao || "",

                        preco:
                            centavosParaReais(
                                produto.preco_centavos
                            ),

                        foto:
                            produto.foto || null

                    })
                )
        }
    );

} catch (erro) {

    console.error(
        "ERRO AO LISTAR PRODUTOS:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "productsLoadError",

            mensagem:
                erro?.message ||
                "Não foi possível carregar os produtos."
        }
    );

}


}

/* =========================================================
CARRINHO
========================================================= */

function normalizarItensCarrinho(
itens
) {


if (
    !Array.isArray(
        itens
    )
) {

    return {
        sucesso:
            false,

        erro:
            "invalidCart"
    };

}

const mapa =
    new Map();

for (
    const item
    of itens
) {

    const id =
        Number(
            item?.id
        );

    const quantidade =
        Math.floor(
            Number(
                item?.quantidade
            )
        );

    if (
        !Number.isInteger(
            id
        ) ||
        id <= 0
    ) {

        return {
            sucesso:
                false,

            erro:
                "invalidProduct"
        };

    }

    if (
        !Number.isInteger(
            quantidade
        ) ||
        quantidade <= 0 ||
        quantidade > 100
    ) {

        return {
            sucesso:
                false,

            erro:
                "invalidQuantity"
        };

    }

    const novaQuantidade =
        (
            mapa.get(
                id
            ) || 0
        ) +
        quantidade;

    if (
        novaQuantidade > 100
    ) {

        return {
            sucesso:
                false,

            erro:
                "invalidQuantity"
        };

    }

    mapa.set(
        id,
        novaQuantidade
    );

}

if (
    mapa.size === 0
) {

    return {
        sucesso:
            false,

        erro:
            "emptyCart"
    };

}

const resultado = [];

for (
    const [
        id,
        quantidade
    ]
    of mapa.entries()
) {

    const produto =
        db.prepare(`
            SELECT
                id,
                nome,
                descricao,
                preco_centavos,
                foto,
                ativo
            FROM produtos
            WHERE
                id = ?
                AND ativo = 1
            LIMIT 1
        `).get(
            id
        );

    if (!produto) {

        return {
            sucesso:
                false,

            erro:
                "invalidProduct"
        };

    }

    resultado.push({

        id:
            produto.id,

        nome:
            produto.nome,

        descricao:
            produto.descricao || "",

        precoCentavos:
            Number(
                produto.preco_centavos
            ),

        foto:
            produto.foto || null,

        quantidade,

        subtotalCentavos:
            Number(
                produto.preco_centavos
            ) *
            quantidade

    });

}

return {
    sucesso:
        true,

    itens:
        resultado
};


}

function calcularTotalPedido(
itens
) {


return itens.reduce(
    (
        total,
        item
    ) =>
        total +
        Number(
            item.subtotalCentavos
        ),
    0
);


}

/* =========================================================
PEDIDO LOCAL
========================================================= */

const inserirPedido =
db.prepare(`         INSERT INTO pedidos (
            usuario_id,
            external_reference,
            total_centavos,
            status,
            metodo_pagamento,
            parcelas,
            cupom_codigo,
            desconto_centavos,
            cupom_contabilizado,
            status_producao
        )
        VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, 0,
            'aguardando_producao'
        )
    `);

const inserirItem =
db.prepare(`         INSERT INTO itens_pedido (
            pedido_id,
            produto_id,
            nome,
            preco_centavos,
            quantidade,
            subtotal_centavos
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `);

const criarPedidoLocal =
db.transaction(
(
usuarioId,
externalReference,
itens,
totalCentavos,
metodoPagamento,
parcelas,
cupomCodigo,
descontoCentavos
) => {


        const resultado =
            inserirPedido.run(
                usuarioId,
                externalReference,
                totalCentavos,
                "pending",
                metodoPagamento,
                parcelas,
                cupomCodigo || null,
                Number(
                    descontoCentavos
                ) || 0
            );

        const pedidoId =
            Number(
                resultado.lastInsertRowid
            );

        for (
            const item
            of itens
        ) {

            inserirItem.run(
                pedidoId,
                item.id,
                item.nome,
                item.precoCentavos,
                item.quantidade,
                item.subtotalCentavos
            );

        }

        return pedidoId;

    }
);


/* =========================================================
PAYER
========================================================= */

function montarPayer(
usuario,
dados,
cpf
) {


const nome =
    extrairNome(
        usuario,
        dados
    );

const email =
    limparTexto(
        dados.checkoutEmail ||
        dados.email ||
        usuario.email,
        150
    ).toLowerCase();

const payer = {

    email,

    first_name:
        nome.first_name,

    last_name:
        nome.last_name

};

if (
    cpfValido(cpf)
) {

    payer.identification = {
        type:
            "CPF",

        number:
            cpf
    };

}

return payer;


}

/* =========================================================
MERCADO PAGO HTTP
========================================================= */

function mercadoPagoRequest(
metodo,
endpoint,
corpo,
idempotencyKey = null
) {


return new Promise(
    (
        resolve,
        reject
    ) => {

        if (
            !MERCADOPAGO_ACCESS_TOKEN
        ) {

            return reject(
                erroPagamento(
                    "mercadoPagoNotConfigured",
                    "Access Token do Mercado Pago não configurado.",
                    503
                )
            );

        }

        const url =
            new URL(
                endpoint,
                MERCADOPAGO_API
            );

        const dados =
            JSON.stringify(
                corpo
            );

        const requisicao =
            https.request(
                {
                    hostname:
                        url.hostname,

                    port:
                        443,

                    path:
                        url.pathname +
                        url.search,

                    method:
                        metodo,

                    headers: {

                        Authorization:
                            `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,

                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",

                        "Content-Length":
                            Buffer.byteLength(
                                dados
                            ),

                        ...(idempotencyKey
                            ? {
                                "X-Idempotency-Key":
                                    idempotencyKey
                            }
                            : {})

                    }

                },
                resposta => {

                    let texto =
                        "";

                    resposta.setEncoding(
                        "utf8"
                    );

                    resposta.on(
                        "data",
                        parte => {
                            texto += parte;
                        }
                    );

                    resposta.on(
                        "end",
                        () => {

                            let json = {};

                            try {

                                json =
                                    JSON.parse(
                                        texto || "{}"
                                    );

                            } catch {}

                            if (
                                resposta.statusCode < 200 ||
                                resposta.statusCode >= 300
                            ) {

                                const erro =
                                    erroPagamento(
                                        "mercadoPagoError",

                                        json?.message ||
                                        json?.error ||
                                        `Mercado Pago respondeu HTTP ${resposta.statusCode}.`,

                                        resposta.statusCode >= 400 &&
                                        resposta.statusCode <= 599
                                            ? resposta.statusCode
                                            : 502
                                    );

                                erro.dados =
                                    json;

                                return reject(
                                    erro
                                );

                            }

                            resolve(
                                json
                            );

                        }
                    );

                }
            );

        requisicao.on(
            "error",
            reject
        );

        requisicao.write(
            dados
        );

        requisicao.end();

    }
);


}

/* =========================================================
LOGIN
========================================================= */

async function rotaLogin(
req,
res
) {


try {

    const dados =
        await lerFormulario(
            req
        );

    const email =
        limparTexto(
            dados.email,
            150
        ).toLowerCase();

    const senha =
        String(
            dados.password ||
            dados.senha ||
            ""
        );

    if (
        !email ||
        !senha
    ) {

        return enviarJSON(
            res,
            400,
            {
                sucesso:
                    false,

                erro:
                    "required"
            }
        );

    }

    const usuario =
        db.prepare(`
            SELECT *
            FROM usuarios
            WHERE LOWER(email) = ?
            LIMIT 1
        `).get(
            email
        );

    if (!usuario) {

        return enviarJSON(
            res,
            401,
            {
                sucesso:
                    false,

                erro:
                    "invalidLogin"
            }
        );

    }

    let senhaValida =
        false;

    if (
        /^\$2[aby]\$/.test(
            String(
                usuario.senha || ""
            )
        )
    ) {

        senhaValida =
            await bcrypt.compare(
                senha,
                usuario.senha
            );

    } else {

        senhaValida =
            senha ===
            String(
                usuario.senha || ""
            );

        if (
            senhaValida
        ) {

            db.prepare(`
                UPDATE usuarios
                SET
                    senha = ?,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(
                await bcrypt.hash(
                    senha,
                    12
                ),
                usuario.id
            );

        }

    }

    if (
        !senhaValida
    ) {

        return enviarJSON(
            res,
            401,
            {
                sucesso:
                    false,

                erro:
                    "invalidLogin"
            }
        );

    }

    const token =
        criarSessao(
            res,
            usuario.id
        );

    const usuarioAtualizado =
        obterUsuario({
            headers: {
                cookie:
                    `gyamax_session=${encodeURIComponent(token)}`
            }
        });

    return enviarJSON(
        res,
        200,
        {
            sucesso:
                true,

            usuario:
                usuarioJSON(
                    usuarioAtualizado
                )
        }
    );

} catch (erro) {

    console.error(
        "ERRO NO LOGIN:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "server",

            mensagem:
                erro?.message ||
                "Erro interno no login."
        }
    );

}


}

/* =========================================================
CADASTRO
========================================================= */

async function rotaCadastro(
req,
res
) {


try {

    const dados =
        await lerFormulario(
            req
        );

    const nome =
        limparTexto(
            dados.nome,
            150
        );

    const email =
        limparTexto(
            dados.email,
            150
        ).toLowerCase();

    const senha =
        String(
            dados.password ||
            dados.senha ||
            ""
        );

    if (
        !nome ||
        !email ||
        !senha
    ) {

        return enviarJSON(
            res,
            400,
            {
                sucesso:
                    false,

                erro:
                    "required"
            }
        );

    }

    if (
        !validarEmail(
            email
        )
    ) {

        return enviarJSON(
            res,
            400,
            {
                sucesso:
                    false,

                erro:
                    "invalidEmail"
            }
        );

    }

    if (
        senha.length < 6
    ) {

        return enviarJSON(
            res,
            400,
            {
                sucesso:
                    false,

                erro:
                    "weakPassword"
            }
        );

    }

    const existente =
        db.prepare(`
            SELECT id
            FROM usuarios
            WHERE LOWER(email) = ?
            LIMIT 1
        `).get(
            email
        );

    if (existente) {

        return enviarJSON(
            res,
            409,
            {
                sucesso:
                    false,

                erro:
                    "emailExists"
            }
        );

    }

    const resultado =
        db.prepare(`
            INSERT INTO usuarios (
                nome,
                email,
                senha
            )
            VALUES (?, ?, ?)
        `).run(
            nome,
            email,
            await bcrypt.hash(
                senha,
                12
            )
        );

    const usuarioId =
        Number(
            resultado.lastInsertRowid
        );

    criarSessao(
        res,
        usuarioId
    );

    return enviarJSON(
        res,
        201,
        {
            sucesso:
                true,

            usuario: {

                id:
                    usuarioId,

                nome,

                email,

                admin:
                    0

            }
        }
    );

} catch (erro) {

    console.error(
        "ERRO NO CADASTRO:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "registerError",

            mensagem:
                erro?.message ||
                "Não foi possível realizar o cadastro."
        }
    );

}


}

/* =========================================================
CONFIGURAÇÕES
========================================================= */

async function rotaSalvarConfiguracoes(
req,
res
) {


try {

    const usuario =
        obterUsuario(
            req
        );

    if (!usuario) {

        return enviarJSON(
            res,
            401,
            {
                sucesso:
                    false,

                erro:
                    "notLogged"
            }
        );

    }

    const dados =
        await lerFormulario(
            req
        );

    const nome =
        limparTexto(
            dados.nome ||
            usuario.nome,
            150
        );

    const idioma =
        normalizarIdioma(
            dados.idioma ||
            usuario.idioma
        );

    const aparencia =
        [
            "escuro",
            "claro",
            "automatico"
        ].includes(
            dados.aparencia
        )
            ? dados.aparencia
            : usuario.aparencia;

    const notificacoes =
        [
            "1",
            "true",
            "on"
        ].includes(
            String(
                dados.notificacoes ||
                ""
            ).toLowerCase()
        )
            ? 1
            : 0;

    let foto =
        usuario.foto;

    if (
        Object.prototype.hasOwnProperty.call(
            dados,
            "foto"
        )
    ) {

        const novaFoto =
            normalizarFoto(
                String(
                    dados.foto || ""
                )
            );

        if (
            novaFoto ===
            "PHOTO_TOO_LARGE"
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,

                    erro:
                        "photoTooLarge"
                }
            );

        }

        foto =
            novaFoto;

    }

    db.prepare(`
        UPDATE usuarios
        SET
            nome = ?,
            foto = ?,
            idioma = ?,
            aparencia = ?,
            notificacoes = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        nome,
        foto,
        idioma,
        aparencia,
        notificacoes,
        usuario.id
    );

    return enviarJSON(
        res,
        200,
        {
            sucesso:
                true
        }
    );

} catch (erro) {

    console.error(
        "ERRO AO SALVAR CONFIGURAÇÕES:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "settingsSaveError",

            mensagem:
                erro?.message ||
                "Não foi possível salvar as configurações."
        }
    );

}


}
/* =========================================================
AVALIAÇÕES
========================================================= */

async function rotaCriarAvaliacao(
req,
res
) {


try {

    const usuario =
        obterUsuario(
            req
        );

    if (!usuario) {

        return enviarJSON(
            res,
            401,
            {
                sucesso:
                    false,

                erro:
                    "notLogged"
            }
        );

    }

    const dados =
        await lerFormulario(
            req
        );

    const valores = {

        experiencia:
            Number(
                dados.experiencia
            ),

        atendimento:
            Number(
                dados.atendimento
            ),

        qualidade:
            Number(
                dados.qualidade
            ),

        entrega:
            Number(
                dados.entrega
            ),

        geral:
            Number(
                dados.geral
            )

    };

    for (
        const valor
        of Object.values(
            valores
        )
    ) {

        if (
            !Number.isInteger(
                valor
            ) ||
            valor < 1 ||
            valor > 5
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,

                    erro:
                        "invalidRating"
                }
            );

        }

    }

    const resultado =
        db.prepare(`
            INSERT INTO avaliacoes (
                usuario_id,
                experiencia,
                atendimento,
                qualidade,
                entrega,
                geral,
                comentario
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            usuario.id,
            valores.experiencia,
            valores.atendimento,
            valores.qualidade,
            valores.entrega,
            valores.geral,
            limparTexto(
                dados.comentario ||
                dados.comment ||
                "",
                5000
            )
        );

    return enviarJSON(
        res,
        201,
        {
            sucesso:
                true,

            id:
                Number(
                    resultado.lastInsertRowid
                )
        }
    );

} catch (erro) {

    console.error(
        "ERRO AO CRIAR AVALIAÇÃO:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "reviewCreateError",

            mensagem:
                erro?.message ||
                "Não foi possível criar a avaliação."
        }
    );

}


}

function rotaListarAvaliacoes(
req,
res
) {


try {

    const avaliacoes =
        db.prepare(`
            SELECT
                a.id,
                a.usuario_id,
                u.nome,
                a.experiencia,
                a.atendimento,
                a.qualidade,
                a.entrega,
                a.geral,
                a.comentario,
                a.criado_em,
                a.atualizado_em
            FROM avaliacoes a
            INNER JOIN usuarios u
                ON u.id = a.usuario_id
            ORDER BY a.id DESC
        `).all();

    return enviarJSON(
        res,
        200,
        {
            sucesso:
                true,

            avaliacoes:
                avaliacoes.map(
                    avaliacao => ({

                        id:
                            avaliacao.id,

                        usuarioId:
                            avaliacao.usuario_id,

                        nome:
                            avaliacao.nome,

                        experiencia:
                            Number(
                                avaliacao.experiencia
                            ),

                        atendimento:
                            Number(
                                avaliacao.atendimento
                            ),

                        qualidade:
                            Number(
                                avaliacao.qualidade
                            ),

                        entrega:
                            Number(
                                avaliacao.entrega
                            ),

                        geral:
                            Number(
                                avaliacao.geral
                            ),

                        comentario:
                            avaliacao.comentario ||
                            "",

                        criadoEm:
                            avaliacao.criado_em,

                        atualizadoEm:
                            avaliacao.atualizado_em

                    })
                )
        }
    );

} catch (erro) {

    console.error(
        "ERRO AO LISTAR AVALIAÇÕES:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "reviewsLoadError",

            mensagem:
                erro?.message ||
                "Não foi possível carregar as avaliações."
        }
    );

}

}

/* =========================================================
PEDIDOS
========================================================= */

function rotaListarPedidos(
req,
res
) {


try {

    const usuario =
        obterUsuario(
            req
        );

    if (!usuario) {

        return enviarJSON(
            res,
            401,
            {
                sucesso:
                    false,

                erro:
                    "notLogged"
            }
        );

    }

    const pedidos =
        db.prepare(`
            SELECT
                id,
                external_reference,
                total_centavos,
                status,
                status_detail,
                metodo_pagamento,
                parcelas,
                mercado_pago_payment_id,
                cupom_codigo,
                desconto_centavos,
                status_producao,
                criado_em,
                atualizado_em
            FROM pedidos
            WHERE usuario_id = ?
            ORDER BY id DESC
        `).all(
            usuario.id
        );

    return enviarJSON(
        res,
        200,
        {

            sucesso:
                true,

            pedidos:
                pedidos.map(
                    pedido => ({

                        id:
                            pedido.id,

                        externalReference:
                            pedido.external_reference,

                        total:
                            centavosParaReais(
                                pedido.total_centavos
                            ),

                        status:
                            pedido.status,

                        statusDetail:
                            pedido.status_detail,

                        metodoPagamento:
                            pedido.metodo_pagamento,

                        parcelas:
                            pedido.parcelas,

                        mercadoPagoPaymentId:
                            pedido.mercado_pago_payment_id,

                        cupomCodigo:
                            pedido.cupom_codigo,

                        desconto:
                            centavosParaReais(
                                pedido.desconto_centavos
                            ),

                        statusProducao:
                            pedido.status_producao ||
                            "aguardando_producao",

                        criadoEm:
                            pedido.criado_em,

                        atualizadoEm:
                            pedido.atualizado_em

                    })
                )

        }
    );

} catch (erro) {

    console.error(
        "ERRO AO LISTAR PEDIDOS:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "ordersLoadError",

            mensagem:
                erro?.message ||
                "Não foi possível carregar os pedidos."
        }
    );

}


}

function rotaObterPedido(
req,
res,
id
) {


try {

    const usuario =
        obterUsuario(
            req
        );

    if (!usuario) {

        return enviarJSON(
            res,
            401,
            {
                sucesso:
                    false,

                erro:
                    "notLogged"
            }
        );

    }

    const pedido =
        db.prepare(`
            SELECT *
            FROM pedidos
            WHERE
                id = ?
                AND usuario_id = ?
            LIMIT 1
        `).get(
            id,
            usuario.id
        );

    if (!pedido) {

        return enviarJSON(
            res,
            404,
            {
                sucesso:
                    false,

                erro:
                    "orderNotFound"
            }
        );

    }

    const itens =
        db.prepare(`
            SELECT
                id,
                produto_id,
                nome,
                preco_centavos,
                quantidade,
                subtotal_centavos
            FROM itens_pedido
            WHERE pedido_id = ?
            ORDER BY id ASC
        `).all(
            id
        );

    return enviarJSON(
        res,
        200,
        {

            sucesso:
                true,

            pedido: {

                id:
                    pedido.id,

                externalReference:
                    pedido.external_reference,

                total:
                    centavosParaReais(
                        pedido.total_centavos
                    ),

                status:
                    pedido.status,

                statusDetail:
                    pedido.status_detail,

                metodoPagamento:
                    pedido.metodo_pagamento,

                parcelas:
                    pedido.parcelas,

                statusProducao:
                    pedido.status_producao ||
                    "aguardando_producao",

                criadoEm:
                    pedido.criado_em,

                atualizadoEm:
                    pedido.atualizado_em

            },

            itens:
                itens.map(
                    item => ({

                        id:
                            item.id,

                        produtoId:
                            item.produto_id,

                        nome:
                            item.nome,

                        preco:
                            centavosParaReais(
                                item.preco_centavos
                            ),

                        quantidade:
                            item.quantidade,

                        subtotal:
                            centavosParaReais(
                                item.subtotal_centavos
                            )

                    })
                )

        }
    );

} catch (erro) {

    console.error(
        "ERRO AO OBTER PEDIDO:",
        erro
    );

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "orderLoadError",

            mensagem:
                erro?.message ||
                "Não foi possível carregar o pedido."
        }
    );

}


}

/* =========================================================
PAGAMENTO
========================================================= */

async function rotaCriarPagamento(
req,
res
) {


try {

    const usuario =
        obterUsuario(
            req
        );

    if (!usuario) {

        return enviarJSON(
            res,
            401,
            {
                sucesso:
                    false,

                erro:
                    "notLogged",

                mensagem:
                    "Você precisa estar logado."
            }
        );

    }

    const dados =
        await lerFormulario(
            req
        );

    let itensRecebidos =
        dados.itens ||
        dados.items ||
        dados.cart ||
        dados.carrinho ||
        [];

    if (
        typeof itensRecebidos ===
        "string"
    ) {

        try {

            itensRecebidos =
                JSON.parse(
                    itensRecebidos
                );

        } catch {

            itensRecebidos = [];

        }

    }

    const carrinho =
        normalizarItensCarrinho(
            itensRecebidos
        );

    if (
        !carrinho.sucesso
    ) {

        return enviarJSON(
            res,
            400,
            {
                sucesso:
                    false,

                erro:
                    carrinho.erro
            }
        );

    }

    const itens =
        carrinho.itens;

    const subtotalCentavos =
        calcularTotalPedido(
            itens
        );

    const cupomCodigo =
        String(
            dados.cupom ||
            dados.cupomCodigo ||
            ""
        )
            .trim()
            .toUpperCase();

    let descontoCentavos =
        0;

    let cupomUsado =
        null;

    if (
        cupomCodigo
    ) {

        const cupom =
            db.prepare(`
                SELECT *
                FROM cupons
                WHERE UPPER(codigo) = ?
                LIMIT 1
            `).get(
                cupomCodigo
            );

        if (
            cupom &&
            Number(
                cupom.ativo
            ) === 1
        ) {

            const limiteOk =
                cupom.limite_usos === null ||
                Number(
                    cupom.usos
                ) <
                Number(
                    cupom.limite_usos
                );

            let primeiraCompraOk =
                true;

            if (
                Number(
                    cupom.primeira_compra
                ) === 1
            ) {

                const anterior =
                    db.prepare(`
                        SELECT COUNT(*) AS total
                        FROM pedidos
                        WHERE
                            usuario_id = ?
                            AND status IN (
                                'approved',
                                'paid',
                                'completed',
                                'delivered'
                            )
                    `).get(
                        usuario.id
                    );

                primeiraCompraOk =
                    Number(
                        anterior?.total
                    ) === 0;

            }

            if (
                limiteOk &&
                primeiraCompraOk
            ) {

                descontoCentavos =
                    cupom.tipo === "percentual"
                        ? Math.round(
                            subtotalCentavos *
                            (
                                Number(
                                    cupom.valor
                                ) / 100
                            )
                        )
                        : Math.round(
                            Number(
                                cupom.valor
                            ) * 100
                        );

                descontoCentavos =
                    Math.max(
                        0,
                        Math.min(
                            subtotalCentavos,
                            descontoCentavos
                        )
                    );

                cupomUsado =
                    cupom;

            }

        }

    }

    const totalCentavos =
        Math.max(
            0,
            subtotalCentavos -
            descontoCentavos
        );

    if (
        totalCentavos <= 0
    ) {

        return enviarJSON(
            res,
            400,
            {
                sucesso:
                    false,

                erro:
                    "invalidTotal"
            }
        );

    }

    const metodoPagamento =
        String(
            dados.metodoPagamento ||
            dados.metodo ||
            dados.paymentMethod ||
            dados.payment_method ||
            ""
        )
            .trim()
            .toLowerCase();

    const paymentMethodId =
        String(
            dados.payment_method_id ||
            dados.paymentMethodId ||
            metodoPagamento ||
            ""
        )
            .trim()
            .toLowerCase();

    const parcelas =
        Math.max(
            1,
            Math.min(
                24,
                Number(
                    dados.installments ||
                    dados.parcelas ||
                    1
                ) || 1
            )
        );

    const externalReference =
        gerarExternalReference();

    const pedidoId =
        criarPedidoLocal(
            usuario.id,
            externalReference,
            itens,
            totalCentavos,
            paymentMethodId ||
            "indefinido",
            parcelas,
            cupomUsado
                ? cupomUsado.codigo
                : null,
            descontoCentavos
        );

    if (
        !MERCADOPAGO_REAL_ATIVO
    ) {

        const paymentId =
            "TEST-" +
            crypto
                .randomUUID()
                .replace(
                    /-/g,
                    ""
                );

        db.prepare(`
            UPDATE pedidos
            SET
                status = 'approved',
                status_detail = 'test_mode',
                mercado_pago_payment_id = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            paymentId,
            pedidoId
        );

        return enviarJSON(
            res,
            201,
            {

                sucesso:
                    true,

                modoTeste:
                    true,

                pedido: {

                    id:
                        pedidoId,

                    externalReference,

                    total:
                        centavosParaReais(
                            totalCentavos
                        ),

                    status:
                        "approved",

                    statusProducao:
                        "aguardando_producao"

                },

                pagamento: {

                    id:
                        paymentId,

                    status:
                        "approved",

                    statusDetail:
                        "test_mode"

                }

            }
        );

    }

    const cpf =
        normalizarCpf(
            dados.cpf ||
            dados.checkoutCpf ||
            dados.identificationNumber
        );

    const payer =
        montarPayer(
            usuario,
            dados,
            cpf
        );

    const pagamentoBase = {

        transaction_amount:
            centavosParaReais(
                totalCentavos
            ),

        description:
            `Pedido GYAMAX #${pedidoId}`,

        external_reference:
            externalReference,

        payer

    };

    const tokenCartao =
        String(
            dados.token ||
            dados.cardToken ||
            ""
        ).trim();

    const usarCartao =
        metodoPagamento === "cartao" ||
        metodoPagamento === "card" ||
        Boolean(
            tokenCartao
        );

    if (
        usarCartao
    ) {

        if (
            !MERCADOPAGO_CARTAO_ATIVO
        ) {

            throw erroPagamento(
                "cardNotConfigured",
                "O pagamento com cartão não está configurado.",
                503
            );

        }

        if (
            !tokenCartao
        ) {

            throw erroPagamento(
                "cardTokenRequired",
                "O token do cartão não foi informado.",
                400
            );

        }

        const pagamento =
            await mercadoPagoRequest(
                "POST",
                "/v1/payments",
                {
                    ...pagamentoBase,

                    token:
                        tokenCartao,

                    installments:
                        parcelas,

                    payment_method_id:
                        paymentMethodId
                },
                gerarIdempotencyKey()
            );

        db.prepare(`
            UPDATE pedidos
            SET
                status = ?,
                status_detail = ?,
                mercado_pago_payment_id = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            pagamento.status ||
            "pending",

            pagamento.status_detail ||
            null,

            pagamento.id
                ? String(
                    pagamento.id
                )
                : null,

            pedidoId
        );

        return enviarJSON(
            res,
            201,
            {

                sucesso:
                    true,

                modoTeste:
                    false,

                pedido: {

                    id:
                        pedidoId,

                    externalReference,

                    total:
                        centavosParaReais(
                            totalCentavos
                        ),

                    status:
                        pagamento.status ||
                        "pending",

                    statusProducao:
                        "aguardando_producao"

                },

                pagamento: {

                    id:
                        pagamento.id ||
                        null,

                    status:
                        pagamento.status ||
                        "pending",

                    statusDetail:
                        pagamento.status_detail ||
                        null,

                    metodo:
                        "cartao"

                }

            }
        );

    }

    let paymentMethod =
        paymentMethodId;

    if (
        metodoPagamento === "pix"
    ) {

        paymentMethod =
            "pix";

    }

    if (
        metodoPagamento === "boleto" ||
        metodoPagamento === "bolbradesco"
    ) {

        paymentMethod =
            "bolbradesco";

    }

    const pagamentoMP =
        await mercadoPagoRequest(
            "POST",
            "/v1/payments",
            {
                ...pagamentoBase,

                payment_method_id:
                    paymentMethod
            },
            gerarIdempotencyKey()
        );

    db.prepare(`
        UPDATE pedidos
        SET
            status = ?,
            status_detail = ?,
            mercado_pago_payment_id = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        pagamentoMP.status ||
        "pending",

        pagamentoMP.status_detail ||
        null,

        pagamentoMP.id
            ? String(
                pagamentoMP.id
            )
            : null,

        pedidoId
    );

    return enviarJSON(
        res,
        201,
        {

            sucesso:
                true,

            modoTeste:
                false,

            pedido: {

                id:
                    pedidoId,

                externalReference,

                total:
                    centavosParaReais(
                        totalCentavos
                    ),

                status:
                    pagamentoMP.status ||
                    "pending",

                statusProducao:
                    "aguardando_producao"

            },

            pagamento: {

                id:
                    pagamentoMP.id ||
                    null,

                status:
                    pagamentoMP.status ||
                    "pending",

                statusDetail:
                    pagamentoMP.status_detail ||
                    null,

                metodo:
                    paymentMethod,

                qrCode:
                    pagamentoMP
                        .point_of_interaction
                        ?.transaction_data
                        ?.qr_code ||
                    null,

                qrCodeBase64:
                    pagamentoMP
                        .point_of_interaction
                        ?.transaction_data
                        ?.qr_code_base64 ||
                    null,

                ticketUrl:
                    pagamentoMP
                        .transaction_details
                        ?.external_resource_url ||
                    null,

                barcode:
                    pagamentoMP
                        .transaction_details
                        ?.barcode ||
                    pagamentoMP.barcode ||
                    null,

                expirationDate:
                    pagamentoMP
                        .date_of_expiration ||
                    null

            }

        }
    );

} catch (erro) {

    console.error(
        "ERRO AO CRIAR PAGAMENTO:",
        erro
    );

    return enviarJSON(
        res,
        Number(
            erro?.status
        ) >= 400
            ? Number(
                erro.status
            )
            : 500,
        {

            sucesso:
                false,

            erro:
                erro?.codigo ||
                "paymentError",

            mensagem:
                erro?.message ||
                "Não foi possível criar o pagamento.",

            detalhes:
                erro?.dados ||
                null

        }
    );

}


}

/* =========================================================
ADMIN — PRODUTOS
========================================================= */

function rotaAdminListarProdutos(
req,
res
) {


const acesso =
    verificarAdministrador(
        req
    );

if (!acesso.autorizado) {

    return enviarJSON(
        res,
        acesso.motivo === "notLogged"
            ? 401
            : 403,
        {
            sucesso:
                false,

            erro:
                acesso.motivo
        }
    );

}

try {

    const produtos =
        db.prepare(`
            SELECT *
            FROM produtos
            ORDER BY id ASC
        `).all();

    return enviarJSON(
        res,
        200,
        {

            sucesso:
                true,

            produtos:
                produtos.map(
                    produto => ({

                        id:
                            produto.id,

                        nome:
                            produto.nome,

                        descricao:
                            produto.descricao || "",

                        preco:
                            centavosParaReais(
                                produto.preco_centavos
                            ),

                        foto:
                            produto.foto || null,

                        ativo:
                            Number(
                                produto.ativo
                            ),

                        criadoEm:
                            produto.criado_em,

                        atualizadoEm:
                            produto.atualizado_em

                    })
                )

        }
    );

} catch (erro) {

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "adminProductsLoadError",

            mensagem:
                erro?.message
        }
    );

}


}

async function rotaAdminCriarProduto(
req,
res
) {


const acesso =
    verificarAdministrador(
        req
    );

if (!acesso.autorizado) {

    return enviarJSON(
        res,
        acesso.motivo === "notLogged"
            ? 401
            : 403,
        {
            sucesso:
                false,

            erro:
                acesso.motivo
        }
    );

}

try {

    const dados =
        await lerFormulario(
            req
        );

    const nome =
        limparTexto(
            dados.nome,
            150
        );

    const descricao =
        limparTexto(
            dados.descricao,
            2000
        );

    const preco =
        Number(
            String(
                dados.preco || ""
            ).replace(
                ",",
                "."
            )
        );

    const ativo =
        [
            "1",
            "true",
            "on"
        ].includes(
            String(
                dados.ativo ?? "1"
            ).toLowerCase()
        )
            ? 1
            : 0;

    if (
        !nome ||
        !Number.isFinite(
            preco
        ) ||
        preco <= 0
    ) {

        return enviarJSON(
            res,
            400,
            {
                sucesso:
                    false,

                erro:
                    "invalidProduct"
            }
        );

    }

    let foto = null;

    if (
        dados.foto
    ) {

        foto =
            normalizarFoto(
                String(
                    dados.foto
                )
            );

        if (
            foto ===
            "PHOTO_TOO_LARGE"
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,

                    erro:
                        "photoTooLarge"
                }
            );

        }

    }

    const resultado =
        db.prepare(`
            INSERT INTO produtos (
                nome,
                descricao,
                preco_centavos,
                foto,
                ativo
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            nome,
            descricao,
            Math.round(
                preco * 100
            ),
            foto,
            ativo
        );

    return enviarJSON(
        res,
        201,
        {
            sucesso:
                true,

            produto: {

                id:
                    Number(
                        resultado.lastInsertRowid
                    ),

                nome,

                descricao,

                preco,

                foto,

                ativo

            }
        }
    );

} catch (erro) {

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "adminProductCreateError",

            mensagem:
                erro?.message
        }
    );

}


}

async function rotaAdminAtualizarProduto(
req,
res,
id
) {


const acesso =
    verificarAdministrador(
        req
    );

if (!acesso.autorizado) {

    return enviarJSON(
        res,
        acesso.motivo === "notLogged"
            ? 401
            : 403,
        {
            sucesso:
                false,

            erro:
                acesso.motivo
        }
    );

}

try {

    const produto =
        db.prepare(`
            SELECT *
            FROM produtos
            WHERE id = ?
            LIMIT 1
        `).get(
            id
        );

    if (!produto) {

        return enviarJSON(
            res,
            404,
            {
                sucesso:
                    false,

                erro:
                    "productNotFound"
            }
        );

    }

    const dados =
        await lerFormulario(
            req
        );

    const nome =
        Object.prototype.hasOwnProperty.call(
            dados,
            "nome"
        )
            ? limparTexto(
                dados.nome,
                150
            )
            : produto.nome;

    const descricao =
        Object.prototype.hasOwnProperty.call(
            dados,
            "descricao"
        )
            ? limparTexto(
                dados.descricao,
                2000
            )
            : produto.descricao;

    const preco =
        Object.prototype.hasOwnProperty.call(
            dados,
            "preco"
        )
            ? Number(
                String(
                    dados.preco
                ).replace(
                    ",",
                    "."
                )
            )
            : centavosParaReais(
                produto.preco_centavos
            );

    const ativo =
        Object.prototype.hasOwnProperty.call(
            dados,
            "ativo"
        )
            ? (
                [
                    "1",
                    "true",
                    "on"
                ].includes(
                    String(
                        dados.ativo
                    ).toLowerCase()
                )
                    ? 1
                    : 0
            )
            : Number(
                produto.ativo
            );

    let foto =
        produto.foto ||
        null;

    if (
        Object.prototype.hasOwnProperty.call(
            dados,
            "foto"
        )
    ) {

        const valor =
            String(
                dados.foto ||
                ""
            );

        if (!valor) {

            foto =
                null;

        } else {

            foto =
                normalizarFoto(
                    valor
                );

            if (
                foto ===
                "PHOTO_TOO_LARGE"
            ) {

                return enviarJSON(
                    res,
                    400,
                    {
                        sucesso:
                            false,

                        erro:
                            "photoTooLarge"
                    }
                );

            }

        }

    }

    db.prepare(`
        UPDATE produtos
        SET
            nome = ?,
            descricao = ?,
            preco_centavos = ?,
            foto = ?,
            ativo = ?,
            atualizado_em = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(
        nome,
        descricao,
        Math.round(
            preco * 100
        ),
        foto,
        ativo,
        id
    );

    return enviarJSON(
        res,
        200,
        {
            sucesso:
                true
        }
    );

} catch (erro) {

    return enviarJSON(
        res,
        500,
        {
            sucesso:
                false,

            erro:
                "adminProductUpdateError",

            mensagem:
                erro?.message
        }
    );

}


}
/* =========================================================
   ADMIN — CLIENTES
========================================================= */

function rotaAdminClientes(
    req,
    res
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const clientes =
            db.prepare(`
                SELECT
                    id,
                    nome,
                    email,
                    admin,
                    foto,
                    idioma,
                    aparencia,
                    notificacoes,
                    criado_em,
                    atualizado_em
                FROM usuarios
                ORDER BY id DESC
            `).all();

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                clientes:
                    clientes.map(
                        cliente => ({

                            id:
                                cliente.id,

                            nome:
                                cliente.nome,

                            email:
                                cliente.email,

                            admin:
                                Number(
                                    cliente.admin
                                ),

                            foto:
                                cliente.foto ||
                                null,

                            idioma:
                                cliente.idioma,

                            aparencia:
                                cliente.aparencia,

                            notificacoes:
                                Boolean(
                                    cliente.notificacoes
                                ),

                            criadoEm:
                                cliente.criado_em,

                            atualizadoEm:
                                cliente.atualizado_em

                        })
                    )
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO LISTAR CLIENTES:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "adminClientsLoadError",
                mensagem:
                    erro?.message ||
                    "Não foi possível carregar os clientes."
            }
        );

    }

}


/* =========================================================
   ADMIN — PEDIDOS
========================================================= */

function rotaAdminPedidos(
    req,
    res
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const pedidos =
            db.prepare(`
                SELECT
                    p.*,
                    u.nome AS usuario_nome,
                    u.email AS usuario_email
                FROM pedidos p
                INNER JOIN usuarios u
                    ON u.id = p.usuario_id
                ORDER BY p.id DESC
            `).all();

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                pedidos:
                    pedidos.map(
                        pedido => ({

                            id:
                                pedido.id,

                            usuarioId:
                                pedido.usuario_id,

                            usuarioNome:
                                pedido.usuario_nome,

                            usuarioEmail:
                                pedido.usuario_email,

                            externalReference:
                                pedido.external_reference,

                            total:
                                centavosParaReais(
                                    pedido.total_centavos
                                ),

                            status:
                                pedido.status,

                            statusDetail:
                                pedido.status_detail,

                            metodoPagamento:
                                pedido.metodo_pagamento,

                            parcelas:
                                pedido.parcelas,

                            mercadoPagoPaymentId:
                                pedido.mercado_pago_payment_id,

                            cupomCodigo:
                                pedido.cupom_codigo,

                            desconto:
                                centavosParaReais(
                                    pedido.desconto_centavos
                                ),

                            statusProducao:
                                pedido.status_producao ||
                                "aguardando_producao",

                            criadoEm:
                                pedido.criado_em,

                            atualizadoEm:
                                pedido.atualizado_em

                        })
                    )
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO LISTAR PEDIDOS ADMIN:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,

                erro:
                    "adminOrdersLoadError",

                mensagem:
                    erro?.message ||
                    "Não foi possível carregar os pedidos."
            }
        );

    }

}


/* =========================================================
   ADMIN — CUPONS
========================================================= */

function rotaAdminListarCupons(
    req,
    res
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const cupons =
            db.prepare(`
                SELECT *
                FROM cupons
                ORDER BY id DESC
            `).all();

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                cupons:
                    cupons.map(
                        cupom => ({

                            id:
                                cupom.id,

                            codigo:
                                cupom.codigo,

                            tipo:
                                cupom.tipo,

                            valor:
                                Number(
                                    cupom.valor
                                ),

                            ativo:
                                Number(
                                    cupom.ativo
                                ),

                            primeiraCompra:
                                Number(
                                    cupom.primeira_compra
                                ),

                            limiteUsos:
                                cupom.limite_usos === null
                                    ? null
                                    : Number(
                                        cupom.limite_usos
                                    ),

                            usos:
                                Number(
                                    cupom.usos
                                ),

                            criadoEm:
                                cupom.criado_em,

                            atualizadoEm:
                                cupom.atualizado_em

                        })
                    )
            }
        );

    } catch (erro) {

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "adminCouponsLoadError",
                mensagem:
                    erro?.message
            }
        );

    }

}


async function rotaAdminCriarCupom(
    req,
    res
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const dados =
            await lerFormulario(
                req
            );

        const codigo =
            limparTexto(
                dados.codigo,
                100
            )
                .toUpperCase();

        const tipo =
            [
                "percentual",
                "fixo"
            ].includes(
                String(
                    dados.tipo ||
                    ""
                ).toLowerCase()
            )
                ? String(
                    dados.tipo
                ).toLowerCase()
                : "percentual";

        const valor =
            Number(
                String(
                    dados.valor ||
                    "0"
                ).replace(
                    ",",
                    "."
                )
            );

        const ativo =
            [
                "1",
                "true",
                "on"
            ].includes(
                String(
                    dados.ativo ?? "1"
                ).toLowerCase()
            )
                ? 1
                : 0;

        const primeiraCompra =
            [
                "1",
                "true",
                "on"
            ].includes(
                String(
                    dados.primeira_compra ??
                    dados.primeiraCompra ??
                    "0"
                ).toLowerCase()
            )
                ? 1
                : 0;

        const limiteUsosTexto =
            String(
                dados.limite_usos ??
                dados.limiteUsos ??
                ""
            ).trim();

        const limiteUsos =
            limiteUsosTexto
                ? Number(
                    limiteUsosTexto
                )
                : null;

        if (
            !codigo ||
            !Number.isFinite(
                valor
            ) ||
            valor <= 0
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "invalidCoupon"
                }
            );

        }

        if (
            tipo === "percentual" &&
            valor > 100
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "invalidCoupon"
                }
            );

        }

        if (
            limiteUsos !== null &&
            (
                !Number.isInteger(
                    limiteUsos
                ) ||
                limiteUsos <= 0
            )
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "invalidCouponLimit"
                }
            );

        }

        const existente =
            db.prepare(`
                SELECT id
                FROM cupons
                WHERE UPPER(codigo) = UPPER(?)
                LIMIT 1
            `).get(
                codigo
            );

        if (existente) {

            return enviarJSON(
                res,
                409,
                {
                    sucesso:
                        false,
                    erro:
                        "couponExists"
                }
            );

        }

        const resultado =
            db.prepare(`
                INSERT INTO cupons (
                    codigo,
                    tipo,
                    valor,
                    ativo,
                    primeira_compra,
                    limite_usos,
                    usos,
                    criado_em,
                    atualizado_em
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    0,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
            `).run(
                codigo,
                tipo,
                valor,
                ativo,
                primeiraCompra,
                limiteUsos
            );

        return enviarJSON(
            res,
            201,
            {
                sucesso:
                    true,

                id:
                    Number(
                        resultado.lastInsertRowid
                    )
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO CRIAR CUPOM:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "adminCouponCreateError",
                mensagem:
                    erro?.message
            }
        );

    }

}


async function rotaAdminAtualizarCupom(
    req,
    res,
    id
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const cupom =
            db.prepare(`
                SELECT *
                FROM cupons
                WHERE id = ?
                LIMIT 1
            `).get(
                id
            );

        if (!cupom) {

            return enviarJSON(
                res,
                404,
                {
                    sucesso:
                        false,
                    erro:
                        "couponNotFound"
                }
            );

        }

        const dados =
            await lerFormulario(
                req
            );

        const codigo =
            Object.prototype.hasOwnProperty.call(
                dados,
                "codigo"
            )
                ? limparTexto(
                    dados.codigo,
                    100
                ).toUpperCase()
                : cupom.codigo;

        const tipo =
            Object.prototype.hasOwnProperty.call(
                dados,
                "tipo"
            )
                ? (
                    [
                        "percentual",
                        "fixo"
                    ].includes(
                        String(
                            dados.tipo
                        ).toLowerCase()
                    )
                        ? String(
                            dados.tipo
                        ).toLowerCase()
                        : cupom.tipo
                )
                : cupom.tipo;

        const valor =
            Object.prototype.hasOwnProperty.call(
                dados,
                "valor"
            )
                ? Number(
                    String(
                        dados.valor
                    ).replace(
                        ",",
                        "."
                    )
                )
                : Number(
                    cupom.valor
                );

        const ativo =
            Object.prototype.hasOwnProperty.call(
                dados,
                "ativo"
            )
                ? (
                    [
                        "1",
                        "true",
                        "on"
                    ].includes(
                        String(
                            dados.ativo
                        ).toLowerCase()
                    )
                        ? 1
                        : 0
                )
                : Number(
                    cupom.ativo
                );

        const primeiraCompra =
            Object.prototype.hasOwnProperty.call(
                dados,
                "primeira_compra"
            ) ||
            Object.prototype.hasOwnProperty.call(
                dados,
                "primeiraCompra"
            )
                ? (
                    [
                        "1",
                        "true",
                        "on"
                    ].includes(
                        String(
                            dados.primeira_compra ??
                            dados.primeiraCompra ??
                            ""
                        ).toLowerCase()
                    )
                        ? 1
                        : 0
                )
                : Number(
                    cupom.primeira_compra
                );

        const limiteTexto =
            Object.prototype.hasOwnProperty.call(
                dados,
                "limite_usos"
            ) ||
            Object.prototype.hasOwnProperty.call(
                dados,
                "limiteUsos"
            )
                ? String(
                    dados.limite_usos ??
                    dados.limiteUsos ??
                    ""
                ).trim()
                : null;

        const limiteUsos =
            limiteTexto === null
                ? cupom.limite_usos
                : (
                    limiteTexto
                        ? Number(
                            limiteTexto
                        )
                        : null
                );

        if (
            !codigo ||
            !Number.isFinite(
                valor
            ) ||
            valor <= 0
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "invalidCoupon"
                }
            );

        }

        if (
            tipo === "percentual" &&
            valor > 100
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "invalidCoupon"
                }
            );

        }

        if (
            limiteUsos !== null &&
            (
                !Number.isInteger(
                    limiteUsos
                ) ||
                limiteUsos <= 0
            )
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "invalidCouponLimit"
                }
            );

        }

        const outro =
            db.prepare(`
                SELECT id
                FROM cupons
                WHERE
                    UPPER(codigo) = UPPER(?)
                    AND id <> ?
                LIMIT 1
            `).get(
                codigo,
                id
            );

        if (outro) {

            return enviarJSON(
                res,
                409,
                {
                    sucesso:
                        false,
                    erro:
                        "couponExists"
                }
            );

        }

        db.prepare(`
            UPDATE cupons
            SET
                codigo = ?,
                tipo = ?,
                valor = ?,
                ativo = ?,
                primeira_compra = ?,
                limite_usos = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            codigo,
            tipo,
            valor,
            ativo,
            primeiraCompra,
            limiteUsos,
            id
        );

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO ATUALIZAR CUPOM:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "adminCouponUpdateError",
                mensagem:
                    erro?.message
            }
        );

    }

}


/* =========================================================
   ADMIN — PRODUÇÃO
========================================================= */

function rotaAdminProducao(
    req,
    res
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const pedidos =
            db.prepare(`
                SELECT
                    p.*,
                    u.nome AS usuario_nome,
                    u.email AS usuario_email
                FROM pedidos p
                INNER JOIN usuarios u
                    ON u.id = p.usuario_id
                WHERE
                    p.status IN (
                        'approved',
                        'paid',
                        'completed',
                        'delivered'
                    )
                ORDER BY p.id DESC
            `).all();

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                pedidos:
                    pedidos.map(
                        pedido => ({

                            id:
                                pedido.id,

                            usuarioId:
                                pedido.usuario_id,

                            usuarioNome:
                                pedido.usuario_nome,

                            usuarioEmail:
                                pedido.usuario_email,

                            total:
                                centavosParaReais(
                                    pedido.total_centavos
                                ),

                            status:
                                pedido.status,

                            statusProducao:
                                pedido.status_producao ||
                                "aguardando_producao",

                            criadoEm:
                                pedido.criado_em,

                            atualizadoEm:
                                pedido.atualizado_em

                        })
                    )
            }
        );

    } catch (erro) {

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "productionLoadError",
                mensagem:
                    erro?.message
            }
        );

    }

}


async function alterarStatusProducaoPedido(
    req,
    res,
    id
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const pedido =
            db.prepare(`
                SELECT *
                FROM pedidos
                WHERE id = ?
                LIMIT 1
            `).get(
                id
            );

        if (!pedido) {

            return enviarJSON(
                res,
                404,
                {
                    sucesso:
                        false,
                    erro:
                        "orderNotFound"
                }
            );

        }

        const statusAtual =
            pedido.status_producao ||
            "aguardando_producao";

        const etapas = [
            "aguardando_producao",
            "em_producao",
            "pronto",
            "enviado",
            "entregue"
        ];

        const indice =
            etapas.indexOf(
                statusAtual
            );

        const proximo =
            indice >= 0 &&
            indice < etapas.length - 1
                ? etapas[
                    indice + 1
                ]
                : statusAtual;

        db.prepare(`
            UPDATE pedidos
            SET
                status_producao = ?,
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            proximo,
            id
        );

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                statusProducao:
                    proximo
            }
        );

    } catch (erro) {

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "productionUpdateError",
                mensagem:
                    erro?.message
            }
        );

    }

}


/* =========================================================
   CHAT — CLIENTE
========================================================= */

function obterOuCriarConversa(
    usuarioId
) {

    let conversa =
        db.prepare(`
            SELECT *
            FROM conversas
            WHERE usuario_id = ?
            ORDER BY id DESC
            LIMIT 1
        `).get(
            usuarioId
        );

    if (
        !conversa
    ) {

        const resultado =
            db.prepare(`
                INSERT INTO conversas (
                    usuario_id,
                    status,
                    criado_em,
                    atualizado_em
                )
                VALUES (
                    ?,
                    'aberta',
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                )
            `).run(
                usuarioId
            );

        conversa =
            db.prepare(`
                SELECT *
                FROM conversas
                WHERE id = ?
                LIMIT 1
            `).get(
                Number(
                    resultado.lastInsertRowid
                )
            );

    }

    return conversa;

}


function formatarMensagemChat(
    mensagem
) {

    return {

        id:
            mensagem.id,

        conversaId:
            mensagem.conversa_id,

        remetenteTipo:
            mensagem.remetente_tipo,

        remetenteUsuarioId:
            mensagem.remetente_usuario_id,

        mensagem:
            mensagem.mensagem,

        lida:
            Boolean(
                mensagem.lida
            ),

        criadaEm:
            mensagem.criada_em

    };

}

function formatarDataChat(
    valor
) {

    if (!valor) {
        return null;
    }

    const texto =
        String(
            valor
        ).trim();

    const data =
        new Date(
            texto.replace(
                " ",
                "T"
            ) + "Z"
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return texto;

    }

    return new Intl.DateTimeFormat(
        "pt-BR",
        {
            timeZone:
                "America/Sao_Paulo",

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit"
        }
    ).format(
        data
    );

}


function formatarDataChat(
    valor
) {

    if (!valor) {
        return null;
    }

    const texto =
        String(
            valor
        ).trim();

    const data =
        new Date(
            texto.includes("T")
                ? texto
                : texto.replace(
                    " ",
                    "T"
                ) + "Z"
        );

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return texto;

    }

    return data.toLocaleString(
        "pt-BR",
        {
            timeZone:
                "America/Sao_Paulo"
        }
    );

}


function formatarMensagemChat(
    mensagem
) {

    const dataOriginal =
        mensagem.criada_em;

    const dataFormatada =
        formatarDataChat(
            dataOriginal
        );

    let hora =
        "";

    if (
        dataOriginal
    ) {

        const texto =
            String(
                dataOriginal
            ).trim();

        const data =
            new Date(
                texto.replace(
                    " ",
                    "T"
                ) + "Z"
            );

        if (
            !Number.isNaN(
                data.getTime()
            )
        ) {

            hora =
                data.toLocaleTimeString(
                    "pt-BR",
                    {
                        timeZone:
                            "America/Sao_Paulo",

                        hour:
                            "2-digit",

                        minute:
                            "2-digit"
                    }
                );

        }

    }

    return {

        id:
            mensagem.id,

        conversaId:
            mensagem.conversa_id,

        remetenteTipo:
            mensagem.remetente_tipo,

        remetenteUsuarioId:
            mensagem.remetente_usuario_id,

        mensagem:
            mensagem.mensagem,

        lida:
            Boolean(
                mensagem.lida
            ),

        criadaEm:
            dataFormatada,

        criadoEm:
            dataFormatada,

        createdAt:
            dataFormatada,

        horario:
            hora,

        hora:
            hora

    };

}
function rotaChatObterConversa(
    req,
    res
) {

    try {

        const usuario =
            obterUsuario(
                req
            );

        if (!usuario) {

            return enviarJSON(
                res,
                401,
                {
                    sucesso:
                        false,
                    erro:
                        "notLogged"
                }
            );

        }

        const conversa =
            obterOuCriarConversa(
                usuario.id
            );

        const mensagens =
            db.prepare(`
                SELECT *
                FROM mensagens_chat
                WHERE conversa_id = ?
                ORDER BY id ASC
            `).all(
                conversa.id
            );

        db.prepare(`
            UPDATE mensagens_chat
            SET lida = 1
            WHERE
                conversa_id = ?
                AND remetente_tipo = 'admin'
        `).run(
            conversa.id
        );

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                conversa: {

                    id:
                        conversa.id,

                    usuarioId:
                        conversa.usuario_id,

                    status:
                        conversa.status,

                    criadoEm:
                        conversa.criado_em,

                    atualizadoEm:
                        conversa.atualizado_em

                },

                mensagens:
                    mensagens.map(
                        formatarMensagemChat
                    )

            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO OBTER CONVERSA:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "chatLoadError",
                mensagem:
                    erro?.message
            }
        );

    }

}


async function rotaChatEnviarMensagem(
    req,
    res
) {

    try {

        const usuario =
            obterUsuario(
                req
            );

        if (!usuario) {

            return enviarJSON(
                res,
                401,
                {
                    sucesso:
                        false,
                    erro:
                        "notLogged"
                }
            );

        }

        const dados =
            await lerFormulario(
                req
            );

        const mensagem =
            limparTexto(
                dados.mensagem ||
                dados.message ||
                "",
                5000
            );

        if (!mensagem) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "emptyMessage"
                }
            );

        }

        const conversa =
            obterOuCriarConversa(
                usuario.id
            );

        const resultado =
            db.prepare(`
                INSERT INTO mensagens_chat (
                    conversa_id,
                    remetente_tipo,
                    remetente_usuario_id,
                    mensagem,
                    lida
                )
                VALUES (
                    ?,
                    'usuario',
                    ?,
                    ?,
                    0
                )
            `).run(
                conversa.id,
                usuario.id,
                mensagem
            );

        db.prepare(`
            UPDATE conversas
            SET
                status = 'aberta',
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            conversa.id
        );

        const novaMensagem =
            db.prepare(`
                SELECT *
                FROM mensagens_chat
                WHERE id = ?
                LIMIT 1
            `).get(
                Number(
                    resultado.lastInsertRowid
                )
            );

        return enviarJSON(
            res,
            201,
            {
                sucesso:
                    true,

                mensagem:
                    formatarMensagemChat(
                        novaMensagem
                    )
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO ENVIAR MENSAGEM:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "chatSendError",
                mensagem:
                    erro?.message
            }
        );

    }

}


/* =========================================================
   CHAT — ADMIN
========================================================= */

function rotaAdminChatConversas(
    req,
    res
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const conversas =
            db.prepare(`
                SELECT
                    c.id,
                    c.usuario_id,
                    c.status,
                    c.criado_em,
                    c.atualizado_em,
                    u.nome,
                    u.email,

                    (
                        SELECT mensagem
                        FROM mensagens_chat m
                        WHERE m.conversa_id = c.id
                        ORDER BY m.id DESC
                        LIMIT 1
                    ) AS ultima_mensagem,

                    (
                        SELECT lida
                        FROM mensagens_chat m2
                        WHERE
                            m2.conversa_id = c.id
                            AND m2.remetente_tipo = 'usuario'
                        ORDER BY m2.id DESC
                        LIMIT 1
                    ) AS ultima_mensagem_lida

                FROM conversas c

                INNER JOIN usuarios u
                    ON u.id = c.usuario_id

                ORDER BY c.atualizado_em DESC
            `).all();

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                conversas:
                    conversas.map(
                        conversa => ({

                            id:
                                conversa.id,

                            usuarioId:
                                conversa.usuario_id,

                            nome:
                                conversa.nome,

                            email:
                                conversa.email,

                            status:
                                conversa.status,

                            ultimaMensagem:
                                conversa.ultima_mensagem ||
                                "",

                            ultimaMensagemLida:
                                Boolean(
                                    conversa.ultima_mensagem_lida
                                ),

                            criadoEm:
                                conversa.criado_em,

                            atualizadoEm:
                                conversa.atualizado_em

                        })
                    )
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO LISTAR CONVERSAS ADMIN:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "adminChatConversationsLoadError",
                mensagem:
                    erro?.message
            }
        );

    }

}


function rotaAdminChatConversa(
    req,
    res,
    id
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const conversa =
            db.prepare(`
                SELECT
                    c.*,
                    u.nome,
                    u.email
                FROM conversas c
                INNER JOIN usuarios u
                    ON u.id = c.usuario_id
                WHERE c.id = ?
                LIMIT 1
            `).get(
                id
            );

        if (!conversa) {

            return enviarJSON(
                res,
                404,
                {
                    sucesso:
                        false,
                    erro:
                        "conversationNotFound"
                }
            );

        }

        const mensagens =
            db.prepare(`
                SELECT *
                FROM mensagens_chat
                WHERE conversa_id = ?
                ORDER BY id ASC
            `).all(
                id
            );

        db.prepare(`
            UPDATE mensagens_chat
            SET lida = 1
            WHERE
                conversa_id = ?
                AND remetente_tipo = 'usuario'
        `).run(
            id
        );

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                conversa: {

                    id:
                        conversa.id,

                    usuarioId:
                        conversa.usuario_id,

                    nome:
                        conversa.nome,

                    email:
                        conversa.email,

                    status:
                        conversa.status,

                    criadoEm:
                        conversa.criado_em,

                    atualizadoEm:
                        conversa.atualizado_em

                },

                mensagens:
                    mensagens.map(
                        formatarMensagemChat
                    )
            }
        );

    } catch (erro) {

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "adminChatConversationLoadError",
                mensagem:
                    erro?.message
            }
        );

    }

}


async function rotaAdminChatEnviarMensagem(
    req,
    res,
    id
) {

    const acesso =
        verificarAdministrador(
            req
        );

    if (!acesso.autorizado) {

        return enviarJSON(
            res,
            acesso.motivo === "notLogged"
                ? 401
                : 403,
            {
                sucesso:
                    false,
                erro:
                    acesso.motivo
            }
        );

    }

    try {

        const conversa =
            db.prepare(`
                SELECT *
                FROM conversas
                WHERE id = ?
                LIMIT 1
            `).get(
                id
            );

        if (!conversa) {

            return enviarJSON(
                res,
                404,
                {
                    sucesso:
                        false,
                    erro:
                        "conversationNotFound"
                }
            );

        }

        const dados =
            await lerFormulario(
                req
            );

        const mensagem =
            limparTexto(
                dados.mensagem ||
                dados.message ||
                "",
                5000
            );

        if (!mensagem) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "emptyMessage"
                }
            );

        }

        const resultado =
            db.prepare(`
                INSERT INTO mensagens_chat (
                    conversa_id,
                    remetente_tipo,
                    remetente_usuario_id,
                    mensagem,
                    lida
                )
                VALUES (
                    ?,
                    'admin',
                    ?,
                    ?,
                    0
                )
            `).run(
                id,
                acesso.usuario.id,
                mensagem
            );

        db.prepare(`
            UPDATE conversas
            SET
                status = 'aberta',
                atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            id
        );

        const novaMensagem =
            db.prepare(`
                SELECT *
                FROM mensagens_chat
                WHERE id = ?
                LIMIT 1
            `).get(
                Number(
                    resultado.lastInsertRowid
                )
            );

        return enviarJSON(
            res,
            201,
            {
                sucesso:
                    true,

                mensagem:
                    formatarMensagemChat(
                        novaMensagem
                    )
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO ENVIAR MENSAGEM ADMIN:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,
                erro:
                    "adminChatSendError",
                mensagem:
                    erro?.message
            }
        );

    }

}
/* =========================================================
   ORÇAMENTO
========================================================= */

async function rotaOrcamento(
    req,
    res
) {

    try {

        const usuario =
            obterUsuario(
                req
            );

        if (!usuario) {

            return enviarJSON(
                res,
                401,
                {
                    sucesso:
                        false,
                    erro:
                        "notLogged",
                    mensagem:
                        "Você precisa estar logado."
                }
            );

        }

        const dados =
            await lerFormulario(
                req
            );

        const nome =
            limparTexto(
                dados.nome ||
                usuario.nome ||
                "",
                150
            );

        const email =
            limparTexto(
                dados.email ||
                usuario.email ||
                "",
                150
            )
                .toLowerCase();

        const mensagem =
            limparTexto(
                dados.mensagem ||
                "",
                5000
            );

        if (
            !nome ||
            !email ||
            !mensagem
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "required",
                    mensagem:
                        "Nome, e-mail e mensagem são obrigatórios."
                }
            );

        }

        if (
            !validarEmail(
                email
            )
        ) {

            return enviarJSON(
                res,
                400,
                {
                    sucesso:
                        false,
                    erro:
                        "invalidEmail",
                    mensagem:
                        "E-mail inválido."
                }
            );

        }

        await emailTransporter.sendMail({

            from:
                `"GYAMAX" <${SMTP_USER}>`,

            to:
                EMAIL_GYAMAX,

            replyTo:
                email,

            subject:
                `Nova solicitação de orçamento — ${nome}`,

            text:
                [
                    "Nova solicitação de orçamento GYAMAX.",
                    "",
                    `Nome: ${nome}`,
                    `E-mail: ${email}`,
                    "",
                    "Mensagem:",
                    mensagem
                ].join(
                    "\n"
                ),

            html:
                `
                    <h2>
                        Nova solicitação de orçamento
                    </h2>

                    <p>
                        <strong>Nome:</strong>
                        ${escaparHTML(nome)}
                    </p>

                    <p>
                        <strong>E-mail:</strong>
                        ${escaparHTML(email)}
                    </p>

                    <p>
                        <strong>Mensagem:</strong>
                    </p>

                    <p>
                        ${escaparHTML(
                            mensagem
                        ).replace(
                            /\n/g,
                            "<br>"
                        )}
                    </p>
                `
        });

        return enviarJSON(
            res,
            200,
            {
                sucesso:
                    true,

                mensagem:
                    "Solicitação de orçamento enviada com sucesso."
            }
        );

    } catch (erro) {

        console.error(
            "ERRO AO ENVIAR ORÇAMENTO:",
            erro
        );

        return enviarJSON(
            res,
            500,
            {
                sucesso:
                    false,

                erro:
                    "quoteSendError",

                mensagem:
                    erro?.message ||
                    "Não foi possível enviar a solicitação de orçamento."
            }
        );

    }

}
/* =========================================================
MIME
========================================================= */

function obterContentType(
ext
) {


return {

    ".html":
        "text/html; charset=utf-8",

    ".css":
        "text/css; charset=utf-8",

    ".js":
        "application/javascript; charset=utf-8",

    ".json":
        "application/json; charset=utf-8",

    ".png":
        "image/png",

    ".jpg":
        "image/jpeg",

    ".jpeg":
        "image/jpeg",

    ".webp":
        "image/webp",

    ".svg":
        "image/svg+xml",

    ".ico":
        "image/x-icon",

    ".gif":
        "image/gif",

    ".bmp":
        "image/bmp",

    ".woff":
        "font/woff",

    ".woff2":
        "font/woff2",

    ".ttf":
        "font/ttf",

    ".mp4":
        "video/mp4",

    ".webm":
        "video/webm",

    ".mp3":
        "audio/mpeg"

}[
    String(
        ext || ""
    ).toLowerCase()
] ||
"application/octet-stream";


}

/* =========================================================
CAMINHO SEGURO
========================================================= */

function caminhoSeguro(
urlPath
) {


let relativo;

try {

    relativo =
        decodeURIComponent(
            String(
                urlPath ||
                "/"
            )
        );

} catch {

    return null;

}

relativo =
    relativo.split(
        "?"
    )[0];

if (
    !relativo ||
    relativo === "/"
) {

    relativo =
        "/index.html";

}

relativo =
    relativo.replace(
        /^\/+/,
        ""
    );

const raiz =
    path.resolve(
        PUBLIC
    );

const caminho =
    path.resolve(
        PUBLIC,
        relativo
    );

if (
    caminho !== raiz &&
    !caminho.startsWith(
        raiz +
        path.sep
    )
) {

    return null;

}

return caminho;


}

/* =========================================================
SERVIR ARQUIVOS
========================================================= */

function servirArquivo(
req,
res,
caminho
) {


fs.stat(
    caminho,
    (
        erroStat,
        stat
    ) => {

        if (
            erroStat ||
            !stat.isFile()
        ) {

            return enviarTexto(
                res,
                404,
                "Página não encontrada.",
                "text/plain; charset=utf-8"
            );

        }

        const contentType =
            obterContentType(
                path.extname(
                    caminho
                )
            );

        aplicarCabecalhosComuns(
            res,
            contentType
        );

        if (
            req.method ===
            "HEAD"
        ) {

            res.writeHead(
                200
            );

            return res.end();

        }

        fs.readFile(
            caminho,
            (
                erro,
                arquivo
            ) => {

                if (
                    erro
                ) {

                    return enviarTexto(
                        res,
                        500,
                        "Erro ao ler o arquivo.",
                        "text/plain; charset=utf-8"
                    );

                }

                res.writeHead(
                    200
                );

                res.end(
                    arquivo
                );

            }
        );

    }
);


}

/* =========================================================
IPS
========================================================= */

function obterIpsLocais() {


const interfaces =
    os.networkInterfaces();

const ips = [];

for (
    const nomeInterface
    of Object.keys(
        interfaces
    )
) {

    for (
        const endereco
        of interfaces[
            nomeInterface
        ] || []
    ) {

        if (
            endereco &&
            endereco.family === "IPv4" &&
            !endereco.internal
        ) {

            ips.push(
                endereco.address
            );

        }

    }

}

return [
    ...new Set(
        ips
    )
];


}

/* =========================================================
SERVIDOR
========================================================= */

const server =
http.createServer(
async (
req,
res
) => {


        try {

            if (
                req.method ===
                "OPTIONS"
            ) {

                aplicarCabecalhosComuns(
                    res,
                    "text/plain; charset=utf-8"
                );

                res.writeHead(
                    204
                );

                return res.end();

            }

            const url =
                new URL(
                    req.url || "/",
                    `http://${
                        req.headers.host ||
                        "localhost"
                    }`
                );

            let rota =
                url.pathname;

            if (
                rota.length > 1 &&
                rota.endsWith("/")
            ) {

                rota =
                    rota.slice(
                        0,
                        -1
                    );

            }

            /* =================================================
               STATUS LOGIN
            ================================================= */

            if (
                req.method === "GET" &&
                (
                    rota === "/status-login" ||
                    rota === "/api/status-login"
                )
            ) {

                const usuario =
                    obterUsuario(
                        req
                    );

                return enviarJSON(
                    res,
                    200,
                    {
                        logado:
                            Boolean(
                                usuario
                            ),

                        usuario:
                            usuarioJSON(
                                usuario
                            )
                    }
                );

            }

            /* =================================================
               LOGIN
            ================================================= */

            if (
                req.method === "POST" &&
                (
                    rota === "/login" ||
                    rota === "/api/login"
                )
            ) {

                return await rotaLogin(
                    req,
                    res
                );

            }

            /* =================================================
               CADASTRO
            ================================================= */

            if (
                req.method === "POST" &&
                (
                    rota === "/cadastro" ||
                    rota === "/api/cadastro"
                )
            ) {

                return await rotaCadastro(
                    req,
                    res
                );

            }

            /* =================================================
               CONFIGURAÇÕES
            ================================================= */

            if (
                req.method === "POST" &&
                (
                    rota === "/configuracoes" ||
                    rota === "/salvar-configuracoes" ||
                    rota === "/api/configuracoes" ||
                    rota === "/api/salvar-configuracoes"
                )
            ) {

                return await rotaSalvarConfiguracoes(
                    req,
                    res
                );

            }

            if (
                req.method === "GET" &&
                (
                    rota === "/configuracoes" ||
                    rota === "/configuracoes.html"
                )
            ) {

                const usuario =
                    obterUsuario(
                        req
                    );

                if (
                    !usuario
                ) {

                    return redirecionar(
                        res,
                        "/login.html"
                    );

                }

                return enviarTexto(
                    res,
                    200,
                    renderizarConfiguracoes(
                        usuario
                    ),
                    "text/html; charset=utf-8"
                );

            }

            /* =================================================
               LOGOUT
            ================================================= */

            if (
                (
                    req.method === "GET" ||
                    req.method === "POST"
                ) &&
                (
                    rota === "/logout" ||
                    rota === "/api/logout"
                )
            ) {

                destruirSessao(
                    req,
                    res
                );

                if (
                    req.method === "GET"
                ) {

                    return redirecionar(
                        res,
                        "/"
                    );

                }

                return enviarJSON(
                    res,
                    200,
                    {
                        sucesso:
                            true
                    }
                );

            }

            /* =================================================
               PRODUTOS
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/produtos"
            ) {

                return rotaListarProdutosPublicos(
                    req,
                    res
                );

            }

            /* =================================================
               PAGAMENTO
            ================================================= */

            if (
                req.method === "POST" &&
                (
                    rota === "/api/pagamentos" ||
                    rota === "/api/payments"
                )
            ) {

                return await rotaCriarPagamento(
                    req,
                    res
                );

            }

            /* =================================================
               PEDIDOS
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/pedidos"
            ) {

                return rotaListarPedidos(
                    req,
                    res
                );

            }

            const matchPedido =
                rota.match(
                    /^\/api\/pedidos\/(\d+)$/
                );

            if (
                req.method === "GET" &&
                matchPedido
            ) {

                return rotaObterPedido(
                    req,
                    res,
                    Number(
                        matchPedido[1]
                    )
                );

            }

            /* =================================================
               AVALIAÇÕES
            ================================================= */

            if (
                req.method === "POST" &&
                (
                    rota === "/api/avaliacoes" ||
                    rota === "/api/reviews"
                )
            ) {

                return await rotaCriarAvaliacao(
                    req,
                    res
                );

            }

            if (
                req.method === "GET" &&
                (
                    rota === "/api/avaliacoes" ||
                    rota === "/api/reviews"
                )
            ) {

                return rotaListarAvaliacoes(
                    req,
                    res
                );

            }

            /* =================================================
               ADMIN — CLIENTES
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/admin/clientes"
            ) {

                return rotaAdminClientes(
                    req,
                    res
                );

            }

            /* =================================================
               ADMIN — PEDIDOS
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/admin/pedidos"
            ) {

                return rotaAdminPedidos(
                    req,
                    res
                );

            }

            /* =================================================
               ADMIN — PRODUTOS
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/admin/produtos"
            ) {

                return rotaAdminListarProdutos(
                    req,
                    res
                );

            }

            if (
                req.method === "POST" &&
                rota === "/api/admin/produtos"
            ) {

                return await rotaAdminCriarProduto(
                    req,
                    res
                );

            }

            const matchAdminProduto =
                rota.match(
                    /^\/api\/admin\/produtos\/(\d+)$/
                );

            if (
                req.method === "POST" &&
                matchAdminProduto
            ) {

                return await rotaAdminAtualizarProduto(
                    req,
                    res,
                    Number(
                        matchAdminProduto[1]
                    )
                );

            }

            /* =================================================
               ADMIN — CUPONS
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/admin/cupons"
            ) {

                return rotaAdminListarCupons(
                    req,
                    res
                );

            }

            if (
                req.method === "POST" &&
                rota === "/api/admin/cupons"
            ) {

                return await rotaAdminCriarCupom(
                    req,
                    res
                );

            }

            const matchAdminCupom =
                rota.match(
                    /^\/api\/admin\/cupons\/(\d+)$/
                );

            if (
                req.method === "POST" &&
                matchAdminCupom
            ) {

                return await rotaAdminAtualizarCupom(
                    req,
                    res,
                    Number(
                        matchAdminCupom[1]
                    )
                );

            }

            /* =================================================
               ADMIN — PRODUÇÃO
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/admin/producao"
            ) {

                return rotaAdminProducao(
                    req,
                    res
                );

            }

            const matchProducao =
                rota.match(
                    /^\/api\/admin\/producao\/(\d+)\/avancar$/
                );

            if (
                req.method === "POST" &&
                matchProducao
            ) {

                return await alterarStatusProducaoPedido(
                    req,
                    res,
                    Number(
                        matchProducao[1]
                    )
                );

            }

            /* =================================================
               CHAT CLIENTE
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/chat/conversa"
            ) {

                return rotaChatObterConversa(
                    req,
                    res
                );

            }

            if (
                req.method === "POST" &&
                rota === "/api/chat/conversa/mensagem"
            ) {

                return await rotaChatEnviarMensagem(
                    req,
                    res
                );

            }

            /* =================================================
               CHAT ADMIN
            ================================================= */

            if (
                req.method === "GET" &&
                rota === "/api/admin/chat/conversas"
            ) {

                return rotaAdminChatConversas(
                    req,
                    res
                );

            }

            const matchChatConversa =
                rota.match(
                    /^\/api\/admin\/chat\/conversas\/(\d+)$/
                );

            if (
                req.method === "GET" &&
                matchChatConversa
            ) {

                return rotaAdminChatConversa(
                    req,
                    res,
                    Number(
                        matchChatConversa[1]
                    )
                );

            }

            const matchChatMensagem =
                rota.match(
                    /^\/api\/admin\/chat\/conversas\/(\d+)\/mensagem$/
                );

            if (
                req.method === "POST" &&
                matchChatMensagem
            ) {

                return await rotaAdminChatEnviarMensagem(
                    req,
                    res,
                    Number(
                        matchChatMensagem[1]
                    )
                );

            }
/* =================================================
   ORÇAMENTO
================================================= */

if (
    req.method === "POST" &&
    rota === "/api/orcamento"
) {

    return await rotaOrcamento(
        req,
        res
    );

}
            /* =================================================
               ARQUIVOS ESTÁTICOS
            ================================================= */

            const arquivo =
                caminhoSeguro(
                    rota
                );

            if (
                !arquivo
            ) {

                return enviarTexto(
                    res,
                    400,
                    "Requisição inválida.",
                    "text/plain; charset=utf-8"
                );

            }

            return servirArquivo(
                req,
                res,
                arquivo
            );

        } catch (erro) {

            console.error(
                "ERRO NO SERVIDOR:",
                erro
            );

            if (
                !res.headersSent
            ) {

                return enviarJSON(
                    res,
                    500,
                    {
                        sucesso:
                            false,

                        erro:
                            "server",

                        mensagem:
                            erro?.message ||
                            "Erro interno do servidor."
                    }
                );

            }

        }

    }
);


/* =========================================================
ERRO DO SERVIDOR
========================================================= */

server.on(
"error",
erro => {


    console.error("");

    console.error(
        "======================================"
    );

    console.error(
        " ERRO AO INICIAR O SERVIDOR"
    );

    console.error(
        "======================================"
    );

    console.error(
        erro
    );

    console.error("");

}


);

/* =========================================================
ENCERRAMENTO
========================================================= */

function encerrarServidor() {


console.log("");

console.log(
    "Encerrando servidor GYAMAX..."
);

server.close(
    () => {

        try {

            db.close();

        } catch {}

        console.log(
            "Servidor encerrado."
        );

        process.exit(
            0
        );

    }
);


}

process.on(
"SIGINT",
encerrarServidor
);

process.on(
"SIGTERM",
encerrarServidor
);

/* =========================================================
INICIAR
========================================================= */

server.listen(
PORT,
HOST,
() => {


    console.log("");

    console.log(
        "======================================"
    );

    console.log(
        " GYAMAX SERVER ONLINE"
    );

    console.log(
        "======================================"
    );

    console.log("");

    console.log(
        `Local: http://localhost:${PORT}`
    );

    console.log(
        `Local: http://127.0.0.1:${PORT}`
    );

    console.log("");

    const ips =
        obterIpsLocais();

    if (
        ips.length
    ) {

        console.log(
            "ACESSO PELA REDE LOCAL:"
        );

        for (
            const ip
            of ips
        ) {

            console.log(
                `http://${ip}:${PORT}`
            );

        }

        console.log("");

    }

    console.log(
        `Banco SQLite: ${DB_FILE}`
    );

    console.log("");

    console.log(
        MERCADOPAGO_REAL_ATIVO
            ? "PAGAMENTOS REAIS ATIVOS"
            : "MODO DE TESTE ATIVO"
    );

    console.log("");

}


);

