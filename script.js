/* =========================================================
   GYAMAX — SCRIPT PRINCIPAL
   Login / Cadastro / Sessão / Configurações
   Português / English / Español
   Tema / Preferências / Avatar com inicial
   Loja / Carrinho / Checkout
========================================================= */

"use strict";


/* =========================================================
   ESTADO
========================================================= */

let usuarioAtual = null;


/* =========================================================
   PRODUTOS DA LOJA
========================================================= */

let produtosLoja = {};


/* =========================================================
   CARREGAR PRODUTOS DO SQLITE
========================================================= */

async function carregarProdutosLoja() {

    try {

        const resposta =
            await fetch(
                "/api/produtos",
                {
                    method:
                        "GET",

                    credentials:
                        "same-origin",

                    cache:
                        "no-store",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const dados =
            await resposta.json();


        if (
            !resposta.ok ||
            !dados.sucesso
        ) {

            throw new Error(
                dados.mensagem ||
                dados.erro ||
                "Não foi possível carregar os produtos."
            );

        }


        const lista =
            Array.isArray(
                dados.produtos
            )
                ? dados.produtos
                : [];


        const mapa = {};


        lista.forEach(
            produto => {

                const id =
                    Number(
                        produto.id
                    );


                if (
                    !Number.isInteger(
                        id
                    )
                ) {

                    return;

                }


                mapa[id] = {

                    id,

                    preco:
                        Number(
                            produto.preco
                        ) || 0,

                    nome:
                        produto.nome ||
                        `Produto ${id}`,

                    descricao:
                        produto.descricao ||
                        "",

                    foto:
                        produto.foto ||
                        null

                };

            }
        );


        produtosLoja =
            mapa;


        return produtosLoja;

    } catch (erro) {

        console.error(
            "Erro carregando produtos da loja:",
            erro
        );


        produtosLoja =
            {};

        return produtosLoja;

    }

}

/* =========================================================
   TRADUÇÕES
========================================================= */

const traducoes = {

    /* =====================================================
       PORTUGUÊS
    ===================================================== */

    "pt-BR": {

        page: {

            index:
                "GYAMAX | Impressão 3D & Fabricação",

            login:
                "GYAMAX | Entrar",

            cadastro:
                "GYAMAX | Criar conta",

            configuracoes:
                "GYAMAX | Configurações",

            loja:
                "GYAMAX | Loja",

            carrinho:
                "GYAMAX | Carrinho",

            checkout:
                "GYAMAX | Finalizar compra"
        },


        common: {

            or:
                "ou",

            backHome:
                "← Voltar para o site"
        },


              nav: {

            home:
                "Início",

            services:
                "Serviços",

            process:
                "Como funciona",

            projects:
                "Projetos",

            store:
                "Loja",

            about:
                "Sobre",

            review:
                "Avaliação"
        },


        hero: {

            tag:
                "IMPRESSÃO 3D & FABRICAÇÃO",

            title:
                "Sua ideia.",

            titleSpan:
                "Nossa tecnologia.",

            description:
                "Transformamos ideias, projetos e necessidades em peças reais através da impressão 3D e fabricação personalizada.",

            projects:
                "Ver projetos"
        },


        services: {

            tag:
                "O QUE FAZEMOS",

            title:
                "Soluções que ganham forma.",

            description:
                "Da ideia à peça final, a GYAMAX transforma projetos digitais em objetos reais."
        },


        service: {

            1: {

                label:
                    "FABRICAÇÃO",

                title:
                    "Impressão 3D",

                description:
                    "Transformamos modelos digitais em peças físicas com precisão e qualidade."
            },

            2: {

                label:
                    "SOB MEDIDA",

                title:
                    "Peças personalizadas",

                description:
                    "Criamos peças desenvolvidas de acordo com a necessidade de cada projeto."
            },

            3: {

                label:
                    "DESENVOLVIMENTO",

                title:
                    "Prototipagem",

                description:
                    "Dê vida às suas ideias criando protótipos para testar, ajustar e evoluir projetos."
            },

            4: {

                label:
                    "REPOSIÇÃO",

                title:
                    "Reposição de peças",

                description:
                    "Reproduzimos peças quebradas, antigas ou difíceis de encontrar."
            }
        },


        process: {

            tag:
                "COMO FUNCIONA",

            title:
                "Do projeto à realidade.",

            1: {

                title:
                    "Você envia",

                description:
                    "Envie seu modelo 3D ou explique o que você precisa."
            },

            2: {

                title:
                    "Analisamos",

                description:
                    "Avaliamos o projeto, material, tamanho e quantidade."
            },

            3: {

                title:
                    "Produzimos",

                description:
                    "Após a aprovação, sua peça entra em produção."
            },

            4: {

                title:
                    "Você recebe",

                description:
                    "Sua peça pronta, produzida especialmente para você."
            }
        },


        projects: {

            tag:
                "PROJETOS",

            title:
                "Feito para sair da tela.",

            description:
                "Em breve, alguns dos projetos produzidos pela GYAMAX estarão aqui.",

            project1:
                "PROJETO 01",

            project2:
                "PROJETO 02",

            project3:
                "PROJETO 03"
        },


        about: {

            tag:
                "SOBRE A GYAMAX",

            title:
                "Tecnologia para transformar ideias.",

            text1:
                "A GYAMAX nasceu com o objetivo de transformar projetos digitais em soluções físicas.",

            text2:
                "Trabalhamos com impressão 3D e fabricação personalizada para criar peças funcionais, protótipos e produtos sob medida.",

            button:
                "Fale com a GYAMAX"
        },


        quote: {

            tag:
                "VAMOS CRIAR?",

            title:
                "Tem uma ideia?",

            titleSpan:
                "Vamos tirar do papel.",

            description:
                "Entre em contato com a GYAMAX e solicite seu orçamento.",

            request:
                "Solicitar orçamento"
        },


        footer: {

            description:
                "Impressão 3D & Fabricação",

            rights:
                "Todos os direitos reservados."
        },


        /* =================================================
           LOJA
        ================================================= */

        store: {

            tag:
                "LOJA GYAMAX",

            title:
                "Modelos prontos para ganhar forma.",

            description:
                "Encontre modelos e produtos prontos da GYAMAX com preço fixo.",

            productsTitle:
                "Produtos",

            productsDescription:
                "Escolha o produto que deseja comprar.",

            preview:
                "Prévia do produto",

            categoryModel:
                "MODELO",

            addToCart:
                "Adicionar",

            cart:
                "Carrinho",

            ctaTag:
                "NÃO ENCONTROU?",

            ctaTitle:
                "Precisa de algo personalizado?",

            ctaDescription:
                "A GYAMAX também cria peças e projetos sob medida.",

            ctaButton:
                "Solicitar orçamento"
        },


        product: {

            1: {

                name:
                    "Modelo GYAMAX 01",

                description:
                    "Modelo pronto para impressão desenvolvido pela GYAMAX."
            },

            2: {

                name:
                    "Modelo GYAMAX 02",

                description:
                    "Modelo pronto para impressão com acabamento detalhado."
            },

            3: {

                name:
                    "Modelo GYAMAX 03",

                description:
                    "Modelo pronto para produção e impressão."
            }
        },


        /* =================================================
           CARRINHO
        ================================================= */

        cart: {

            tag:
                "SEU CARRINHO",

            title:
                "Carrinho de compras",

            description:
                "Revise seus produtos antes de finalizar a compra.",

            emptyTitle:
                "Seu carrinho está vazio.",

            emptyDescription:
                "Adicione algum produto da loja para começar.",

            goStore:
                "Ir para a loja",

            summary:
                "Resumo do pedido",

            subtotal:
                "Subtotal",

            shipping:
                "Frete",

            shippingSoon:
                "A calcular",

            total:
                "Total",

            checkout:
                "Finalizar compra",

            continueShopping:
                "Continuar comprando",

            remove:
                "Remover",

            decrease:
                "Diminuir quantidade",

            increase:
                "Aumentar quantidade",

            quantity:
                "Quantidade",

            added:
                "Produto adicionado ao carrinho.",

            clear:
                "Limpar carrinho",

            demoCheckout:
                "O checkout será conectado ao sistema de pagamento na próxima etapa."
        },


        /* =================================================
           CHECKOUT
        ================================================= */

        checkout: {

            tag:
                "FINALIZAÇÃO",

            title:
                "Finalizar compra",

            description:
                "Confira seus dados, escolha o método de pagamento e finalize seu pedido.",

            customer:
                "Seus dados",

            name:
                "Nome completo",

            email:
                "E-mail",

            cpf:
                "CPF",

            payment:
                "Forma de pagamento",

            card:
                "Cartão",

            pix:
                "Pix",

            boleto:
                "Boleto",

            installments:
                "Parcelamento",

            cashPayment:
                "À vista",

            cardNumber:
                "Número do cartão",

            cardName:
                "Nome impresso no cartão",

            cardExpiry:
                "Validade",

            cardCvv:
                "CVV",

            selectInstallments:
                "Escolha as parcelas",

            oneTime:
                "1x",

            summary:
                "Resumo da compra",

            subtotal:
                "Subtotal",

            shipping:
                "Frete",

            total:
                "Total",

            finish:
                "Continuar para pagamento",

            back:
                "Voltar ao carrinho",

            secure:
                "Pagamento protegido",

            paymentMessage:
                "O processamento do pagamento será realizado com segurança pelo sistema de pagamento.",

            pixMessage:
                "Após confirmar, o sistema poderá gerar o QR Code e o código Pix.",

            boletoMessage:
                "Após confirmar, o sistema poderá gerar o boleto para pagamento.",

            cardMessage:
                "Informe os dados do cartão e escolha a quantidade de parcelas.",

            required:
                "Preencha todos os campos obrigatórios.",

            invalidCpf:
                "Digite um CPF válido.",

            invalidCard:
                "Confira os dados do cartão.",

            emptyCart:
                "Seu carrinho está vazio.",

            loginRequired:
                "Entre na sua conta para continuar.",

            success:
                "Pedido preparado com sucesso."
        },


        login: {

            enter:
                "Entrar",

            tag:
                "ÁREA DO CLIENTE",

            title:
                "Bem-vindo de volta.",

            description:
                "Entre na sua conta para acompanhar seus projetos e solicitações.",

            email:
                "E-mail",

            emailPlaceholder:
                "seu@email.com",

            password:
                "Senha",

            passwordPlaceholder:
                "Digite sua senha",

            remember:
                "Lembrar de mim",

            forgot:
                "Esqueci minha senha",

            submit:
                "Entrar",

            noAccount:
                "Ainda não possui uma conta?",

            create:
                "Criar conta",

            success:
                "Login realizado com sucesso!",

            loading:
                "Entrando...",

            invalid:
                "E-mail ou senha incorretos.",

            required:
                "Preencha o e-mail e a senha.",

            server:
                "Erro no servidor.",

            connection:
                "Não foi possível conectar ao servidor."
        },


        config: {

            back:
                "Voltar",

            tag:
                "MINHA CONTA",

            title:
                "Configurações",

            description:
                "Gerencie os dados e as preferências da sua conta GYAMAX.",

            saved:
                "Alterações salvas com sucesso.",

            accountData:
                "Dados da conta",

            name:
                "Nome",

            email:
                "E-mail",

            security:
                "Segurança",

            newPassword:
                "Nova senha",

            confirmPassword:
                "Confirmar nova senha",

            passwordPlaceholder:
                "Deixe vazio para não alterar",

            confirmPasswordPlaceholder:
                "Repita a nova senha",

            preferences:
                "Preferências",

            language:
                "Idioma",

            languageDescription:
                "Escolha o idioma utilizado no site.",

            notifications:
                "Notificações",

            notificationsDescription:
                "Receba avisos e novidades da GYAMAX.",

            appearance:
                "Aparência",

            appearanceDescription:
                "Escolha como o site deve aparecer para você.",

            save:
                "Salvar alterações",

            logout:
                "Sair da conta"
        },


        language: {

            portuguese:
                "Português",

            english:
                "English",

            spanish:
                "Español"
        },


        appearance: {

            dark:
                "Escuro",

            light:
                "Claro",

            auto:
                "Automático"
        },


        errors: {

            required:
                "Preencha todos os campos obrigatórios.",

            invalidEmail:
                "Digite um e-mail válido.",

            emailExists:
                "Este e-mail já está cadastrado.",

            passwordLength:
                "A senha precisa ter pelo menos 6 caracteres.",

            passwordMismatch:
                "As senhas não coincidem.",

            invalidLogin:
                "E-mail ou senha incorretos.",

            notLogged:
                "Você precisa estar logado.",

            server:
                "Ocorreu um erro no servidor."
        }
    },

    /* =========================================================
       ENGLISH
    ========================================================= */

    "en": {

        page: {

            index:
                "GYAMAX | 3D Printing & Manufacturing",

            login:
                "GYAMAX | Sign in",

            cadastro:
                "GYAMAX | Create account",

            configuracoes:
                "GYAMAX | Settings",

            loja:
                "GYAMAX | Store",

            carrinho:
                "GYAMAX | Cart",

            checkout:
                "GYAMAX | Checkout"
        },


        common: {

            or:
                "or",

            backHome:
                "← Back to website"
        },


        nav: {

            home:
                "Home",

            services:
                "Services",

            process:
                "How it works",

            projects:
                "Projects",

            store:
                "Store",

            about:
                "About",

            review:
                "Review"
        },


        hero: {

            tag:
                "3D PRINTING & MANUFACTURING",

            title:
                "Your idea.",

            titleSpan:
                "Our technology.",

            description:
                "We turn ideas, projects and needs into real parts through 3D printing and custom manufacturing.",

            projects:
                "View projects"
        },


        services: {

            tag:
                "WHAT WE DO",

            title:
                "Solutions that take shape.",

            description:
                "From the idea to the final part, GYAMAX transforms digital projects into real objects."
        },


        service: {

            1: {

                label:
                    "MANUFACTURING",

                title:
                    "3D Printing",

                description:
                    "We transform digital models into physical parts with precision and quality."
            },

            2: {

                label:
                    "CUSTOM",

                title:
                    "Custom parts",

                description:
                    "We create parts designed according to the needs of each project."
            },

            3: {

                label:
                    "DEVELOPMENT",

                title:
                    "Prototyping",

                description:
                    "Bring your ideas to life by creating prototypes to test, adjust and improve projects."
            },

            4: {

                label:
                    "REPLACEMENT",

                title:
                    "Replacement parts",

                description:
                    "We reproduce broken, old or hard-to-find parts."
            }
        },


        process: {

            tag:
                "HOW IT WORKS",

            title:
                "From project to reality.",

            1: {

                title:
                    "You send it",

                description:
                    "Send us your 3D model or explain what you need."
            },

            2: {

                title:
                    "We analyze",

                description:
                    "We evaluate the project, material, size and quantity."
            },

            3: {

                title:
                    "We produce",

                description:
                    "After approval, your part goes into production."
            },

            4: {

                title:
                    "You receive it",

                description:
                    "Your finished part, produced especially for you."
            }
        },


        projects: {

            tag:
                "PROJECTS",

            title:
                "Made to leave the screen.",

            description:
                "Soon, some of the projects produced by GYAMAX will be featured here.",

            project1:
                "PROJECT 01",

            project2:
                "PROJECT 02",

            project3:
                "PROJECT 03"
        },


        about: {

            tag:
                "ABOUT GYAMAX",

            title:
                "Technology to transform ideas.",

            text1:
                "GYAMAX was created with the goal of transforming digital projects into physical solutions.",

            text2:
                "We work with 3D printing and custom manufacturing to create functional parts, prototypes and made-to-measure products.",

            button:
                "Talk to GYAMAX"
        },


        quote: {

            tag:
                "LET'S CREATE?",

            title:
                "Have an idea?",

            titleSpan:
                "Let's bring it to life.",

            description:
                "Contact GYAMAX and request your quote.",

            request:
                "Request a quote"
        },


        footer: {

            description:
                "3D Printing & Manufacturing",

            rights:
                "All rights reserved."
        },


        store: {

            tag:
                "GYAMAX STORE",

            title:
                "Ready-made models ready to take shape.",

            description:
                "Find ready-made GYAMAX models and products with fixed prices.",

            productsTitle:
                "Products",

            productsDescription:
                "Choose the product you want to buy.",

            preview:
                "Product preview",

            categoryModel:
                "MODEL",

            addToCart:
                "Add",

            cart:
                "Cart",

            ctaTag:
                "DIDN'T FIND WHAT YOU NEED?",

            ctaTitle:
                "Need something custom?",

            ctaDescription:
                "GYAMAX also creates custom parts and projects.",

            ctaButton:
                "Request a quote"
        },


        product: {

            1: {

                name:
                    "GYAMAX Model 01",

                description:
                    "Ready-to-print model developed by GYAMAX."
            },

            2: {

                name:
                    "GYAMAX Model 02",

                description:
                    "Ready-to-print model with detailed finishing."
            },

            3: {

                name:
                    "GYAMAX Model 03",

                description:
                    "Model ready for production and printing."
            }
        },


        cart: {

            tag:
                "YOUR CART",

            title:
                "Shopping cart",

            description:
                "Review your products before completing your purchase.",

            emptyTitle:
                "Your cart is empty.",

            emptyDescription:
                "Add a product from the store to get started.",

            goStore:
                "Go to store",

            summary:
                "Order summary",

            subtotal:
                "Subtotal",

            shipping:
                "Shipping",

            shippingSoon:
                "To be calculated",

            total:
                "Total",

            checkout:
                "Checkout",

            continueShopping:
                "Continue shopping",

            remove:
                "Remove",

            decrease:
                "Decrease quantity",

            increase:
                "Increase quantity",

            quantity:
                "Quantity",

            added:
                "Product added to cart.",

            clear:
                "Clear cart",

            demoCheckout:
                "Checkout will be connected to the payment system in the next step."
        },


        checkout: {

            tag:
                "CHECKOUT",

            title:
                "Complete your purchase",

            description:
                "Review your information, choose a payment method and complete your order.",

            customer:
                "Your information",

            name:
                "Full name",

            email:
                "Email",

            cpf:
                "Tax ID",

            payment:
                "Payment method",

            card:
                "Card",

            pix:
                "Pix",

            boleto:
                "Bank slip",

            installments:
                "Installments",

            cashPayment:
                "One-time payment",

            cardNumber:
                "Card number",

            cardName:
                "Name on card",

            cardExpiry:
                "Expiration",

            cardCvv:
                "CVV",

            selectInstallments:
                "Choose installments",

            oneTime:
                "1x",

            summary:
                "Order summary",

            subtotal:
                "Subtotal",

            shipping:
                "Shipping",

            total:
                "Total",

            finish:
                "Continue to payment",

            back:
                "Back to cart",

            secure:
                "Secure payment",

            paymentMessage:
                "Payment processing will be handled securely by the payment system.",

            pixMessage:
                "After confirmation, the system can generate the Pix QR Code and copy-and-paste code.",

            boletoMessage:
                "After confirmation, the system can generate the bank slip.",

            cardMessage:
                "Enter your card details and choose the number of installments.",

            required:
                "Fill in all required fields.",

            invalidCpf:
                "Enter a valid tax ID.",

            invalidCard:
                "Check your card details.",

            emptyCart:
                "Your cart is empty.",

            loginRequired:
                "Sign in to continue.",

            success:
                "Order prepared successfully."
        },


        login: {

            enter:
                "Sign in",

            tag:
                "CUSTOMER AREA",

            title:
                "Welcome back.",

            description:
                "Sign in to your account to follow your projects and requests.",

            email:
                "Email",

            emailPlaceholder:
                "you@email.com",

            password:
                "Password",

            passwordPlaceholder:
                "Enter your password",

            remember:
                "Remember me",

            forgot:
                "Forgot my password",

            submit:
                "Sign in",

            noAccount:
                "Don't have an account yet?",

            create:
                "Create account",

            success:
                "Login successful!",

            loading:
                "Signing in...",

            invalid:
                "Incorrect email or password.",

            required:
                "Fill in your email and password.",

            server:
                "Server error.",

            connection:
                "Could not connect to the server."
        },


        config: {

            back:
                "Back",

            tag:
                "MY ACCOUNT",

            title:
                "Settings",

            description:
                "Manage your GYAMAX account information and preferences.",

            saved:
                "Changes saved successfully.",

            accountData:
                "Account information",

            name:
                "Name",

            email:
                "Email",

            security:
                "Security",

            newPassword:
                "New password",

            confirmPassword:
                "Confirm new password",

            passwordPlaceholder:
                "Leave empty to keep current password",

            confirmPasswordPlaceholder:
                "Repeat the new password",

            preferences:
                "Preferences",

            language:
                "Language",

            languageDescription:
                "Choose the language used on the website.",

            notifications:
                "Notifications",

            notificationsDescription:
                "Receive GYAMAX notifications and news.",

            appearance:
                "Appearance",

            appearanceDescription:
                "Choose how the website should appear to you.",

            save:
                "Save changes",

            logout:
                "Log out"
        },


        language: {

            portuguese:
                "Português",

            english:
                "English",

            spanish:
                "Español"
        },


        appearance: {

            dark:
                "Dark",

            light:
                "Light",

            auto:
                "Automatic"
        },


        errors: {

            required:
                "Please fill in all required fields.",

            invalidEmail:
                "Enter a valid email address.",

            emailExists:
                "This email is already registered.",

            passwordLength:
                "The password must contain at least 6 characters.",

            passwordMismatch:
                "The passwords do not match.",

            invalidLogin:
                "Incorrect email or password.",

            notLogged:
                "You must be logged in.",

            server:
                "A server error occurred."
        }
    },


    /* =========================================================
       ESPAÑOL
    ========================================================= */

    "es": {

        page: {

            index:
                "GYAMAX | Impresión 3D y Fabricación",

            login:
                "GYAMAX | Iniciar sesión",

            cadastro:
                "GYAMAX | Crear cuenta",

            configuracoes:
                "GYAMAX | Configuración",

            loja:
                "GYAMAX | Tienda",

            carrinho:
                "GYAMAX | Carrito",

            checkout:
                "GYAMAX | Finalizar compra"
        },


        common: {

            or:
                "o",

            backHome:
                "← Volver al sitio"
        },


        nav: {

            home:
                "Inicio",

            services:
                "Servicios",

            process:
                "Cómo funciona",

            projects:
                "Proyectos",

            store:
                "Tienda",

            about:
                "Nosotros",

            review:
                "Reseñas"
        },


        hero: {

            tag:
                "IMPRESIÓN 3D Y FABRICACIÓN",

            title:
                "Tu idea.",

            titleSpan:
                "Nuestra tecnología.",

            description:
                "Transformamos ideas, proyectos y necesidades en piezas reales mediante impresión 3D y fabricación personalizada.",

            projects:
                "Ver proyectos"
        },


        services: {

            tag:
                "LO QUE HACEMOS",

            title:
                "Soluciones que cobran forma.",

            description:
                "Desde la idea hasta la pieza final, GYAMAX transforma proyectos digitales en objetos reales."
        },


        service: {

            1: {

                label:
                    "FABRICACIÓN",

                title:
                    "Impresión 3D",

                description:
                    "Transformamos modelos digitales en piezas físicas con precisión y calidad."
            },

            2: {

                label:
                    "A MEDIDA",

                title:
                    "Piezas personalizadas",

                description:
                    "Creamos piezas diseñadas de acuerdo con las necesidades de cada proyecto."
            },

            3: {

                label:
                    "DESARROLLO",

                title:
                    "Prototipado",

                description:
                    "Da vida a tus ideas creando prototipos para probar, ajustar y mejorar tus proyectos."
            },

            4: {

                label:
                    "REPOSICIÓN",

                title:
                    "Piezas de reemplazo",

                description:
                    "Reproducimos piezas rotas, antiguas o difíciles de encontrar."
            }
        },


        process: {

            tag:
                "CÓMO FUNCIONA",

            title:
                "Del proyecto a la realidad.",

            1: {

                title:
                    "Tú envías",

                description:
                    "Envía tu modelo 3D o explica lo que necesitas."
            },

            2: {

                title:
                    "Analizamos",

                description:
                    "Evaluamos el proyecto, material, tamaño y cantidad."
            },

            3: {

                title:
                    "Producimos",

                description:
                    "Después de la aprobación, tu pieza entra en producción."
            },

            4: {

                title:
                    "Tú recibes",

                description:
                    "Tu pieza terminada, producida especialmente para ti."
            }
        },


        projects: {

            tag:
                "PROYECTOS",

            title:
                "Hecho para salir de la pantalla.",

            description:
                "Próximamente, algunos de los proyectos producidos por GYAMAX estarán aquí.",

            project1:
                "PROYECTO 01",

            project2:
                "PROYECTO 02",

            project3:
                "PROYECTO 03"
        },


        about: {

            tag:
                "SOBRE GYAMAX",

            title:
                "Tecnología para transformar ideas.",

            text1:
                "GYAMAX nació con el objetivo de transformar proyectos digitales en soluciones físicas.",

            text2:
                "Trabajamos con impresión 3D y fabricación personalizada para crear piezas funcionales, prototipos y productos a medida.",

            button:
                "Habla con GYAMAX"
        },


        quote: {

            tag:
                "¿VAMOS A CREAR?",

            title:
                "¿Tienes una idea?",

            titleSpan:
                "Vamos a hacerla realidad.",

            description:
                "Ponte en contacto con GYAMAX y solicita tu presupuesto.",

            request:
                "Solicitar presupuesto"
        },


        footer: {

            description:
                "Impresión 3D y Fabricación",

            rights:
                "Todos los derechos reservados."
        },


        store: {

            tag:
                "TIENDA GYAMAX",

            title:
                "Modelos listos para tomar forma.",

            description:
                "Encuentra modelos y productos listos de GYAMAX con precio fijo.",

            productsTitle:
                "Productos",

            productsDescription:
                "Elige el producto que deseas comprar.",

            preview:
                "Vista previa del producto",

            categoryModel:
                "MODELO",

            addToCart:
                "Añadir",

            cart:
                "Carrito",

            ctaTag:
                "¿NO ENCONTRASTE LO QUE BUSCAS?",

            ctaTitle:
                "¿Necesitas algo personalizado?",

            ctaDescription:
                "GYAMAX también crea piezas y proyectos personalizados.",

            ctaButton:
                "Solicitar presupuesto"
        },


        product: {

            1: {

                name:
                    "Modelo GYAMAX 01",

                description:
                    "Modelo listo para imprimir desarrollado por GYAMAX."
            },

            2: {

                name:
                    "Modelo GYAMAX 02",

                description:
                    "Modelo listo para imprimir con acabado detallado."
            },

            3: {

                name:
                    "Modelo GYAMAX 03",

                description:
                    "Modelo listo para producción e impresión."
            }
        },


        cart: {

            tag:
                "TU CARRITO",

            title:
                "Carrito de compras",

            description:
                "Revisa tus productos antes de finalizar la compra.",

            emptyTitle:
                "Tu carrito está vacío.",

            emptyDescription:
                "Añade un producto de la tienda para comenzar.",

            goStore:
                "Ir a la tienda",

            summary:
                "Resumen del pedido",

            subtotal:
                "Subtotal",

            shipping:
                "Envío",

            shippingSoon:
                "Por calcular",

            total:
                "Total",

            checkout:
                "Finalizar compra",

            continueShopping:
                "Seguir comprando",

            remove:
                "Eliminar",

            decrease:
                "Disminuir cantidad",

            increase:
                "Aumentar cantidad",

            quantity:
                "Cantidad",

            added:
                "Producto añadido al carrito.",

            clear:
                "Vaciar carrito",

            demoCheckout:
                "El checkout se conectará al sistema de pago en la próxima etapa."
        },


        checkout: {

            tag:
                "FINALIZACIÓN",

            title:
                "Finalizar compra",

            description:
                "Revisa tus datos, elige el método de pago y finaliza tu pedido.",

            customer:
                "Tus datos",

            name:
                "Nombre completo",

            email:
                "Correo electrónico",

            cpf:
                "CPF",

            payment:
                "Forma de pago",

            card:
                "Tarjeta",

            pix:
                "Pix",

            boleto:
                "Boleto",

            installments:
                "Cuotas",

            cashPayment:
                "Pago al contado",

            cardNumber:
                "Número de tarjeta",

            cardName:
                "Nombre en la tarjeta",

            cardExpiry:
                "Vencimiento",

            cardCvv:
                "CVV",

            selectInstallments:
                "Elige las cuotas",

            oneTime:
                "1x",

            summary:
                "Resumen de compra",

            subtotal:
                "Subtotal",

            shipping:
                "Envío",

            total:
                "Total",

            finish:
                "Continuar al pago",

            back:
                "Volver al carrito",

            secure:
                "Pago seguro",

            paymentMessage:
                "El procesamiento del pago será realizado de forma segura por el sistema de pago.",

            pixMessage:
                "Después de confirmar, el sistema podrá generar el código QR y el código Pix.",

            boletoMessage:
                "Después de confirmar, el sistema podrá generar el boleto.",

            cardMessage:
                "Introduce los datos de tu tarjeta y elige el número de cuotas.",

            required:
                "Completa todos los campos obligatorios.",

            invalidCpf:
                "Introduce un CPF válido.",

            invalidCard:
                "Comprueba los datos de la tarjeta.",

            emptyCart:
                "Tu carrito está vacío.",

            loginRequired:
                "Inicia sesión para continuar.",

            success:
                "Pedido preparado correctamente."
        },


        login: {

            enter:
                "Iniciar sesión",

            tag:
                "ÁREA DEL CLIENTE",

            title:
                "Bienvenido de nuevo.",

            description:
                "Inicia sesión en tu cuenta para seguir tus proyectos y solicitudes.",

            email:
                "Correo electrónico",

            emailPlaceholder:
                "tu@email.com",

            password:
                "Contraseña",

            passwordPlaceholder:
                "Introduce tu contraseña",

            remember:
                "Recordarme",

            forgot:
                "Olvidé mi contraseña",

            submit:
                "Iniciar sesión",

            noAccount:
                "¿Aún no tienes una cuenta?",

            create:
                "Crear cuenta",

            success:
                "¡Inicio de sesión correcto!",

            loading:
                "Iniciando sesión...",

            invalid:
                "Correo electrónico o contraseña incorrectos.",

            required:
                "Completa el correo electrónico y la contraseña.",

            server:
                "Error del servidor.",

            connection:
                "No se pudo conectar con el servidor."
        },


        config: {

            back:
                "Volver",

            tag:
                "MI CUENTA",

            title:
                "Configuración",

            description:
                "Administra los datos y las preferencias de tu cuenta GYAMAX.",

            saved:
                "Cambios guardados correctamente.",

            accountData:
                "Datos de la cuenta",

            name:
                "Nombre",

            email:
                "Correo electrónico",

            security:
                "Seguridad",

            newPassword:
                "Nueva contraseña",

            confirmPassword:
                "Confirmar nueva contraseña",

            passwordPlaceholder:
                "Déjalo vacío para no cambiarla",

            confirmPasswordPlaceholder:
                "Repite la nueva contraseña",

            preferences:
                "Preferencias",

            language:
                "Idioma",

            languageDescription:
                "Elige el idioma utilizado en el sitio.",

            notifications:
                "Notificaciones",

            notificationsDescription:
                "Recibe avisos y novedades de GYAMAX.",

            appearance:
                "Apariencia",

            appearanceDescription:
                "Elige cómo debe aparecer el sitio.",

            save:
                "Guardar cambios",

            logout:
                "Cerrar sesión"
        },


        language: {

            portuguese:
                "Português",

            english:
                "English",

            spanish:
                "Español"
        },


        appearance: {

            dark:
                "Oscuro",

            light:
                "Claro",

            auto:
                "Automático"
        },


        errors: {

            required:
                "Completa todos los campos obligatorios.",

            invalidEmail:
                "Introduce un correo electrónico válido.",

            emailExists:
                "Este correo electrónico ya está registrado.",

            passwordLength:
                "La contraseña debe tener al menos 6 caracteres.",

            passwordMismatch:
                "Las contraseñas no coinciden.",

            invalidLogin:
                "Correo electrónico o contraseña incorrectos.",

            notLogged:
                "Debes iniciar sesión.",

            server:
                "Ocurrió un error en el servidor."
        }
    }
};


/* =========================================================
   IDIOMAS
========================================================= */

const IDIOMAS_PERMITIDOS = [
    "pt-BR",
    "en",
    "es"
];


function idiomaValido(
    idioma
) {

    return IDIOMAS_PERMITIDOS.includes(
        idioma
    );
}


function obterIdiomaLocal() {

    const salvo =
        localStorage.getItem(
            "gyamax_idioma"
        );

    return idiomaValido(salvo)
        ? salvo
        : "pt-BR";
}


function obterIdiomaAtual() {

    if (
        usuarioAtual &&
        idiomaValido(
            usuarioAtual.idioma
        )
    ) {

        return usuarioAtual.idioma;
    }

    return obterIdiomaLocal();
}


/* =========================================================
   BUSCAR TRADUÇÃO
========================================================= */

function obterTexto(
    chave,
    idioma = obterIdiomaAtual()
) {

    if (
        !chave ||
        !idiomaValido(idioma)
    ) {

        return chave;
    }

    const partes =
        String(chave).split(".");

    let objeto =
        traducoes[idioma];

    for (
        const parte of partes
    ) {

        if (
            objeto === null ||
            objeto === undefined ||
            !Object.prototype.hasOwnProperty.call(
                objeto,
                parte
            )
        ) {

            return chave;
        }

        objeto =
            objeto[parte];
    }

    return objeto;
}


/* =========================================================
   PÁGINA ATUAL
========================================================= */

function obterNomePagina() {

    let caminho =
        window.location.pathname
            .toLowerCase()
            .split("/")
            .pop();

    if (!caminho) {
        caminho = "index.html";
    }

    if (
        caminho === "" ||
        caminho === "index" ||
        caminho === "index.html"
    ) {

        return "index";
    }

    if (
        caminho === "login" ||
        caminho === "login.html"
    ) {

        return "login";
    }

    if (
        caminho === "cadastro" ||
        caminho === "cadastro.html" ||
        caminho === "registrar" ||
        caminho === "registrar.html"
    ) {

        return "cadastro";
    }

    if (
        caminho === "configuracoes" ||
        caminho === "configuracoes.html"
    ) {

        return "configuracoes";
    }

    if (
        caminho === "loja" ||
        caminho === "loja.html"
    ) {

        return "loja";
    }

    if (
        caminho === "carrinho" ||
        caminho === "carrinho.html"
    ) {

        return "carrinho";
    }

    if (
        caminho === "checkout" ||
        caminho === "checkout.html"
    ) {

        return "checkout";
    }

    return "index";
}


/* =========================================================
   TÍTULO
========================================================= */

function atualizarTituloPagina(
    idioma
) {

    const pagina =
        obterNomePagina();

    const titulo =
        traducoes[
            idioma
        ]?.page?.[
            pagina
        ];

    if (titulo) {
        document.title =
            titulo;
    }
}


/* =========================================================
   APLICAR IDIOMA
========================================================= */

function aplicarIdioma(
    idioma
) {

    if (!idiomaValido(idioma)) {
        idioma = "pt-BR";
    }

    document.documentElement.lang =
        idioma;

    atualizarTituloPagina(
        idioma
    );

    document
        .querySelectorAll(
            "[data-i18n]"
        )
        .forEach(
            elemento => {

                const chave =
                    elemento.getAttribute(
                        "data-i18n"
                    );

                const texto =
                    obterTexto(
                        chave,
                        idioma
                    );

                if (
                    texto !== chave &&
                    typeof texto === "string"
                ) {

                    elemento.textContent =
                        texto;
                }
            }
        );

    document
        .querySelectorAll(
            "[data-i18n-placeholder]"
        )
        .forEach(
            elemento => {

                const chave =
                    elemento.getAttribute(
                        "data-i18n-placeholder"
                    );

                const texto =
                    obterTexto(
                        chave,
                        idioma
                    );

                if (
                    texto !== chave &&
                    typeof texto === "string"
                ) {

                    elemento.placeholder =
                        texto;
                }
            }
        );

    document
        .querySelectorAll(
            "[data-i18n-title]"
        )
        .forEach(
            elemento => {

                const chave =
                    elemento.getAttribute(
                        "data-i18n-title"
                    );

                const texto =
                    obterTexto(
                        chave,
                        idioma
                    );

                if (
                    texto !== chave &&
                    typeof texto === "string"
                ) {

                    elemento.title =
                        texto;
                }
            }
        );

    document
        .querySelectorAll(
            "[data-i18n-aria-label]"
        )
        .forEach(
            elemento => {

                const chave =
                    elemento.getAttribute(
                        "data-i18n-aria-label"
                    );

                const texto =
                    obterTexto(
                        chave,
                        idioma
                    );

                if (
                    texto !== chave &&
                    typeof texto === "string"
                ) {

                    elemento.setAttribute(
                        "aria-label",
                        texto
                    );
                }
            }
        );

    localStorage.setItem(
        "gyamax_idioma",
        idioma
    );

    const select =
        document.getElementById(
            "idioma"
        );

    if (select) {
        select.value =
            idioma;
    }

    if (
        obterNomePagina() ===
        "carrinho"
    ) {
        renderizarCarrinho();
    }

    if (
        obterNomePagina() ===
        "checkout"
    ) {
        atualizarCheckout();
    }

    atualizarContadorCarrinho();
}


/* =========================================================
   APARÊNCIA
========================================================= */

function aplicarAparencia(
    aparencia
) {

    const permitidas = [
        "escuro",
        "claro",
        "automatico"
    ];

    if (
        !permitidas.includes(
            aparencia
        )
    ) {

        aparencia =
            "escuro";
    }

    document.documentElement
        .setAttribute(
            "data-theme",
            aparencia
        );

    if (document.body) {

        document.body.setAttribute(
            "data-theme",
            aparencia
        );
    }

    localStorage.setItem(
        "gyamax_aparencia",
        aparencia
    );

    const logo =
        document.getElementById(
            "gyamaxLogo"
        );

    if (logo) {

        if (
            aparencia ===
            "claro"
        ) {

            logo.src =
                "/img/GYAMAX-preta.png";

        } else if (
            aparencia ===
            "escuro"
        ) {

            logo.src =
                "/img/GYAMAX.png";

        } else {

            const claro =
                window.matchMedia &&
                window.matchMedia(
                    "(prefers-color-scheme: light)"
                ).matches;

            logo.src =
                claro
                    ? "/img/GYAMAX-preta.png"
                    : "/img/GYAMAX.png";
        }
    }

    const select =
        document.getElementById(
            "aparencia"
        );

    if (select) {
        select.value =
            aparencia;
    }
}


/* =========================================================
   AVATAR
========================================================= */

function configurarEstiloAvatarHeader(
    avatar
) {

    if (!avatar) {
        return;
    }

    const tamanho = 42;

    avatar.style.width =
        `${tamanho}px`;

    avatar.style.height =
        `${tamanho}px`;

    avatar.style.minWidth =
        `${tamanho}px`;

    avatar.style.minHeight =
        `${tamanho}px`;

    avatar.style.maxWidth =
        `${tamanho}px`;

    avatar.style.maxHeight =
        `${tamanho}px`;

    avatar.style.position =
        "relative";

    avatar.style.display =
        "flex";

    avatar.style.alignItems =
        "center";

    avatar.style.justifyContent =
        "center";

    avatar.style.overflow =
        "hidden";

    avatar.style.borderRadius =
        "50%";

    avatar.style.padding =
        "0";

    avatar.style.margin =
        "0";

    avatar.style.boxSizing =
        "border-box";

    avatar.style.flexShrink =
        "0";

    avatar.style.background =
        "#ff6a00";

    avatar.style.border =
        "2px solid #ff6a00";

    avatar.style.color =
        "#ffffff";

    avatar.style.textDecoration =
        "none";

    avatar.style.lineHeight =
        "1";

    const letra =
        avatar.querySelector(
            ".profile-avatar-letter"
        );

    if (letra) {

        letra.style.position =
            "absolute";

        letra.style.inset =
            "0";

        letra.style.width =
            "100%";

        letra.style.height =
            "100%";

        letra.style.display =
            "flex";

        letra.style.alignItems =
            "center";

        letra.style.justifyContent =
            "center";

        letra.style.background =
            "transparent";

        letra.style.color =
            "#ffffff";

        letra.style.fontSize =
            "17px";

        letra.style.fontWeight =
            "700";

        letra.style.lineHeight =
            "1";

        letra.style.textAlign =
            "center";

        letra.style.zIndex =
            "2";

        letra.style.pointerEvents =
            "none";

        letra.style.userSelect =
            "none";
    }
}


/* =========================================================
   ÁREA DA CONTA
========================================================= */

function renderizarAreaConta(
    area
) {

    if (!area) {
        return;
    }

    if (!usuarioAtual) {

        area.innerHTML = `
            <a
                href="/login.html"
                class="btn btn-small"
                data-i18n="login.enter"
            >
                Entrar
            </a>
        `;

        aplicarIdioma(
            obterIdiomaAtual()
        );

        return;
    }

    const nome =
        String(
            usuarioAtual.nome ||
            "Usuário"
        ).trim();

    const inicial =
        nome
            .charAt(0)
            .toUpperCase();

    area.innerHTML = `
        <a
            href="/configuracoes.html"
            class="gyamax-header-avatar"
            data-profile-avatar
            data-i18n-title="config.title"
            data-i18n-aria-label="config.title"
            aria-label="Configurações"
            title="Configurações"
        >
            <span class="profile-avatar-letter">
                ${escaparHTMLJS(inicial)}
            </span>
        </a>
    `;

    const avatar =
        area.querySelector(
            ".gyamax-header-avatar"
        );

    configurarEstiloAvatarHeader(
        avatar
    );

    aplicarIdioma(
        obterIdiomaAtual()
    );
}


/* =========================================================
   ATUALIZAR AVATAR
========================================================= */

function atualizarAvatares() {

    if (!usuarioAtual) {
        return;
    }

    const nome =
        String(
            usuarioAtual.nome ||
            "Usuário"
        ).trim();

    const inicial =
        nome
            .charAt(0)
            .toUpperCase();

    document
        .querySelectorAll(
            "#accountArea .gyamax-header-avatar, #accountArea [data-profile-avatar]"
        )
        .forEach(
            avatar => {

                avatar
                    .querySelectorAll(
                        "img, svg"
                    )
                    .forEach(
                        elemento => {
                            elemento.remove();
                        }
                    );

                let letra =
                    avatar.querySelector(
                        ".profile-avatar-letter"
                    );

                if (!letra) {

                    letra =
                        document.createElement(
                            "span"
                        );

                    letra.className =
                        "profile-avatar-letter";

                    avatar.appendChild(
                        letra
                    );
                }

                letra.textContent =
                    inicial;

                configurarEstiloAvatarHeader(
                    avatar
                );
            }
        );
}


/* =========================================================
   INTERFACE LOGIN
========================================================= */

function atualizarInterfaceLogin() {

    const area =
        document.getElementById(
            "accountArea"
        );

    if (area) {

        renderizarAreaConta(
            area
        );

    }

    atualizarAvatares();

}


/* =========================================================
   LINKS DA CONTA
========================================================= */

function atualizarLinksConta() {

    if (!usuarioAtual) {
        return;
    }

    document
        .querySelectorAll(
            "[data-account-name]"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuarioAtual.nome ||
                    obterTexto(
                        "config.title"
                    );

            }
        );


    document
        .querySelectorAll(
            "[data-account-email]"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    usuarioAtual.email ||
                    "";

            }
        );

}


