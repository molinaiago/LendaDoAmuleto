# A Lenda do Amuleto

![Phaser](https://img.shields.io/badge/Feito%20com-Phaser%203-blue?style=for-the-badge&logo=phaser)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![Node.js](https://img.shields.io/badge/Node.js-14+-green?style=for-the-badge&logo=node.js)

**A Lenda do Amuleto** é um jogo de aventura 2D com elementos de exploração e combate, desenvolvido para navegador utilizando JavaScript e o framework Phaser 3.

Este projeto foi desenvolvido por Iago Molina Camargo, Samuel Barbara e Felipe Tadiello, da Universidade Regional Integrada do Alto Uruguai e das Missões (URI), como forma de aprofundar os conhecimentos em desenvolvimento de jogos.

## 📖 História

A tranquilidade de uma pequena vila é abalada quando um amuleto mágico, que a protegia de forças malignas, é roubado por um poderoso e sombrio Mago. Sem a sua proteção, a vila está à beira da destruição.

Movido pela coragem e um forte senso de dever, um jovem herói embarca em uma perigosa jornada para recuperar o artefato. Sua missão o levará a atravessar uma floresta perigosa e explorar uma caverna hostil, enfrentando criaturas e desvendando os segredos que o levarão ao confronto final contra o Mago. Salve a vila e torne-se uma lenda!

## ✨ Funcionalidades

* **Exploração Fluida:** Viaje por um mapa contínuo que conecta três áreas distintas — **Vila**, **Floresta** e **Caverna** — sem telas de carregamento.
* **Combate Dinâmico:** Enfrente diferentes tipos de inimigos, cada um com seus próprios padrões de ataque.
* **Inimigos Variados:**
    * **Goblins:** Ágeis e rápidos, servem como um desafio inicial.
    * **Esqueletos:** Mais resistentes e com ataques mais lentos, porém poderosos.
    * **Mago Sombrio:** O chefe final, com ataques em área, projéteis teleguiados e a capacidade de invocar lacaios.
* **Power-Ups:** Encontre itens para te ajudar na jornada:
    * **Poção de Cura:** Restaura 50% da sua vida.
    * **Escudo Protetor:** Concede 5 segundos de invulnerabilidade.
* **Narrativa Envolvente:** Converse com os aldeões para descobrir mais sobre a história e a importância da sua missão.

## 🛠️ Tecnologias Utilizadas

* **Linguagem Principal:** **JavaScript (ES6+)**
* **Framework de Jogo:** **Phaser 3**, utilizado para gerenciar sprites, animações, física (Arcade Physics) e cenas.
* **Ambiente de Execução:** **Node.js**, usado para gerenciar as dependências e rodar um servidor de desenvolvimento local.
* **Editor de Mapas:** **Tiled**, ferramenta usada para desenhar os cenários do jogo, exportados em formato JSON.
* **Controle de Versão:** **Git** e **GitHub**.
* **Editor de Código:** **Visual Studio Code**.

## 🚀 Como Rodar o Jogo

Para jogar "A Lenda do Amuleto" em sua máquina local, você precisará ter o **Node.js** e o **Git** instalados.

Siga os passos abaixo:

**1. Clone o repositório:**

Abra seu terminal ou prompt de comando e execute o seguinte comando para baixar os arquivos do jogo.

```bash
git clone https://github.com/molinaiago/LendaDoAmuleto
```

**2. Navegue até o diretório do projeto:**
   
Após o download, acesse a pasta que foi criada.

```bash
cd LendaDoAmuleto
```
**3. Instale as dependências:**

Este comando irá baixar todas as bibliotecas necessárias para o projeto, incluindo o framework Phaser.
```bash
npm install
```


**4. Inicie o servidor de desenvolvimento:**

Este comando iniciará um servidor local e disponibilizará o jogo para ser acessado pelo navegador.

```bash
npm run start
```
## 🎮 Controles

* **Movimento:** Teclas de Seta (↑, ↓, ←, →) ou WASD.
* **Ataque:** Barra de Espaço ou Clique do Mouse.
* **Interação (Diálogos):** Tecla ,.

*(Os controles podem variar. Verifique o código-fonte para confirmação.)*

## 👨‍💻 Autores

* **Iago Molina Camargo** 
* **Samuel Barbara** 
* **Felipe Tadiello** 

Projeto desenvolvido na **Universidade Regional Integrada do Alto Uruguai e das Missões (URI)**.

