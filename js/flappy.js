function novoElemento(tagName, className) {
    const elem = document.createElement(tagName);
    elem.className = className;
    return elem
}

function Barreira(revesa = false) {
    this.elemento = novoElemento('div', 'barreira');

    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');

    this.elemento.appendChild(revesa ? corpo : borda);
    this.elemento.appendChild(revesa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, positionX) {
    this.elemento = novoElemento('div', 'par-de-barreiras');

    this.superior = new Barreira(true);
    this.inferior = new Barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;

        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    this.setX = x => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(positionX);
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ];

    const deslocamento = 3;

    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento);

            // Quando o elemento sair area do jogo.
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura();
            }
            const meio = largura / 2;
            const curzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio;
            curzouMeio && notificarPonto();
        });
    }

}

function Passaro(alturaJogo) {
    let voando = false;
    this.elemento = novoElemento('div', 'passaro');
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    this.setY = y => this.elemento.style.bottom = `${y}px`;

    window.onkeydown = e => voando = true;
    window.onkeyup = e => voando = false;

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5);
        this.setY(novoY);
        const alturaMaxima = alturaJogo - this.elemento.clientHeight;

        if (novoY <= 0) {
            this.setY(0);
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima);
        } else {
            this.setY(novoY);
        }

    }

    this.setY(alturaJogo / 2);
}

function Progresso() {
    this.elemento = novoElemento('span', 'progresso');

    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos;
    }

    this.atualizarPontos(0);
}


function estaoSobrePostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left;

    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top;

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false;

    barreiras.pares.forEach(ParDeBarreiras => {
        if (!colidiu) {
            const superior = ParDeBarreiras.superior.elemento;
            const inferior = ParDeBarreiras.inferior.elemento;
            colidiu = estaoSobrePostos(passaro.elemento, superior)
                || estaoSobrePostos(passaro.elemento, inferior);
        }
    });

    return colidiu
}

function FlapBird() {
    let pontos = 0;

    const areaDojogo = document.querySelector('[wm-flappy]');
    const altura = areaDojogo.clientHeight;
    const largura = areaDojogo.clientWidth;

    const progresso = new Progresso();
    const barreiras = new Barreiras(
        altura,
        largura,
        200,
        400,
        () => progresso.atualizarPontos(++pontos)
    );

    const passaro = new Passaro(altura);

    areaDojogo.appendChild(progresso.elemento);
    areaDojogo.appendChild(passaro.elemento);

    barreiras.pares.forEach(par => areaDojogo.appendChild(par.elemento));

    function gameOver() {
        const messagemGameOver = document.querySelector('.content h2');
        areaDojogo.style.filter = "grayscale(100%)"
        messagemGameOver.style.display = 'block'

    }

    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar();
            passaro.animar();

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador);
                gameOver();
            }


        }, 20);
    }
}

new FlapBird().start();