/* =========================================================
   ADMINISTRADOR
========================================================= */

const URL_GERENCIAMENTO =
    "/admin.html";


function usuarioEhAdministrador(
    usuario = usuarioAtual
) {

    return Boolean(
        usuario &&
        Number(
            usuario.admin
        ) === 1
    );

}


function redirecionarAdministrador() {

    if (
        !usuarioEhAdministrador()
    ) {

        return false;

    }


    const paginaAtual =
        window.location.pathname
            .toLowerCase();


    const paginaAdmin =
        URL_GERENCIAMENTO
            .toLowerCase();


    /*
     * Não redireciona novamente
     * se já estiver no gerenciamento.
     */

    if (
        paginaAtual ===
        paginaAdmin
    ) {

        return false;

    }


    window.location.href =
        URL_GERENCIAMENTO;


    return true;

}


/* =========================================================
   STATUS LOGIN
========================================================= */

async function verificarLogin() {

    try {

        const resposta =
            await fetch(
                "/status-login",
                {

                    method:
                        "GET",

                    credentials:
                        "same-origin",

                    cache:
                        "no-store",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (!resposta.ok) {

            usuarioAtual =
                null;

            atualizarInterfaceLogin();

            return null;

        }


        const dados =
            await resposta.json();


        if (
            dados &&
            dados.logado &&
            dados.usuario
        ) {

            usuarioAtual =
                dados.usuario;


            /*
             * Garante que admin sempre
             * seja tratado como 0 ou 1.
             */

            usuarioAtual.admin =
                Number(
                    usuarioAtual.admin
                ) === 1
                    ? 1
                    : 0;


            if (
                !idiomaValido(
                    usuarioAtual.idioma
                )
            ) {

                usuarioAtual.idioma =
                    "pt-BR";

            }


            aplicarIdioma(
                usuarioAtual.idioma
            );


            aplicarAparencia(
                usuarioAtual.aparencia ||
                "escuro"
            );


            atualizarInterfaceLogin();


            /*
             * Caso a conta administradora
             * esteja na tela de login,
             * encaminha para o gerenciamento.
             */

            const paginaAtual =
                window.location.pathname
                    .toLowerCase();


            const paginaAdmin =
                URL_GERENCIAMENTO
                    .toLowerCase();


            const estaNoAdmin =
                paginaAtual ===
                paginaAdmin;


            const estaNoLogin =
                paginaAtual ===
                    "/login" ||
                paginaAtual.endsWith(
                    "/login.html"
                );


            if (
                usuarioEhAdministrador() &&
                estaNoLogin &&
                !estaNoAdmin
            ) {

                redirecionarAdministrador();

                return usuarioAtual;

            }


            return usuarioAtual;

        }


        usuarioAtual =
            null;


        atualizarInterfaceLogin();


        return null;

    } catch (erro) {

        console.error(
            "Erro verificando sessão:",
            erro
        );


        usuarioAtual =
            null;


        atualizarInterfaceLogin();


        return null;

    }

}


/* =========================================================
   LOGIN
========================================================= */

function configurarLogin() {

    const form =
        document.getElementById(
            "formLogin"
        ) ||
        document.getElementById(
            "loginForm"
        );


    if (!form) {

        return;

    }


    if (
        form.dataset.loginConfigurado ===
        "true"
    ) {

        return;

    }


    form.dataset.loginConfigurado =
        "true";


    form.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            const botao =
                form.querySelector(
                    'button[type="submit"]'
                );


            const mensagem =
                document.getElementById(
                    "loginMessage"
                );


            const emailInput =
                document.getElementById(
                    "email"
                );


            const senhaInput =
                document.getElementById(
                    "password"
                );


            const email =
                String(
                    emailInput?.value ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const password =
                String(
                    senhaInput?.value ||
                    ""
                );


            if (
                !email ||
                !password
            ) {

                mostrarMensagemLogin(
                    mensagem,
                    obterTexto(
                        "login.required"
                    ),
                    true
                );

                return;

            }


            if (botao) {

                botao.disabled =
                    true;


                botao.dataset.textoOriginal =
                    botao.textContent;


                botao.textContent =
                    obterTexto(
                        "login.loading"
                    );

            }


            try {

                const resposta =
                    await fetch(
                        "/login",
                        {

                            method:
                                "POST",

                            credentials:
                                "same-origin",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email,

                                    password

                                })

                        }
                    );


                let dados = {};


                try {

                    dados =
                        await resposta.json();

                } catch {

                    dados =
                        {};

                }


                if (
                    !resposta.ok ||
                    !dados.sucesso
                ) {

                    const erro =
                        dados.erro ||
                        "invalidLogin";


                    let texto =
                        obterTexto(
                            `errors.${erro}`
                        );


                    if (
                        texto ===
                        `errors.${erro}`
                    ) {

                        texto =
                            obterTexto(
                                "login.invalid"
                            );

                    }


                    mostrarMensagemLogin(
                        mensagem,
                        texto,
                        true
                    );


                    return;

                }


                usuarioAtual =
                    dados.usuario ||
                    null;


                if (usuarioAtual) {

                    /*
                     * Normaliza o administrador
                     * recebido pelo servidor.
                     */

                    usuarioAtual.admin =
                        Number(
                            usuarioAtual.admin
                        ) === 1
                            ? 1
                            : 0;


                    usuarioAtual.idioma =
                        idiomaValido(
                            usuarioAtual.idioma
                        )
                            ? usuarioAtual.idioma
                            : "pt-BR";


                    localStorage.setItem(
                        "gyamax_idioma",
                        usuarioAtual.idioma
                    );


                    localStorage.setItem(
                        "gyamax_aparencia",
                        usuarioAtual.aparencia ||
                        "escuro"
                    );

                }


                aplicarIdioma(
                    obterIdiomaAtual()
                );


                aplicarAparencia(
                    usuarioAtual?.aparencia ||
                    "escuro"
                );


                atualizarInterfaceLogin();


                atualizarLinksConta();


                mostrarMensagemLogin(
                    mensagem,
                    obterTexto(
                        "login.success"
                    ),
                    false
                );


                setTimeout(
                    () => {

                        /*
                         * ADMIN DA GYAMAX
                         * vai para o gerenciamento.
                         */

                        if (
                            usuarioEhAdministrador(
                                usuarioAtual
                            )
                        ) {

                            window.location.href =
                                URL_GERENCIAMENTO;

                            return;

                        }


                        /*
                         * Usuário normal
                         * continua no site.
                         */

                        window.location.href =
                            "/index.html";

                    },
                    250
                );


            } catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );


                mostrarMensagemLogin(
                    mensagem,
                    obterTexto(
                        "login.connection"
                    ),
                    true
                );


            } finally {

                if (botao) {

                    botao.disabled =
                        false;


                    if (
                        botao.dataset
                            .textoOriginal !==
                        undefined
                    ) {

                        botao.textContent =
                            botao.dataset
                                .textoOriginal;

                    }

                }

            }

        }
    );

}
/* =========================================================
   MENSAGEM LOGIN
========================================================= */

