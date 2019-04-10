/**
 * Created by simon on 08/04/2019.
 *
 * Memory - Version VanillaJS
 *
 * @author Simon Stien <contact@isolud.com>
 * @version 1.0 https://github.com/isolud/memory
 *
 */



(function()
{
    // Ajout d'une méthode shuffle pour nos tableaux
    Array.prototype.shuffle1 = function () {
        var l = this.length + 1;
        while (l--) {
            var r = ~~(Math.random() * l),
                o = this[r];

            this[r] = this[0];
            this[0] = o;
        }

        return this;
    };

    /*
    * Gére le joueur
    *
     */
    var User = function()
    {
        this.name=null;
        this.screenContainer = new Screen('screen-set-name','welcome-msg-container');
        this.domElements = {
            'text-input' : document.getElementById('input-set-name'),
            'btn' : document.getElementById('btn-set-name'),
            'view' : document.getElementById('welcome-view')
        };

        this.domElements.btn.addEventListener('click', function()
        {
            if(this.domElements['text-input'].value.length) {
                this.setName(this.domElements['text-input'].value);
            }

        }.bind(this));

        this.getName = function()
        {
            if(window.localStorage && !this.name)
            {
                var _name = localStorage.getItem('User-name');
                if(_name)
                {
                    this.setName(_name);
                }
            }

            if(!this.name)
            {
                //Retour d'une valeur par défaut au cas où le joueur n'entre pas de nom
                return "Visiteur";
            }
            else {
                return this.name;
            }
        };
        this.setName = function(name)
        {
            this.name = name;
            if(window.localStorage)
            {
                localStorage.setItem('User-name',this.name);
            }
            this.updateView();
        };
        this.updateView = function()
        {
            this.domElements.view.innerHTML = "Bienvenue "+this.getName();
        }

    };


    /*
    * Gére l'affichage et le rendu des écrans du jeu
     */
    var Screen = function(domContainer,parentContainer, afterDisplayCallback)
    {

        this.templateStorage = [];
        if(afterDisplayCallback)
        {
            this.afterDisplayCallback = afterDisplayCallback;
        }

        if(domContainer) {
            this.domContainer = (typeof(domContainer) == "string" ) ? document.getElementById(domContainer) : domContainer;

            if(parentContainer) {
                this.parentContainer = (typeof(parentContainer) == "string" ) ? document.getElementById(parentContainer) : domContainer;
                this.parentContainer.addEventListener('click', function(e)
                {
                    this.handleClick(e);
                }.bind(this));
            }

        }
        else
        {
            throw new Error('domContainer doit etre fourni pour instancier un écran');
        }
        this.handleClick = function(e)
        {
            if(e.target.nodeName!='INPUT') {
                if (this.domContainer.classList.contains('screen-expanded')) {
                    this.close();
                }
                else {
                    this.display();
                }
            }
        }.bind(this);
        this.template = function(domElement,params)
        {
            for(var i in params)
            {
                var obj = {};
                obj[domElement] = document.getElementById(domElement).innerHTML;
                this.templateStorage.push(obj);
                if(!r) {
                    var r = document.getElementById(domElement).innerHTML.replace('%' + i + '%', params[i]);
                }
                else
                {
                    r = r.replace('%' + i + '%', params[i]);
                }
                document.getElementById(domElement).innerHTML = r;

            }
        };
        this.templateRestore = function()
        {
            var i = 0;
            var l = this.templateStorage.length;
            for(i; i<l; i++)
            {
                document.getElementById(Object.keys(this.templateStorage[i])[0]).innerHTML = Object.values(this.templateStorage[i])[0];
            }
        };
        this.display = function()
        {
            this.domContainer.classList.add('screen-expanded');

            if(this.afterDisplayCallback)
            {
                this.afterDisplayCallback();
            }
        };
        this.close = function()
        {
            this.domContainer.classList.remove('screen-expanded');
        }
    };


    /*
    * Gére les cartes
    */
    var Card = function(fruit)
    {
        this.fruit = fruit;
        this.domElement = document.createElement('div');
        this.domElement.className = 'card';

        this.domFruitElement = document.createElement('div');
        this.domFruitElement.className = 'fruit '+fruit;

        this.domElement.appendChild(this.domFruitElement);
        this.selected = 0;
        this.found = 0;

    };

    /*
    * Gere le compte à rebour de fin de partie
    */
    var Timer = function(tps,finishedCallback)
    {
        this.isStarted = false;
        this.totalTime = tps;
        this.elapsedTime = 0;
        this.isFinished = false;
        this.instance = null;
        this.domElement = document.getElementById('timer-progress');
        if(finishedCallback)
        {
            this.finishedCallback = finishedCallback;
        }

        this.start = function()
        {
            this.isStarted = true;
            this.run();
        };

        this.run = function()
        {
            this.elapsedTime+=1;
            this.domElement.style.width = ((this.elapsedTime/this.totalTime)*100)+'%';

            if(this.elapsedTime<this.totalTime) {
                this.instance = window.setTimeout(this.run.bind(this), 1000);
            }
            else
            {
                this.isFinished = true;
                window.clearTimeout(this.instance);
                if(typeof(this.finishedCallback == 'function'))
                {
                    this.finishedCallback();
                }
            }

        };
        this.stop = function()
        {
            this.isFinished = true;
            window.clearTimeout(this.instance);
        }
    };



    /*
    * Gere le classement
    */
    var Leaderboard = function()
    {
        this.readUrl = "api/leaderboard/read.php";
        this.createUrl = "api/leaderboard/create.php";


        this.render = function(response)
        {
            var d = document.createDocumentFragment();
            var ol = document.createElement('ol');
            var i = 0;
            var l = response.length;

            if(l>0) {
                for (i; i < l; i++) {
                    if (response[i]) {
                        var li = document.createElement('li');
                        var span_name = document.createElement('span');
                        var span_score = document.createElement('span');
                        span_name.innerHTML = response[i].name;

                        var date = new Date(response[i].score_time*1000);
                        span_score.innerHTML = date.getMinutes() + " minutes " + date.getSeconds() + " secondes";

                        li.appendChild(span_name);
                        li.appendChild(span_score);
                        ol.appendChild(li);
                    }
                }

            }
            else
            {
                // Pas de résultats, on retourne une seule ligne qui indique à l'utilisateur qu'il n'y a pas de score enregistrés pour le moment
                var li = document.createElement('li');
                var span_norecord = document.createElement('span');
                span_norecord.innerHTML ="- Pas de meilleur temps -";
                li.appendChild(span_norecord);
                ol.appendChild(li);

            }

            // On insere les éléments dans le fragment et on retourne l'élément documentFragment
            d.appendChild(ol);
            return d;
        }
    };

    /*
    * Service http, en oie les requetes et ajax et recoit les données du serveur
    */
    var HttpService = function(params)
    {
        var url = params.url,
            method=params.method,
            data=params.data,
            sucessCallback=params.sucessCallback,
            errorCallback = params.errorCallback;

        var xhttp = new XMLHttpRequest();

        // onreadystate change est un événement, nous écoutons cet événement qui éxécute une fonction anonyme pendant l'envoie
        // de la reqûete ajax
        xhttp.onreadystatechange = function() {

            // La requete ajax renvoie deux propriétés : readyState et status
            // readyState a différentes valeurs pendant l'envoie de la requete, 4 signifie que la requête est complétée
            // status est le code http renvoyé, 200 signifie que tout s'est bien passé
            if (this.readyState == 4) {

                // responseTexte est une propriété renvoyée par la requête ajax, c'est le contenu retourné par la requête
               try
               {
                   var response = JSON.parse(this.responseText);
               }
                catch(e) {
                    console.log(e);
                    if (typeof(errorCallback) == "function") {
                        errorCallback(response);

                    }
                }

                if(this.status == 200 || this.status == 201) {

                    if(typeof(sucessCallback) == "function")
                    {
                        sucessCallback(response);
                    }
                }
                else
                {
                    if(typeof(errorCallback) == "function")
                    {
                        errorCallback(response);
                    }
                }
            }
        };

        /* La commande open permet de spécifier le protocole utilisé ( GET ou POST ) , l'adresse du script ou du fichier à
         executer, le troisieme parametre détermine si l requête va être envoyée de maniére asynchrone ou synchrone, vous devriez
         toujours laisser ce parametre sur "true" car si la requête est synchrone, tant que la requête ne sera pas terminée,
         le programme javascript sera mis en "pause" */
        xhttp.open(method, url, true);

        // la commande send permet d'envoyer la requete
        xhttp.send(JSON.stringify(data));
    };

    /*
    * Objet statique représentant le jeu
    */
    var Memory = {
        UserObj : new User(),
        _domGameContainer : document.getElementById('game-container'),
        _cardsDefinition : "Fruit-Pomme Fruit-Banane Fruit-Orange Fruit-CitronV Fruit-Goyave Fruit-Clementine Fruit-CitronJ Fruit-Fraise Fruit-PommeV Fruit-Peche Fruit-Raisin Fruit-Pasteque Fruit-Prune Fruit-Poire Fruit-Cerise Fruit-Framboise Fruit-Mangue Fruit-CeriseJ".split(" "),
        CardsCollection : [],
        firstCardClicked : false,
        cardsSelected : 0,
        cardsHistory : [],
        pairFound : 0,
        _defResetDelay : 800,
        _winScreen: new Screen('screen-win'),
        _loseScreen: new Screen('screen-lose'),
        _defTime: (5*60), //Temps limite pour trouver les paires, 5 minutes * 60 secondes = 300 secondes
        TimerObj : null,
        LeaderboardObj : new Leaderboard(),
        LeaderboardScreen : null,
        isFirstGame: true,

        start : function()
        {
            // Demander le nom de l'utilisateur avant de commencer
            this.UserInit();

            // Generer l'affichage des cartes
            this.generateCards();

            //Creer l'objet Timer
            this.TimerObj = new Timer(this._defTime,
                this.checkLose.bind(this)
            );

            //Afficher le classement au début du jeu seulement si le joueur n'a pas déjà fait de partie sur cette session
            if(this.isFirstGame)
            {
                this.isFirstGame = false;
                this.LeaderboardScreen = new Screen(
                    'screen-view-leaderboard',
                    'screen-leaderboard-container', function()
                    {
                        new HttpService({
                            url : this.LeaderboardObj.readUrl,
                            method : "GET",
                            sucessCallback: function(response){
                                var html = this.LeaderboardObj.render(response);
                                if(html)
                                {
                                    this.LeaderboardScreen.domContainer.innerHTML = '';
                                    this.LeaderboardScreen.domContainer.appendChild(html);
                                }
                            }.bind(this),
                            errorCallback: function(response){
                                console.log(response);
                            }
                        });
                    }.bind(this));
                this.LeaderboardScreen.display();

            }
        },
        UserInit : function()
        {
            if(!this.UserObj.getName())
            {
                this.UserObj.screenContainer.display();
            }
        },
        generateCards : function()
        {

            //Je crée ici un documentFragment pour boucler sur mes cartes et créer le html sans créer de reflow dans le dom
            var d = document.createDocumentFragment();
            var cards = this._cardsDefinition;

            // Je duplique mon tableau d'origine, nous avons besoin d'une paire pour chaque fruit
            cards = cards.concat(cards);

            // Je melange mon tableau
            cards = cards.shuffle1();

            // Je boucle sur mon taleau mélangé et j'écoute le click sur mes cartes
            var i = 0;
            var l = cards.length;
            for(i; i<l; i++)
            {
                let card = new Card(cards[i]);
                card.domElement.addEventListener('click',function(e)
                {
                    this.gameListener(e,card);


                }.bind(this));
                this.CardsCollection.push(card);
                d.appendChild(card.domElement);
            }

            // J'insére mon documentFragment dans mon conteneur principal
            this._domGameContainer.appendChild(d);

        },
        gameListener : function(e,card)
        {
            if(!this.TimerObj.isFinished) {
                // On s'assure que le joueur ne puisse pas selectionner plus de deux cartes
                if (this.cardsSelected < 2) {
                    if (!this.firstCardClicked) {
                        // Le joueur click sur sa premiere carte, on demarre le timer avec le temps par défaut
                        this.TimerObj.start();
                        // On défini la variable à true pour ne pas redemarrer le timer à chaque click
                        this.firstCardClicked = true;
                    }


                    //On Stocke dans le tableau cardsHistory les deux dernieres cartes séléctionnées par l'utilisateur si la carte n'a pas été déjà selectionnée
                    if (card.selected == 0 && card.found == 0) {
                        card.domElement.classList.add('flip-card');
                        this.cardsHistory.push(card);
                        card.selected = 1;
                        this.cardsSelected++;
                    }

                    //Si deux cartes ont été séléctionnées, on verifie si celles ci sont identiques
                    if (this.cardsHistory.length == 2) {
                        if (this.cardsHistory[0].fruit == this.cardsHistory[1].fruit) {
                            //Paire trouvée, on execute la méthode cardsFound()
                            this.cardsFound();
                        }

                        // On deselectionne les cartes retournées ( avec un petit temps d'attente pour que le joueur puisse voir les cartes retournées )
                        window.setTimeout(
                            this.resetCardsSelected.bind(this),this._defResetDelay
                        );
                    }
                }
            }

        },
        resetCardsSelected: function()
        {

            var i = 0;
            var l = this.cardsHistory.length;
            for(i; i<l; i++)
            {
                this.cardsHistory[i].selected = 0;

                // On ne retourne que les cartes qui n'ont pas été trouvées
                if(this.cardsHistory[i].found == 0) {
                    this.cardsHistory[i].domElement.classList.remove('flip-card');
                }
            }

            // On reinitialise les variables afin que le joueur puisse faire une autre tentative
            this.cardsSelected = 0;
            this.cardsHistory = [];

        },
        cardsFound: function()
        {
            var i = 0;
            var l = this.cardsHistory.length;
            for(i; i<l; i++)
            {
                /*
                 * Si les deux cartes sont identiques et si elles n'ont pas dékà été validées comme paire, on incrémente
                 * la variable pairFound et on indique que notre objet carte a été trouvée
                 */
                if(this.cardsHistory[i].selected == 1 && this.cardsHistory[i].found == 0)
                {
                    this.cardsHistory[i].found = 1;
                    this.pairFound++;
                }
            }

            this.checkWin();
        },
        checkWin: function()
        {
            // Si le joueur a découvert toutes les paires , il a gagné !
            if(this.pairFound == this.CardsCollection.length)
            {
                this.TimerObj.stop();
                var current_screen = this._winScreen;

                current_screen.template("screen-win-message1",{
                    "name" : this.UserObj.getName()
                });

                // On affiche dans le screen le temps mis par le joueur pour trouver toutes les paires
                var date = new Date(this.TimerObj.elapsedTime*1000);

                current_screen.template("screen-win-message2",{
                    "min" : date.getMinutes(),
                    "sec" : date.getSeconds()
                });

                // On affiche l'écran indiquant que le joueur a gagné
                current_screen.display();

                // Instanciation de mon objet qui va envoyer une requete http à mon api pour stockage du score du joueur
                new HttpService(
                    {
                        url : this.LeaderboardObj.createUrl,
                        data : {name : this.UserObj.getName(), score_time:this.TimerObj.elapsedTime},
                        method : "POST",
                        sucessCallback : function(response) {

                            current_screen.domContainer.querySelector('.js-action-replay').addEventListener('click',function()
                            {
                                current_screen.close();
                                current_screen.templateRestore();
                                Memory.replay();
                            });
                        },
                        errorCallback : function(response)
                        {
                            console.log(response);
                            current_screen.domContainer.querySelector('.js-action-replay').addEventListener('click',function()
                            {
                                current_screen.close();
                                current_screen.templateRestore();
                                Memory.replay();
                            });
                        }
                    });


            }
        },
        checkLose: function()
        {
            // Le temps est écoulé, le joueur a perdu, checkLose est appelée via le callback de l'objet Timer
            var current_screen = this._loseScreen;
            current_screen.template("screen-lose-message1",{
                "name" : this.UserObj.getName()
            });
            current_screen.display();
            current_screen.domContainer.querySelector('.js-action-replay').addEventListener('click',function()
            {
                current_screen.close();
                current_screen.templateRestore();
                Memory.replay();
            });
        },
        replay: function()
        {
            // On réinitialise certaines valeurs pour que le joueur puisse rejouer
            this.firstCardClicked = false;
            this.CardsCollection = [];
            this.cardsSelected = 0;
            this.cardsHistory = [];
            this.pairFound = 0;
            this.TimerObj = null;
            this._domGameContainer.innerHTML = '';
            this.start();

        }

    };

    Memory.start();

})();
