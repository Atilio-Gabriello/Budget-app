//---Controlador do Dinheiro---//
let controladorDinheiro = (function(){
    
    let Gasto = function(id,descrição,valor){
        this.id = id;
        this.descrição = descrição;
        this.valor = valor;
        this.porcentagem = -1;
    };

    Gasto.prototype.calcPorcent = function(ganhoTotal){ 
        if(ganhoTotal > 0){
            this.porcentagem = Math.round((this.valor / ganhoTotal) * 100);
        }else{
            this.porcentagem = -1;
        }
    };

    Gasto.prototype.recebePorcent = function(){
        return this.porcentagem;
    };

    let Ganho = function(id,descrição,valor){
        this.id = id;
        this.descrição = descrição;
        this.valor = valor;
    };

    let calcularTotal = function(tipo){
        let soma = 0;
        dados.itens[tipo].forEach(function(atual){
            soma += atual.valor;
        });
        dados.total[tipo] = soma;
    };

    let dados = {
        itens: {
            gast: [],
            ganh: []
        },
        total: {
            gast: 0,
            ganh: 0
        },
        grana: 0,
        porcentagem: -1
    };

    return{
        addItem: function(tipo,des,val){
            let novoItem,id;

            // Criação de novos IDs
            if(dados.itens[tipo].length > 0){
                id = dados.itens[tipo][dados.itens[tipo].length - 1].id + 1;
            }else{
                id = 0;
            }

            // Criação de novos itens baseado no tipo(gast/ganh)
            if(tipo === 'gast'){
                novoItem = new Gasto(id,des,val);
            }else if(tipo === 'ganh'){
                novoItem = new Ganho(id,des,val);
            }

            // Coloca na estrutura de dados
            dados.itens[tipo].push(novoItem);

            // Retorna o novo item
            return novoItem;
        },

        deleteItem: function(tipo,id){
            let ids,index;
            
            ids = dados.itens[tipo].map(function(atual){
                return atual.id;
            });

            index = ids.indexOf(id);

            if(index !== -1 ){
                dados.itens[tipo].splice(index,1);
            }
        },

        calcularGrana: function(){
            ///1. Calcular total de lucros && Calcular total de gastos
            calcularTotal('ganh');
            calcularTotal('gast');
            ///2. Calcular total geral
            dados.grana = dados.total.ganh - dados.total.gast;
            ///3. Calcular porcentagem de grana gastada
            if(dados.total.ganh > 0){
                dados.porcentagem = Math.round((dados.total.gast/dados.total.ganh) * 100);
            }else{
                dados.porcentagem = -1;
            }
        },

        calcularPorcentagem: function(){
            dados.itens.gast.forEach(function(atual){
                atual.calcPorcent(dados.total.ganh);
            });
        },

        receberPorcentagem: function(){
            let todasPorcent = dados.itens.gast.map(function(atual){
                return atual.recebePorcent();
            });
            return todasPorcent;
        },

        receberGrana: function(){
            return {
                grana: dados.grana,
                totalGanh: dados.total.ganh,
                totalGast: dados.total.gast,
                porcent: dados.porcentagem
            }
        }
    }

})();