function mostrarMensagemLogin(
    elemento,
    texto,
    erro = false
) {

    if (!elemento) {
        return;
    }

    elemento.textContent =
        texto;

    elemento.style.display =
        "block";

    elemento.classList.toggle(
        "erro",
        erro
    );

    elemento.classList.toggle(
        "sucesso",
        !erro
    );

    elemento.classList.add(
        "active"
    );
}


/* =========================================================
   LOGOUT
========================================================= */

function configurarLogout() {

    document
        .querySelectorAll(
            'a[href="/logout"], a[href="logout"], [data-logout]'
        )
        .forEach(
            botao => {

                if (
                    botao.dataset.logoutConfigurado ===
                    "true"
                ) {
                    return;
                }

                botao.dataset.logoutConfigurado =
                    "true";
            }
        );
}


/* =========================================================
   PREENCHER CONFIGURAÇÕES
========================================================= */

function preencherConfiguracoes() {

    if (!usuarioAtual) {
        return;
    }

    const nome =
        document.getElementById("nome");

    const email =
        document.getElementById("email");

    const idioma =
        document.getElementById("idioma");

    const aparencia =
        document.getElementById("aparencia");

    const notificacoes =
        document.getElementById("notificacoes");

    if (nome) {
        nome.value =
            usuarioAtual.nome ||
            "";
    }

    if (email) {
        email.value =
            usuarioAtual.email ||
            "";
    }

    if (idioma) {
        idioma.value =
            idiomaValido(
                usuarioAtual.idioma
            )
                ? usuarioAtual.idioma
                : "pt-BR";
    }

    if (aparencia) {
        aparencia.value =
            usuarioAtual.aparencia ||
            "escuro";
    }

    if (notificacoes) {
        notificacoes.checked =
            Boolean(
                usuarioAtual.notificacoes
            );
    }
}


