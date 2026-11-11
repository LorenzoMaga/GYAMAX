"use strict";

const fs = require("fs");

const arquivo = "script.js";
const backup = "script.js.antes-da-limpeza";

/* =========================================================
   BACKUP
========================================================= */

fs.copyFileSync(
    arquivo,
    backup
);


/* =========================================================
   LER SCRIPT
========================================================= */

const codigo =
    fs.readFileSync(
        arquivo,
        "utf8"
    );


/* =========================================================
   LOCALIZAR O CHAT ORIGINAL
========================================================= */

const posicaoChat =
    codigo.indexOf(
        "gyamaxOrcamentoOverlay"
    );


if (
    posicaoChat === -1
) {

    console.error(
        "ERRO: o código do chat não foi encontrado."
    );

    process.exit(1);
}


/*
 * Procura o comentário de início
 * mais próximo antes do chat.
 */
const inicioChat =
    codigo.lastIndexOf(
        "/* =========================================================",
        posicaoChat
    );


if (
    inicioChat === -1
) {

    console.error(
        "ERRO: não foi possível localizar o início do bloco."
    );

    process.exit(1);
}


/* =========================================================
   MANTER TUDO ANTES DO CHAT
========================================================= */

let novoCodigo =
    codigo
        .slice(
            0,
            inicioChat
        )
        .trimEnd();


/* =========================================================
   NOVO SISTEMA DE ORÇAMENTO
========================================================= */

novoCodigo += `

/* =========================================================
   GYAMAX — SOLICITAR ORÇAMENTO POR E-MAIL
========================================================= */

(function () {

    "use strict";


    function configurarOrcamento() {

        const botoes =
            document.querySelectorAll(
                '[data-i18n="quote.request"]'
            );


        botoes.forEach(
            function (botao) {

                /*
                 * Remove qualquer listener antigo
                 * ligado diretamente ao botão.
                 */
                const novoBotao =
                    botao.cloneNode(true);


                botao.replaceWith(
                    novoBotao
                );


                novoBotao.addEventListener(
                    "click",
                    function (evento) {

                        evento.preventDefault();
                        evento.stopPropagation();


                        const assunto =
                            "Solicitação de orçamento — GYAMAX";


                        const corpo = [
                            "Olá, GYAMAX!",
                            "",
                            "Gostaria de solicitar um orçamento.",
                            "",
                            "Detalhes do meu projeto:",
                            "",
                            "",
                            "Obrigado!"
                        ].join(
                            "\\n"
                        );


                        const mailto =
                            "mailto:gyamax3d@gmail.com" +
                            "?subject=" +
                            encodeURIComponent(
                                assunto
                            ) +
                            "&body=" +
                            encodeURIComponent(
                                corpo
                            );


                        window.location.href =
                            mailto;

                    }
                );

            }
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            configurarOrcamento
        );

    } else {

        configurarOrcamento();

    }

})();
`;


/* =========================================================
   SALVAR
========================================================= */

fs.writeFileSync(
    arquivo,
    novoCodigo,
    "utf8"
);


console.log("");
console.log(
    "======================================"
);
console.log(
    " ORÇAMENTO LIMPO COM SUCESSO"
);
console.log(
    "======================================"
);
console.log("");
console.log(
    "Chat antigo removido."
);
console.log(
    "Botão de orçamento configurado para"
);
console.log(
    "gyamax3d@gmail.com"
);
console.log("");
console.log(
    `Backup criado: ${backup}`
);
console.log("");