//---Controlador da interface---//
let controladorUI = (function(){
    
    let formataNum = function(num,tipo){
        let numSplit,int,dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3 && int.length <= 6){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
        }else if(int.length > 6){
            int = int.substr(0,int.length - 6) + ',' + int.substr(int.length - 6,3) + ',' + int.substr(int.length - 6,3);
        }
        dec = numSplit[1];

        return (tipo === 'gast' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    let listaNodeForEach = function(lista,callback){
        for(let i = 0;i < lista.length;i++){
            callback(lista[i],i);
        }
    };

    return{
        lerValores: function(){

            return{
                tipo: document.querySelector('.add__type').value,// gast == '-' / ganh == '+'
                descrição: document.querySelector('.add__description').value,
                valor: parseFloat(document.querySelector('.add__value').value)
            };
        },
        
        adicionarItem: function(obj,tipo){
            let html,novahtml,elemento;
            
            // 1. Criar uma string de HTML com um placeholder
            if(tipo === 'ganh'){
                elemento = '.receita__list';

                html = '<div class="item clearfix" id="ganh-%id%"><div class="item__description">%descrição%</div><div class="right clearfix"><div class="item__value">%valor%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>';
            }else if(tipo === 'gast'){
                elemento = '.despesas__list';

                html = '<div class="item clearfix" id="gast-%id%"><div class="item__description">%descrição%</div><div class="right clearfix"><div class="item__value">%valor%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><ion-icon name="close-circle-outline"></ion-icon></button></div></div></div>';
            }

            // 2. Substituir o placeholder com alguns dados
            novahtml = html.replace('%id%',obj.id);
            novahtml = novahtml.replace('%descrição%',obj.descrição);
            novahtml = novahtml.replace('%valor%',formataNum(obj.valor,tipo));

            // 3. Inserir HTML no DOM
            document.querySelector(elemento).insertAdjacentHTML('beforeend',novahtml);
        },

        deleteItemLista: function(idSelecionada){
            let elemento;

            elemento = document.getElementById(idSelecionada);

            elemento.parentNode.removeChild(elemento);
        },

        limparTexto: function(){
            let campos,arrayCampos;
            
            campos = document.querySelectorAll('.add__description' + ' , ' + '.add__value');

            arrayCampos = Array.prototype.slice.call(campos);

            arrayCampos.forEach(function(atual,index,array){
                atual.value = "";
            });

            arrayCampos[0].focus();
        },

        mostrarGrana: function(obj){
            let tipo;
            
            obj.grana > 0 ? tipo = 'ganh' : tipo = 'gast';
            
            document.querySelector('.budget__value').textContent = formataNum(obj.grana,tipo);
            document.querySelector('.budget__receita--value').textContent = formataNum(obj.totalGanh,'ganh');
            document.querySelector('.budget__despesas--value').textContent = formataNum(obj.totalGast,'gast');

            if(obj.porcent > 0){
                document.querySelector('.budget__despesas--percentage').textContent = obj.porcent + '\%';
            }else{
                document.querySelector('.budget__despesas--percentage').textContent = '---';
            }
        },

        mostrarPorcentagem: function(porcentagens){
            let prcts;
            
            prcts = document.querySelectorAll('.item__percentage');

            listaNodeForEach(prcts, function(atual,index){
                if(porcentagens[index] > 0){
                    atual.textContent = porcentagens[index] + '%';
                }else{
                    atual.textContent = '---';
                }
            });
        },

        mostrarMes: function(){
            let agora,ano,mes,meses;
            
            meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

            agora = new Date();
            ano = agora.getFullYear();
            mes = agora.getMonth();

            document.querySelector('.budget__title--month').textContent = meses[mes] + ' de ' + ano;
        },

        mudarTipo: function(){
            let campos = document.querySelectorAll('.add__type' + ',' + '.add__description' + ',' +'.add__value');
            listaNodeForEach(campos,function(atual){
                atual.classList.toggle('red-focus');
            });

            document.querySelector('.add__btn').classList.toggle('red');
        }
    };

})();

//---Controlador central do app---//
let controladorApp = (function(cntrD,cntrU){
    // Atualizar os valores
    let atualizaValores = function(){
        let grana;

        ///1. Calcular o dinheiro total.
        cntrD.calcularGrana();
        ///2. Retorna o dinheiro total.
        grana = cntrD.receberGrana();
        ///3. Atualizar o valor da interface.
        cntrU.mostrarGrana(grana);
    };
    
    // Função que adiciona os valores
    let cntrAddItem = function(){
        let valores,novoItem;
        
        ///1. Ler os dados escritos.
        valores = cntrU.lerValores();
        if(valores.descrição !== "" && !isNaN(valores.valor) && valores.valor > 0){
            ///2. Adicionar os valores para o controlador de dinheiro.
            novoItem = cntrD.addItem(valores.tipo,valores.descrição,valores.valor);
            ///3. Adicionar os valores para o controlador da interface.
            cntrU.adicionarItem(novoItem,valores.tipo);
            ///4. Limpar os campos
            cntrU.limparTexto();
            ///5. Calcula e atualiza os valores em dinheiro
            atualizaValores();
            ///6. Calcula e atualiza porcentagem de cada item
            atualizaPorcent();
        }
    };

    let cntrDelItem = function(evento){
        let idItem,idSplit,tipo,id;

        idItem = evento.target.parentNode.parentNode.parentNode.parentNode.id;

        if(idItem){
            idSplit = idItem.split('-');
            tipo = idSplit[0];
            id = parseInt(idSplit[1]);

            ///1. Deletar item da estrutura de dados
            cntrD.deleteItem(tipo,id);
            ///2. Deletar item da interface
            cntrU.deleteItemLista(idItem);
            ///3. Atualizar e mostrar novos valores
            atualizaValores();
            ///4. Calcula e atualiza porcentagem de cada item
            atualizaPorcent();
        }
    };
    
    let setupEventos = function(){
        // Usuario clica no icone
        document.querySelector('.add__btn').addEventListener('click',cntrAddItem);

        // Usuario pressiona o 'ENTER'
        document.addEventListener('keypress',function(enter){
            if(enter.key === "Enter"){
                cntrAddItem();
            }
        });

        document.querySelector('.container').addEventListener('click',cntrDelItem);

        document.querySelector('.add__type').addEventListener('change',cntrU.mudarTipo);
    };

    let atualizaPorcent = function(){
        let porcentagens;
        
        ///1. Calcular as porcentagens
        cntrD.calcularPorcentagem();
        ///2. Ler porcentagens no cntrD
        porcentagens = cntrD.receberPorcentagem();
        ///3. Atualizar os valores na interface
        cntrU.mostrarPorcentagem(porcentagens);
    };

    return{
        inicializar: function(){
            setupEventos();
            cntrU.mostrarMes();
            cntrU.mostrarGrana({
                grana: 0,
                totalGanh: 0,
                totalGast: 0,
                porcent: -1
            });
        }
    };
})(controladorDinheiro,controladorUI);

controladorApp.inicializar();