/* =========================================================
   MENSAGEM CONFIGURAÇÃO
========================================================= */

function mostrarMensagemConfiguracao(
    texto,
    erro = false
) {

    const elemento =
        document.getElementById(
            "mensagemSucesso"
        );

    if (!elemento) {

        alert(texto);

        return;
    }

    elemento.classList.toggle(
        "mensagem-erro",
        erro
    );

    elemento.classList.toggle(
        "mensagem-sucesso",
        !erro
    );

    elemento.innerHTML =
        `
            <span class="check">
                ${erro ? "!" : "✓"}
            </span>

            <span>
                ${escaparHTMLJS(texto)}
            </span>
        `;

    elemento.style.display =
        "flex";

    clearTimeout(
        mostrarMensagemConfiguracao.timer
    );

    mostrarMensagemConfiguracao.timer =
        setTimeout(
            () => {

                elemento.style.display =
                    "none";

            },
            erro ? 5000 : 3500
        );
}


/* =========================================================
   SALVAR CONFIGURAÇÕES
========================================================= */

async function salvarConfiguracoes(
    evento
) {

    evento.preventDefault();

    const formulario =
        document.getElementById(
            "formConfiguracoes"
        );

    if (!formulario) {
        return;
    }

    const dados =
        new FormData(
            formulario
        );

    const selectIdioma =
        document.getElementById(
            "idioma"
        );

    const selectAparencia =
        document.getElementById(
            "aparencia"
        );

    const notificacoes =
        document.getElementById(
            "notificacoes"
        );

    if (selectIdioma) {

        dados.set(
            "idioma",
            selectIdioma.value
        );
    }

    if (selectAparencia) {

        dados.set(
            "aparencia",
            selectAparencia.value
        );
    }

    dados.set(
        "notificacoes",
        notificacoes?.checked
            ? "on"
            : "off"
    );

    try {

        const resposta =
            await fetch(
                "/configuracoes",
                {

                    method:
                        "POST",

                    credentials:
                        "same-origin",

                    cache:
                        "no-store",

                    headers: {

                        "Accept":
                            "application/json"
                    },

                    body:
                        new URLSearchParams(
                            dados
                        )
                }
            );

        let resultado = {};

        try {

            resultado =
                await resposta.json();

        } catch {

            resultado =
                {};
        }

        if (
            !resposta.ok ||
            !resultado.sucesso
        ) {

            const codigo =
                resultado.erro ||
                "server";

            let texto =
                obterTexto(
                    `errors.${codigo}`
                );

            if (
                texto ===
                `errors.${codigo}`
            ) {

                texto =
                    obterTexto(
                        "errors.server"
                    );
            }

            mostrarMensagemConfiguracao(
                texto,
                true
            );

            return;
        }

        usuarioAtual =
            resultado.usuario ||
            usuarioAtual;

        const idiomaFinal =
            idiomaValido(
                usuarioAtual.idioma
            )
                ? usuarioAtual.idioma
                : "pt-BR";

        localStorage.setItem(
            "gyamax_idioma",
            idiomaFinal
        );

        localStorage.setItem(
            "gyamax_aparencia",
            usuarioAtual.aparencia ||
            "escuro"
        );

        aplicarIdioma(
            idiomaFinal
        );

        aplicarAparencia(
            usuarioAtual.aparencia ||
            "escuro"
        );

        preencherConfiguracoes();

        atualizarInterfaceLogin();

        atualizarAvatares();

        mostrarMensagemConfiguracao(
            obterTexto(
                "config.saved"
            ),
            false
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar configurações:",
            erro
        );

        mostrarMensagemConfiguracao(
            obterTexto(
                "errors.server"
            ),
            true
        );
    }
}


/* =========================================================
   PREFERÊNCIAS
========================================================= */

function configurarPreferencias() {

    const idioma =
        document.getElementById(
            "idioma"
        );

    const aparencia =
        document.getElementById(
            "aparencia"
        );

    if (idioma) {

        idioma.addEventListener(
            "change",
            () => {

                if (
                    idiomaValido(
                        idioma.value
                    )
                ) {

                    aplicarIdioma(
                        idioma.value
                    );
                }
            }
        );
    }

    if (aparencia) {

        aparencia.addEventListener(
            "change",
            () => {

                aplicarAparencia(
                    aparencia.value
                );
            }
        );
    }
}


/* =========================================================
   MENU MOBILE
========================================================= */

function configurarMenuMobile() {

    const botao =
        document.getElementById(
            "menuMobile"
        );

    const menu =
        document.querySelector(
            ".menu"
        );

    if (
        !botao ||
        !menu
    ) {
        return;
    }

    if (
        botao.dataset.menuConfigurado ===
        "true"
    ) {
        return;
    }

    botao.dataset.menuConfigurado =
        "true";

    botao.addEventListener(
        "click",
        () => {

            const aberto =
                menu.classList.toggle(
                    "menu-aberto"
                );

            botao.setAttribute(
                "aria-expanded",
                aberto
                    ? "true"
                    : "false"
            );
        }
    );

    menu
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        menu.classList.remove(
                            "menu-aberto"
                        );

                        botao.setAttribute(
                            "aria-expanded",
                            "false"
                        );
                    }
                );
            }
        );
}


/* =========================================================
   CARRINHO
========================================================= */

const CHAVE_CARRINHO =
    "gyamax_carrinho";


function obterCarrinho() {

    try {

        const salvo =
            localStorage.getItem(
                CHAVE_CARRINHO
            );

        if (!salvo) {
            return [];
        }

        const carrinho =
            JSON.parse(
                salvo
            );

        if (!Array.isArray(carrinho)) {
            return [];
        }

        return carrinho
            .filter(
                item => {

                    const id =
                        Number(
                            item?.id
                        );

                    const quantidade =
                        Number(
                            item?.quantidade
                        );

                    return (
                        Number.isInteger(id) &&
                        produtosLoja[id] &&
                        Number.isFinite(quantidade) &&
                        quantidade > 0
                    );
                }
            )
            .map(
                item => ({

                    id:
                        Number(
                            item.id
                        ),

                    quantidade:
                        Math.max(
                            1,
                            Math.floor(
                                Number(
                                    item.quantidade
                                )
                            )
                        )
                })
            );

    } catch (erro) {

        console.error(
            "Erro ao carregar o carrinho:",
            erro
        );

        return [];
    }
}


function salvarCarrinho(
    carrinho
) {

    try {

        localStorage.setItem(
            CHAVE_CARRINHO,
            JSON.stringify(
                carrinho
            )
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar o carrinho:",
            erro
        );
    }

    atualizarContadorCarrinho();
}


function obterQuantidadeTotalCarrinho() {

    return obterCarrinho()
        .reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Number(
                        item.quantidade
                    )
                );

            },
            0
        );
}


function atualizarContadorCarrinho() {

    const total =
        obterQuantidadeTotalCarrinho();

    document
        .querySelectorAll(
            "#cartCount, .store-cart-count"
        )
        .forEach(
            elemento => {

                elemento.textContent =
                    total;

                elemento.setAttribute(
                    "aria-label",
                    `${total} ${obterTexto(
                        "store.cart"
                    )}`
                );
            }
        );
}


function formatarPreco(
    valor
) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {

            style:
                "currency",

            currency:
                "BRL"
        }
    );
}


function obterDadosProduto(
    id
) {

    id =
        Number(
            id
        );


    const produto =
        produtosLoja[id];


    if (!produto) {

        return null;

    }


    return {

        id:
            id,

        nome:
            produto.nome ||
            `Produto ${id}`,

        descricao:
            produto.descricao ||
            "",

        preco:
            Number(
                produto.preco
            ) || 0,

        foto:
            produto.foto ||
            null

    };

}
function adicionarAoCarrinho(
    id,
    quantidade = 1
) {

    id =
        Number(id);

    quantidade =
        Number(quantidade);

    if (
        !produtosLoja[id] ||
        !Number.isFinite(
            quantidade
        ) ||
        quantidade <= 0
    ) {

        return false;
    }

    quantidade =
        Math.floor(
            quantidade
        );

    if (quantidade <= 0) {
        return false;
    }

    const carrinho =
        obterCarrinho();

    const existente =
        carrinho.find(
            item =>
                Number(item.id) ===
                id
        );

    if (existente) {

        existente.quantidade +=
            quantidade;

    } else {

        carrinho.push({

            id:
                id,

            quantidade:
                quantidade
        });
    }

    salvarCarrinho(
        carrinho
    );

    mostrarMensagemCarrinho(
        obterTexto(
            "cart.added"
        )
    );

    return true;
}


function alterarQuantidadeCarrinho(
    id,
    quantidade
) {

    id =
        Number(id);

    quantidade =
        Math.floor(
            Number(
                quantidade
            )
        );

    const carrinho =
        obterCarrinho();

    const item =
        carrinho.find(
            produto =>
                Number(
                    produto.id
                ) === id
        );

    if (!item) {
        return;
    }

    if (
        !Number.isFinite(
            quantidade
        ) ||
        quantidade <= 0
    ) {

        removerDoCarrinho(
            id
        );

        return;
    }

    item.quantidade =
        quantidade;

    salvarCarrinho(
        carrinho
    );

    renderizarCarrinho();
}

async function removerDoCarrinho(
    id
) {

    id =
        Number(id);

    const carrinho =
        obterCarrinho()
            .filter(
                item =>
                    Number(
                        item.id
                    ) !== id
            );

    salvarCarrinho(
        carrinho
    );

    renderizarCarrinho();


    /*
     * Se o carrinho ficou vazio,
     * cancela o pedido pendente
     * vinculado a este carrinho.
     */

    if (
        carrinho.length === 0
    ) {

        const pedidoId =
            localStorage.getItem(
                "gyamax_pedido_pendente"
            );


        if (
            !pedidoId
        ) {

            return;

        }


        try {

            await fetch(
                "/api/pedidos/cancelar-pendente",
                {

                    method:
                        "POST",

                    credentials:
                        "same-origin",

                    headers: {

                        "Content-Type":
                            "application/x-www-form-urlencoded",

                        "Accept":
                            "application/json"

                    },

                    body:
                        new URLSearchParams({
                            pedidoId
                        })

                }
            );

        } catch (erro) {

            console.error(
                "Erro ao cancelar pedido pendente:",
                erro
            );

        }


        localStorage.removeItem(
            "gyamax_pedido_pendente"
        );

    }

}

async function limparCarrinho() {

    const pedidoId =
        localStorage.getItem(
            "gyamax_pedido_pendente"
        );

    salvarCarrinho(
        []
    );

    renderizarCarrinho();


    if (
        !pedidoId
    ) {

        return;

    }


    try {

        await fetch(
            "/api/pedidos/cancelar-pendente",
            {

                method:
                    "POST",

                credentials:
                    "same-origin",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded",

                    "Accept":
                        "application/json"

                },

                body:
                    new URLSearchParams({
                        pedidoId
                    })

            }
        );

    } catch (erro) {

        console.error(
            "Erro ao cancelar pedido pendente:",
            erro
        );

    }


    localStorage.removeItem(
        "gyamax_pedido_pendente"
    );

}


function calcularSubtotalCarrinho() {

    return obterCarrinho()
        .reduce(
            (
                total,
                item
            ) => {

                const produto =
                    produtosLoja[
                        Number(
                            item.id
                        )
                    ];

                if (!produto) {

                    return total;

                }

                return (
                    total +
                    (
                        Number(
                            produto.preco
                        ) *
                        Number(
                            item.quantidade
                        )
                    )
                );

            },
            0
        );

}

/* =========================================================
   BOTÕES DA LOJA
========================================================= */

function configurarBotoesLoja() {

    const botoes =
        document.querySelectorAll(
            ".store-add-button, [data-add-to-cart]"
        );

    if (!botoes.length) {
        return;
    }

    botoes.forEach(
        (
            botao,
            indice
        ) => {

            if (
                botao.dataset
                    .carrinhoConfigurado ===
                "true"
            ) {
                return;
            }

            botao.dataset
                .carrinhoConfigurado =
                "true";

            botao.addEventListener(
                "click",
                evento => {

                    evento.preventDefault();

                    let id =
                        botao.getAttribute(
                            "data-product-id"
                        );

                    if (!id) {

                        id =
                            botao.getAttribute(
                                "data-id"
                            );
                    }

                    if (!id) {

                        const card =
                            botao.closest(
                                ".store-product-card, [data-product-id]"
                            );

                        if (card) {

                            id =
                                card.getAttribute(
                                    "data-product-id"
                                ) ||
                                card.getAttribute(
                                    "data-id"
                                );
                        }
                    }

                    if (!id) {

                        id =
                            indice + 1;
                    }

                    const adicionou =
                        adicionarAoCarrinho(
                            id,
                            1
                        );

                    if (!adicionou) {
                        return;
                    }

                    const textoOriginal =
                        botao.dataset
                            .textoOriginalCarrinho ||
                        obterTexto(
                            "store.addToCart"
                        );

                    botao.dataset
                        .textoOriginalCarrinho =
                        textoOriginal;

                    botao.disabled =
                        true;

                    botao.textContent =
                        "✓";

                    setTimeout(
                        () => {

                            botao.disabled =
                                false;

                            botao.textContent =
                                obterTexto(
                                    "store.addToCart"
                                );

                        },
                        700
                    );
                }
            );
        }
    );
}


/* =========================================================
   RENDERIZAR CARRINHO
========================================================= */

function renderizarCarrinho() {

    const lista =
        document.getElementById(
            "cartItems"
        );

    const vazio =
        document.getElementById(
            "cartEmpty"
        );

    const layout =
        document.getElementById(
            "cartLayout"
        );

    if (
        !lista ||
        !vazio ||
        !layout
    ) {

        atualizarContadorCarrinho();

        return;
    }

    const carrinho =
        obterCarrinho();

    if (!carrinho.length) {

        vazio.style.display =
            "flex";

        layout.style.display =
            "none";

        lista.innerHTML =
            "";

        atualizarTotaisCarrinho();

        atualizarContadorCarrinho();

        return;
    }

    vazio.style.display =
        "none";

    layout.style.display =
        "grid";

    lista.innerHTML =
        carrinho
            .map(
                item => {

                    const produto =
                        obterDadosProduto(
                            item.id
                        );

                    if (!produto) {
                        return "";
                    }

                    const subtotal =
                        produto.preco *
                        item.quantidade;

                    return `
                        <article
                            class="cart-item"
                            data-cart-product-id="${produto.id}"
                        >

                           <div class="cart-item-image">

    ${
        produto.foto
            ? `
                <img
                    src="${escaparHTMLJS(
                        produto.foto
                    )}"
                    alt="${escaparHTMLJS(
                        produto.nome
                    )}"
                    style="
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: block;
                    "
                >
            `
            : `
                <div class="cart-item-placeholder">
                    GYAMAX
                </div>
            `
    }

</div>


                            <div class="cart-item-info">

                                <span class="store-product-category">
                                    ${escaparHTMLJS(
                                        obterTexto(
                                            "store.categoryModel"
                                        )
                                    )}
                                </span>

                                <h3>
                                    ${escaparHTMLJS(
                                        produto.nome
                                    )}
                                </h3>

                                <p>
                                    ${escaparHTMLJS(
                                        produto.descricao
                                    )}
                                </p>

                            </div>


                            <div class="cart-item-controls">

                                <span class="cart-item-quantity-label">
                                    ${escaparHTMLJS(
                                        obterTexto(
                                            "cart.quantity"
                                        )
                                    )}
                                </span>


                                <div class="cart-quantity">

                                    <button
                                        type="button"
                                        class="cart-quantity-button"
                                        data-action="decrease"
                                        data-product-id="${produto.id}"
                                        aria-label="${escaparHTMLJS(
                                            obterTexto(
                                                "cart.decrease"
                                            )
                                        )}"
                                    >
                                        −
                                    </button>


                                    <span class="cart-quantity-value">
                                        ${item.quantidade}
                                    </span>


                                    <button
                                        type="button"
                                        class="cart-quantity-button"
                                        data-action="increase"
                                        data-product-id="${produto.id}"
                                        aria-label="${escaparHTMLJS(
                                            obterTexto(
                                                "cart.increase"
                                            )
                                        )}"
                                    >
                                        +
                                    </button>

                                </div>


                                <strong class="cart-item-price">
                                    ${formatarPreco(
                                        subtotal
                                    )}
                                </strong>


                                <button
                                    type="button"
                                    class="cart-remove-button"
                                    data-action="remove"
                                    data-product-id="${produto.id}"
                                >
                                    ${escaparHTMLJS(
                                        obterTexto(
                                            "cart.remove"
                                        )
                                    )}
                                </button>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");

    configurarControlesCarrinho();

    atualizarTotaisCarrinho();

    atualizarContadorCarrinho();
}


/* =========================================================
   CONTROLES DO CARRINHO
========================================================= */

function configurarControlesCarrinho() {

    document
        .querySelectorAll(
            "#cartItems [data-action][data-product-id]"
        )
        .forEach(
            botao => {

                if (
                    botao.dataset
                        .controleCarrinhoConfigurado ===
                    "true"
                ) {
                    return;
                }

                botao.dataset
                    .controleCarrinhoConfigurado =
                    "true";

                botao.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                botao.getAttribute(
                                    "data-product-id"
                                )
                            );

                        const acao =
                            botao.getAttribute(
                                "data-action"
                            );

                        const carrinho =
                            obterCarrinho();

                        const item =
                            carrinho.find(
                                produto =>
                                    Number(
                                        produto.id
                                    ) === id
                            );

                        if (
                            acao ===
                            "remove"
                        ) {

                            removerDoCarrinho(
                                id
                            );

                            return;
                        }

                        if (!item) {
                            return;
                        }

                        if (
                            acao ===
                            "increase"
                        ) {

                            item.quantidade +=
                                1;
                        }

                        if (
                            acao ===
                            "decrease"
                        ) {

                            item.quantidade -=
                                1;
                        }

                        salvarCarrinho(
                            carrinho
                        );

                        renderizarCarrinho();
                    }
                );
            }
        );
}


/* =========================================================
   TOTAIS
========================================================= */

function atualizarTotaisCarrinho() {

    const subtotal =
        calcularSubtotalCarrinho();

    const subtotalElemento =
        document.getElementById(
            "cartSubtotal"
        );

    const totalElemento =
        document.getElementById(
            "cartTotal"
        );

    if (subtotalElemento) {

        subtotalElemento.textContent =
            formatarPreco(
                subtotal
            );
    }

    if (totalElemento) {

        totalElemento.textContent =
            formatarPreco(
                subtotal
            );
    }
}


/* =========================================================
   MENSAGEM DO CARRINHO
========================================================= */

function mostrarMensagemCarrinho(
    texto
) {

    let elemento =
        document.getElementById(
            "cartMessage"
        );

    if (!elemento) {

        elemento =
            document.createElement(
                "div"
            );

        elemento.id =
            "cartMessage";

        elemento.className =
            "cart-message";

        document.body.appendChild(
            elemento
        );
    }

    elemento.textContent =
        texto;

    elemento.style.display =
        "block";

    clearTimeout(
        mostrarMensagemCarrinho.timer
    );

    mostrarMensagemCarrinho.timer =
        setTimeout(
            () => {

                elemento.style.display =
                    "none";

            },
            2500
        );
}


/* =========================================================
   CHECKOUT — ACESSO
========================================================= */

function abrirCheckout() {

    const carrinho =
        obterCarrinho();

    if (!carrinho.length) {

        mostrarMensagemCarrinho(
            obterTexto(
                "checkout.emptyCart"
            )
        );

        return;
    }

    window.location.href =
        "/checkout.html";
}


/* =========================================================
   CHECKOUT — CÁLCULOS
========================================================= */

function obterResumoCheckout() {

    const carrinho =
        obterCarrinho();

    const itens =
        carrinho
            .map(
                item => {

                    const produto =
                        obterDadosProduto(
                            item.id
                        );

                    if (!produto) {
                        return null;
                    }

                    return {

                        id:
                            produto.id,

                        nome:
                            produto.nome,

                        descricao:
                            produto.descricao,

                        preco:
                            produto.preco,

                        quantidade:
                            item.quantidade,

                        subtotal:
                            produto.preco *
                            item.quantidade
                    };
                }
            )
            .filter(Boolean);

    const subtotal =
        itens.reduce(
            (
                total,
                item
            ) =>
                total +
                item.subtotal,
            0
        );

    return {

        itens,
        subtotal,
        frete: 0,
        total: subtotal
    };
}


/* =========================================================
   CHECKOUT — MÉTODOS
========================================================= */

const METODOS_PAGAMENTO = [
    "cartao",
    "pix",
    "boleto"
];


function metodoPagamentoValido(
    metodo
) {

    return METODOS_PAGAMENTO.includes(
        metodo
    );
}


function obterMetodoPagamentoSelecionado() {

    const selecionado =
        document.querySelector(
            'input[name="metodo-pagamento"]:checked'
        );

    return selecionado
        ? selecionado.value
        : "cartao";
}


/* =========================================================
   CHECKOUT — PARCELAMENTO
========================================================= */

function gerarParcelasCheckout(
    total
) {

    const valores = [];

    const numeroParcelas = [
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12
    ];

    numeroParcelas.forEach(
        parcelas => {

            const valor =
                total /
                parcelas;

            valores.push({

                parcelas,

                valor:
                    Number(
                        valor.toFixed(2)
                    )
            });
        }
    );

    return valores;
}


function obterParcelamentoSelecionado() {

    const select =
        document.getElementById(
            "checkoutInstallments"
        );

    if (!select) {
        return 1;
    }

    const valor =
        Number(
            select.value
        );

    return Number.isInteger(valor) &&
        valor > 0
        ? valor
        : 1;
}


/* =========================================================
   CHECKOUT — ATUALIZAR RESUMO
========================================================= */

function atualizarResumoCheckout() {

    const resumo =
        obterResumoCheckout();

    const subtotal =
        document.getElementById(
            "checkoutSubtotal"
        );

    const frete =
        document.getElementById(
            "checkoutShipping"
        );

    const total =
        document.getElementById(
            "checkoutTotal"
        );

    if (subtotal) {

        subtotal.textContent =
            formatarPreco(
                resumo.subtotal
            );
    }

    if (frete) {

        frete.textContent =
            resumo.frete > 0
                ? formatarPreco(
                    resumo.frete
                )
                : obterTexto(
                    "cart.shippingSoon"
                );
    }

    if (total) {

        total.textContent =
            formatarPreco(
                resumo.total
            );
    }
}


/* =========================================================
   CHECKOUT — PARCELAS NO HTML
========================================================= */

function atualizarOpcoesParcelamento() {

    const select =
        document.getElementById(
            "checkoutInstallments"
        );

    if (!select) {
        return;
    }

    const resumo =
        obterResumoCheckout();

    const parcelas =
        gerarParcelasCheckout(
            resumo.total
        );

    const atual =
        Number(
            select.value
        ) || 1;

    select.innerHTML =
        parcelas
            .map(
                item => {

                    const textoParcela =
                        item.parcelas === 1
                            ? obterTexto(
                                "checkout.oneTime"
                            )
                            : `${item.parcelas}x`;

                    return `
                        <option
                            value="${item.parcelas}"
                        >
                            ${textoParcela} — ${formatarPreco(item.valor)}
                        </option>
                    `;
                }
            )
            .join("");

    select.value =
        String(
            parcelas.some(
                item =>
                    item.parcelas === atual
            )
                ? atual
                : 1
        );
}


/* =========================================================
   CHECKOUT — CAMPOS DE PAGAMENTO
========================================================= */

function atualizarCamposPagamento() {

    const metodo =
        obterMetodoPagamentoSelecionado();

    const cartao =
        document.getElementById(
            "checkoutCardFields"
        );

    const parcelas =
        document.getElementById(
            "checkoutInstallmentsWrapper"
        );

    const pix =
        document.getElementById(
            "checkoutPixMessage"
        );

    const boleto =
        document.getElementById(
            "checkoutBoletoMessage"
        );

    const cardMessage =
        document.getElementById(
            "checkoutCardMessage"
        );

    if (cartao) {

        cartao.style.display =
            metodo === "cartao"
                ? "block"
                : "none";
    }

    if (parcelas) {

        parcelas.style.display =
            metodo === "cartao"
                ? "block"
                : "none";
    }

    if (pix) {

        pix.style.display =
            metodo === "pix"
                ? "block"
                : "none";

        if (metodo === "pix") {

            pix.textContent =
                obterTexto(
                    "checkout.pixMessage"
                );
        }
    }

    if (boleto) {

        boleto.style.display =
            metodo === "boleto"
                ? "block"
                : "none";

        if (metodo === "boleto") {

            boleto.textContent =
                obterTexto(
                    "checkout.boletoMessage"
                );
        }
    }

    if (cardMessage) {

        cardMessage.style.display =
            metodo === "cartao"
                ? "block"
                : "none";

        if (metodo === "cartao") {

            cardMessage.textContent =
                obterTexto(
                    "checkout.cardMessage"
                );
        }
    }
}


/* =========================================================
   CHECKOUT — ATUALIZAÇÃO GERAL
========================================================= */

function atualizarCheckout() {

    if (
        obterNomePagina() !==
        "checkout"
    ) {
        return;
    }

    const resumo =
        obterResumoCheckout();

    if (!resumo.itens.length) {

        document.body.dataset.checkoutVazio =
            "true";

        atualizarResumoCheckout();

        return;
    }

    document.body.dataset.checkoutVazio =
        "false";

    atualizarResumoCheckout();

    atualizarOpcoesParcelamento();

    atualizarCamposPagamento();

    preencherDadosUsuarioCheckout();
}


/* =========================================================
   CHECKOUT — DADOS DO USUÁRIO
========================================================= */

function preencherDadosUsuarioCheckout() {

    if (!usuarioAtual) {
        return;
    }

    const nome =
        document.getElementById(
            "checkoutName"
        );

    const email =
        document.getElementById(
            "checkoutEmail"
        );

    if (nome) {

        nome.value =
            usuarioAtual.nome ||
            "";
    }

    if (email) {

        email.value =
            usuarioAtual.email ||
            "";
    }
}


/* =========================================================
   CHECKOUT — VERIFICA LOGIN
========================================================= */

async function verificarAcessoCheckout() {

    if (
        obterNomePagina() !==
        "checkout"
    ) {
        return true;
    }

    if (usuarioAtual) {
        return true;
    }

    const carrinho =
        obterCarrinho();

    if (!carrinho.length) {

        window.location.href =
            "/carrinho.html";

        return false;
    }

    /*
     * Neste momento exigimos
     * login para concluir pedido.
     */

    const mensagem =
        obterTexto(
            "checkout.loginRequired"
        );

    console.warn(
        mensagem
    );

    return true;
}


/* =========================================================
   CHECKOUT — VALIDAÇÕES
========================================================= */

function somenteNumeros(
    valor
) {

    return String(
        valor || ""
    ).replace(
        /\D/g,
        ""
    );
}


function validarCPF(
    valor
) {

    const cpf =
        somenteNumeros(
            valor
        );

    if (
        cpf.length !== 11 ||
        /^(\d)\1{10}$/.test(cpf)
    ) {

        return false;
    }

    let soma = 0;

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        soma +=
            Number(cpf[i]) *
            (10 - i);
    }

    let resto =
        (soma * 10) % 11;

    if (resto === 10) {
        resto = 0;
    }

    if (
        resto !==
        Number(cpf[9])
    ) {

        return false;
    }

    soma = 0;

    for (
        let i = 0;
        i < 10;
        i++
    ) {

        soma +=
            Number(cpf[i]) *
            (11 - i);
    }

    resto =
        (soma * 10) % 11;

    if (resto === 10) {
        resto = 0;
    }

    return (
        resto ===
        Number(cpf[10])
    );
}


function validarCheckout() {

    const carrinho =
        obterCarrinho();

    if (!carrinho.length) {

        return {
            valido: false,
            mensagem:
                obterTexto(
                    "checkout.emptyCart"
                )
        };
    }

    const nome =
        String(
            document.getElementById(
                "checkoutName"
            )?.value ||
            ""
        ).trim();

    const email =
        String(
            document.getElementById(
                "checkoutEmail"
            )?.value ||
            ""
        ).trim();

    const cpf =
        String(
            document.getElementById(
                "checkoutCpf"
            )?.value ||
            ""
        ).trim();

    if (
        !nome ||
        !email ||
        !cpf
    ) {

        return {
            valido: false,
            mensagem:
                obterTexto(
                    "checkout.required"
                )
        };
    }

    if (!validarCPF(cpf)) {

        return {
            valido: false,
            mensagem:
                obterTexto(
                    "checkout.invalidCpf"
                )
        };
    }

    const metodo =
        obterMetodoPagamentoSelecionado();

    if (
        !metodoPagamentoValido(
            metodo
        )
    ) {

        return {
            valido: false,
            mensagem:
                obterTexto(
                    "checkout.required"
                )
        };
    }

    if (
        metodo ===
        "cartao"
    ) {

        const numero =
            somenteNumeros(
                document.getElementById(
                    "checkoutCardNumber"
                )?.value
            );

        const nomeCartao =
            String(
                document.getElementById(
                    "checkoutCardName"
                )?.value ||
                ""
            ).trim();

        const validade =
            String(
                document.getElementById(
                    "checkoutCardExpiry"
                )?.value ||
                ""
            ).trim();

        const cvv =
            somenteNumeros(
                document.getElementById(
                    "checkoutCardCvv"
                )?.value
            );

        if (
            numero.length < 13 ||
            numero.length > 19 ||
            !nomeCartao ||
            !validade ||
            cvv.length < 3 ||
            cvv.length > 4
        ) {

            return {
                valido: false,
                mensagem:
                    obterTexto(
                        "checkout.invalidCard"
                    )
            };
        }
    }

    return {

        valido: true,

        dados: {

            nome,

            email,

            cpf,

            metodo,

            parcelas:
                metodo === "cartao"
                    ? obterParcelamentoSelecionado()
                    : 1
        }
    };
}


/* =========================================================
   CHECKOUT — CONFIRMAR
========================================================= */

async function confirmarCheckout() {

    const validacao =
        validarCheckout();

    if (!validacao.valido) {

        mostrarMensagemCheckout(
            validacao.mensagem,
            true
        );

        return;
    }

    const resumo =
        obterResumoCheckout();

    /*
     * Neste estágio o frontend apenas
     * prepara o pedido.
     *
     * Não armazenamos dados completos
     * do cartão no navegador.
     */

    const pedido =
        {

            cliente:
                validacao.dados,

            itens:
                resumo.itens.map(
                    item => ({

                        id:
                            item.id,

                        quantidade:
                            item.quantidade
                    })
                ),

            total:
                resumo.total
        };

    sessionStorage.setItem(
        "gyamax_pedido_checkout",
        JSON.stringify(
            pedido
        )
    );

    mostrarMensagemCheckout(
        obterTexto(
            "checkout.success"
        ),
        false
    );

    /*
     * O próximo passo será enviar
     * este pedido ao servidor e,
     * no backend, criar o pagamento
     * através do provedor escolhido.
     */
}


/* =========================================================
   CHECKOUT — MENSAGEM
========================================================= */

function mostrarMensagemCheckout(
    texto,
    erro = false
) {

    const elemento =
        document.getElementById(
            "checkoutMessage"
        );

    if (!elemento) {

        alert(
            texto
        );

        return;
    }

    elemento.textContent =
        texto;

    elemento.style.display =
        "block";

    elemento.classList.toggle(
        "erro",
        erro
    );

    elemento.classList.toggle(
        "sucesso",
        !erro
    );
}


/* =========================================================
   CHECKOUT — EVENTOS
========================================================= */

function configurarCheckout() {

    if (
        obterNomePagina() !==
        "checkout"
    ) {
        return;
    }

    const botao =
        document.getElementById(
            "checkoutFinishButton"
        );

    if (
        botao &&
        botao.dataset.checkoutConfigurado !==
        "true"
    ) {

        botao.dataset.checkoutConfigurado =
            "true";

        botao.addEventListener(
            "click",
            async evento => {

                evento.preventDefault();

                await confirmarCheckout();
            }
        );
    }

    document
        .querySelectorAll(
            'input[name="metodo-pagamento"]'
        )
        .forEach(
            radio => {

                if (
                    radio.dataset
                        .checkoutMetodoConfigurado ===
                    "true"
                ) {

                    return;
                }

                radio.dataset
                    .checkoutMetodoConfigurado =
                    "true";

                radio.addEventListener(
                    "change",
                    () => {

                        atualizarCamposPagamento();
                    }
                );
            }
        );

    const parcelas =
        document.getElementById(
            "checkoutInstallments"
        );

    if (
        parcelas &&
        parcelas.dataset
            .checkoutParcelasConfigurado !==
        "true"
    ) {

        parcelas.dataset
            .checkoutParcelasConfigurado =
            "true";

        parcelas.addEventListener(
            "change",
            () => {

                atualizarResumoCheckout();
            }
        );
    }

    atualizarCheckout();
}


/* =========================================================
   API PARA CHECKOUT.HTML
========================================================= */

window.GYAMAX = {

    produtos:
        produtosLoja,

    obterCarrinho,

    salvarCarrinho,

    obterDadosProduto,

    obterResumoCheckout,

    obterQuantidadeTotalCarrinho,

    calcularSubtotalCarrinho,

    formatarPreco,

    obterIdiomaAtual,

    obterTexto,

    atualizarContadorCarrinho,

    usuarioAtual: () =>
        usuarioAtual
};


window.gyamaxAtualizarContadorCarrinho =
    atualizarContadorCarrinho;


/* =========================================================
   CONFIGURAR CARRINHO
========================================================= */

function configurarCarrinho() {

    atualizarContadorCarrinho();

    configurarBotoesLoja();

    renderizarCarrinho();

    configurarCheckoutCarrinho();
}


/* =========================================================
   CHECKOUT DO CARRINHO
========================================================= */

function configurarCheckoutCarrinho() {

    const botao =
        document.getElementById(
            "cartCheckoutButton"
        );

    if (!botao) {
        return;
    }

    if (
        botao.dataset
            .checkoutConfigurado ===
        "true"
    ) {

        return;
    }

    botao.dataset
        .checkoutConfigurado =
        "true";

    botao.addEventListener(
        "click",
        evento => {

            evento.preventDefault();

            abrirCheckout();
        }
    );

    /*
     * Também suporta links
     * com data-checkout.
     */

    document
        .querySelectorAll(
            "[data-checkout]"
        )
        .forEach(
            elemento => {

                if (
                    elemento.dataset
                        .checkoutLinkConfigurado ===
                    "true"
                ) {

                    return;
                }

                elemento.dataset
                    .checkoutLinkConfigurado =
                    "true";

                elemento.addEventListener(
                    "click",
                    evento => {

                        evento.preventDefault();

                        abrirCheckout();
                    }
                );
            }
        );
}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTMLJS(
    valor
) {

    return String(
        valor ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}

/* =========================================================
   CADASTRO
========================================================= */

function configurarCadastro() {

    const form =
        document.getElementById(
            "registerForm"
        );

    if (!form) {
        return;
    }

    if (
        form.dataset.cadastroConfigurado ===
        "true"
    ) {
        return;
    }

    form.dataset.cadastroConfigurado =
        "true";


    form.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            const nome =
                String(
                    document.getElementById(
                        "name"
                    )?.value ||
                    ""
                ).trim();


            const email =
                String(
                    document.getElementById(
                        "email"
                    )?.value ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            const senha =
                String(
                    document.getElementById(
                        "password"
                    )?.value ||
                    ""
                );


            const confirmarSenha =
                String(
                    document.getElementById(
                        "confirm-password"
                    )?.value ||
                    ""
                );


            const mensagem =
                document.getElementById(
                    "registerMessage"
                );


            const botao =
                form.querySelector(
                    'button[type="submit"]'
                );


            function mostrarMensagem(
                texto,
                erro = false
            ) {

                if (!mensagem) {
                    return;
                }

                mensagem.textContent =
                    texto;

                mensagem.style.display =
                    "block";

                mensagem.classList.toggle(
                    "erro",
                    erro
                );

                mensagem.classList.toggle(
                    "sucesso",
                    !erro
                );

            }


            if (
                !nome ||
                !email ||
                !senha ||
                !confirmarSenha
            ) {

                mostrarMensagem(
                    "Preencha todos os campos obrigatórios.",
                    true
                );

                return;

            }


            if (
                senha.length < 6
            ) {

                mostrarMensagem(
                    "A senha precisa ter pelo menos 6 caracteres.",
                    true
                );

                return;

            }


            if (
                senha !==
                confirmarSenha
            ) {

                mostrarMensagem(
                    "As senhas não coincidem.",
                    true
                );

                return;

            }


            if (botao) {

                botao.disabled =
                    true;

                botao.dataset.textoOriginal =
                    botao.textContent;

                botao.textContent =
                    "Criando conta...";

            }


            try {

                const resposta =
                    await fetch(
                        "/cadastro",
                        {

                            method:
                                "POST",

                            credentials:
                                "same-origin",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    nome,

                                    email,

                                    senha,

                                    confirmPassword:
                                        confirmarSenha

                                })

                        }
                    );


                let dados = {};


                try {

                    dados =
                        await resposta.json();

                } catch {

                    dados = {};

                }


                if (
                    !resposta.ok ||
                    !dados.sucesso
                ) {

                    mostrarMensagem(
                        dados.mensagem ||
                        dados.erro ||
                        "Não foi possível criar sua conta.",
                        true
                    );

                    return;

                }


                mostrarMensagem(
                    dados.mensagem ||
                    "Conta criada com sucesso! Redirecionando...",
                    false
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "/login.html";

                    },
                    800
                );


            } catch (erro) {

                console.error(
                    "Erro no cadastro:",
                    erro
                );


                mostrarMensagem(
                    "Não foi possível conectar ao servidor.",
                    true
                );


            } finally {

                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        botao.dataset
                            .textoOriginal ||
                        "Criar conta";

                }

            }

        }
    );

}
/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function iniciarGYAMAX() {

    await carregarProdutosLoja();

    aplicarIdioma(
        obterIdiomaLocal()
    );

    aplicarAparencia(
        localStorage.getItem(
            "gyamax_aparencia"
        ) || "escuro"
    );

    configurarLogin();

    configurarCadastro();

    configurarLogout();

    configurarPreferencias();

    configurarMenuMobile();

    configurarCarrinho();

    await verificarLogin();

    // restante da função...

    if (usuarioAtual) {

        aplicarIdioma(
            obterIdiomaAtual()
        );

        aplicarAparencia(
            usuarioAtual.aparencia ||
            "escuro"
        );

        preencherConfiguracoes();
    }

    const formulario =
        document.getElementById(
            "formConfiguracoes"
        );

    if (formulario) {

        if (
            formulario.dataset
                .configuracoesConfiguradas !==
            "true"
        ) {

            formulario.dataset
                .configuracoesConfiguradas =
                "true";

            formulario.addEventListener(
                "submit",
                salvarConfiguracoes
            );
        }
    }

    if (
        obterNomePagina() ===
        "configuracoes"
    ) {

        if (!usuarioAtual) {

            window.location.href =
                "/login.html";

            return;
        }

        preencherConfiguracoes();
    }

    atualizarInterfaceLogin();

    atualizarAvatares();

    atualizarContadorCarrinho();

    if (
        obterNomePagina() ===
        "carrinho"
    ) {

        renderizarCarrinho();

        configurarCheckoutCarrinho();
    }

    if (
        obterNomePagina() ===
        "checkout"
    ) {

        await verificarAcessoCheckout();

        configurarCheckout();

        atualizarCheckout();
    }

    atualizarTituloPagina(
        obterIdiomaAtual()
    );
}

/* =========================================================
   DOM READY
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarGYAMAX
    );

} else {

    iniciarGYAMAX();
}
/* =========================================================
   PROJETOS — FILTROS E VER MAIS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const filtros =
        document.querySelectorAll(
            ".filter-btn"
        );

    const projetos =
        document.querySelectorAll(
            ".project-item"
        );

    const botaoVerMais =
        document.getElementById(
            "loadMore"
        );


    if (
        !filtros.length &&
        !projetos.length
    ) {
        return;
    }


    let filtroAtual = "todos";

    let mostrandoTodos = false;


    /* =====================================================
       ATUALIZAR PROJETOS
    ===================================================== */

    function atualizarProjetos() {

        projetos.forEach(
            projeto => {

                const categoria =
                    projeto.dataset.category;

                const extra =
                    projeto.classList.contains(
                        "extra-project"
                    );


                const pertenceAoFiltro =
                    filtroAtual === "todos" ||
                    categoria === filtroAtual;


                const deveMostrar =
                    pertenceAoFiltro &&
                    (
                        mostrandoTodos ||
                        !extra
                    );


                projeto.style.display =
                    deveMostrar
                        ? ""
                        : "none";

            }
        );


        atualizarBotaoVerMais();

    }


    /* =====================================================
       BOTÃO VER MAIS
    ===================================================== */

    function atualizarBotaoVerMais() {

        if (!botaoVerMais) {
            return;
        }


        const existemExtras =
            Array.from(
                projetos
            ).some(
                projeto =>
                    projeto.classList.contains(
                        "extra-project"
                    )
            );


        if (!existemExtras) {

            botaoVerMais.style.display =
                "none";

            return;

        }


        if (mostrandoTodos) {

            botaoVerMais.textContent =
                "Ver menos projetos";

        } else {

            botaoVerMais.textContent =
                "Ver mais projetos";

        }

    }


    /* =====================================================
       FILTROS
    ===================================================== */

    filtros.forEach(
        botao => {

            botao.addEventListener(
                "click",
                () => {

                    filtroAtual =
                        botao.dataset.filter ||
                        "todos";


                    filtros.forEach(
                        outroBotao => {

                            outroBotao.classList.toggle(
                                "active",
                                outroBotao === botao
                            );

                        }
                    );


                    /*
                     * Quando troca de categoria,
                     * volta para a visualização inicial.
                     */
                    mostrandoTodos = false;


                    atualizarProjetos();

                }
            );

        }
    );


    /* =====================================================
       VER MAIS
    ===================================================== */

       if (botaoVerMais) {

        botaoVerMais.addEventListener(
            "click",
            () => {

                mostrandoTodos =
                    !mostrandoTodos;

                atualizarProjetos();

            }
        );

    }

});

/* =========================================================
   GYAMAX — ORÇAMENTO COM LOGIN
========================================================= */

(function () {

    "use strict";

    async function obterStatusLogin() {

        try {

            const resposta =
                await fetch(
                    "/status-login",
                    {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!resposta.ok) {

                return {
                    logado: false,
                    usuario: null
                };

            }


            return await resposta.json();

        } catch (erro) {

            console.error(
                "GYAMAX — erro ao verificar login:",
                erro
            );

            return {
                logado: false,
                usuario: null
            };

        }

    }


    /*
     * Usa CAPTURE no document.
     * Isso acontece antes do listener antigo
     * que estava preso diretamente ao botão.
     */
    document.addEventListener(
        "click",
        async function (evento) {

            const botao =
                evento.target.closest(
                    '[data-i18n="quote.request"]'
                );


            if (!botao) {
                return;
            }


            /*
             * Impede completamente o comportamento
             * antigo do botão.
             */
            evento.preventDefault();
            evento.stopPropagation();
            evento.stopImmediatePropagation();


            /*
             * Verifica a sessão real no servidor.
             */
            const dados =
                await obterStatusLogin();


            /*
             * =========================================
             * DESLOGADO
             * =========================================
             */

            if (
                !dados.logado ||
                !dados.usuario
            ) {

               mostrarAvisoLogin(
                    "Você deve logar uma conta primeiro"
                );


                window.location.href =
                    "/login.html";


                return;
            }


            /*
             * =========================================
             * LOGADO
             * =========================================
             */

            const usuario =
                dados.usuario;


            const nome =
                usuario.nome ||
                "Cliente GYAMAX";


            const email =
                usuario.email ||
                "";


            if (!email) {

                alert(
                    "Não foi possível identificar o e-mail da sua conta."
                );

                return;
            }


            const textoOriginal =
                botao.textContent;


            botao.disabled =
                true;


            botao.textContent =
                "Enviando...";


            try {

                const resposta =
                    await fetch(
                        "/api/orcamento",
                        {

                            method:
                                "POST",

                            credentials:
                                "same-origin",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    nome:
                                        nome,

                                    email:
                                        email,

                                    mensagem:
                                        "Cliente solicitou um orçamento através do site GYAMAX."

                                })

                        }
                    );


                const resultado =
                    await resposta.json();


                console.log(
                    "GYAMAX — orçamento:",
                    resposta.status,
                    resultado
                );


                if (
                    !resposta.ok ||
                    !resultado.sucesso
                ) {

                    throw new Error(
                        resultado.erro ||
                        resultado.mensagem ||
                        "Erro ao enviar orçamento."
                    );

                }


                botao.textContent =
                    "✓ Orçamento enviado!";


                setTimeout(
                    function () {

                        botao.disabled =
                            false;

                        botao.textContent =
                            textoOriginal;

                    },
                    2500
                );


            } catch (erro) {

                console.error(
                    "GYAMAX — erro no orçamento:",
                    erro
                );


                botao.disabled =
                    false;

                botao.textContent =
                    textoOriginal;


                alert(
                    "Não foi possível enviar o orçamento."
                );

            }

        },
        true
    );

})();
/* =========================================================
   GYAMAX — AVISO DE LOGIN
========================================================= */

function mostrarAvisoLogin() {

    let aviso =
        document.getElementById(
            "gyamaxAvisoLogin"
        );

    if (aviso) {
        aviso.remove();
    }

    aviso =
        document.createElement(
            "div"
        );

    aviso.id =
        "gyamaxAvisoLogin";

    aviso.innerHTML = `
        <div class="gyamax-aviso-login-conteudo">

            <div class="gyamax-aviso-login-icone">
                🔐
            </div>

            <div class="gyamax-aviso-login-texto">

                <strong>
                    Você deve logar uma conta primeiro
                </strong>

                <span>
                    Entre na sua conta para solicitar um orçamento.
                </span>

            </div>

            <a
                href="/login.html"
                class="gyamax-aviso-login-botao"
            >
                Entrar
            </a>

            <button
                type="button"
                class="gyamax-aviso-login-fechar"
                aria-label="Fechar"
            >
                ×
            </button>

        </div>
    `;

    document.body.appendChild(
        aviso
    );

    requestAnimationFrame(
        function () {

            aviso.classList.add(
                "ativo"
            );

        }
    );

    const fechar =
        aviso.querySelector(
            ".gyamax-aviso-login-fechar"
        );

    fechar.addEventListener(
        "click",
        function () {

            aviso.classList.remove(
                "ativo"
            );

            setTimeout(
                function () {
                    aviso.remove();
                },
                250
            );

        }
    );

    setTimeout(
        function () {

            if (
                aviso.isConnected
            ) {

                aviso.classList.remove(
                    "ativo"
                );

                setTimeout(
                    function () {

                        if (
                            aviso.isConnected
                        ) {
                            aviso.remove();
                        }

                    },
                    250
                );

            }

        },
        6000
    );
}
/* =========================================================
   GYAMAX — CONTATOS NO RODAPÉ
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const direitos =
            Array.from(
                document.querySelectorAll("span")
            ).find(
                elemento =>
                    elemento.textContent.trim() ===
                    "Todos os direitos reservados."
            );

        if (!direitos) {
            return;
        }

        const container =
            direitos.parentElement;

        if (
            container.querySelector(
                ".gyamax-footer-contatos"
            )
        ) {
            return;
        }

        const separador =
            document.createTextNode(" • ");

        const contatos =
            document.createElement("span");

        contatos.className =
            "gyamax-footer-contatos";

        contatos.textContent =
            "gyamax3d@gmail.com • @gyamax_ofc";

        container.appendChild(
            separador
        );

        container.appendChild(
            contatos
        );

    }
);