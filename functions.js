(function(){
   "use strict";

   var Saladus = function(){

     // SEE ON SINGLETON PATTERN
     if(Saladus.instance){
       return Saladus.instance;
     }
     //this viitab Saladus fn
     Saladus.instance = this;

     this.routes = Saladus.routes;
     // this.routes['home-view'].render()

     console.log('Saladuste hoidlas');

     // KÕIK muuutujad, mida muudetakse ja on rakendusega seotud defineeritakse siin
     this.click_count = 0;
     this.currentRoute = null;
     console.log(this);

     // hakkan hoidma kõiki purke
     this.secrets = [];

     // Kui tahan Moosipurgile referenci siis kasutan THIS = MOOSIPURGI RAKENDUS ISE
     this.init();
   };

   window.Saladus = Saladus; // Paneme muuutja külge

   Saladus.routes = {
     'home-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>avaleht');
       }
     },
     'list-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
         console.log('>>>>loend');



       }
     },
     'add-view': {
       'render': function(){
         // käivitame siis kui lehte laeme
       }
     },
     'settings': {
       'render': function(){
         // käivitame siis kui lehte laeme
       }
   }};

   // Kõik funktsioonid lähevad Moosipurgi külge
   Saladus.prototype = {

     init: function(){
       console.log('Rakendus läks tööle');

       //kuulan aadressirea vahetust
       window.addEventListener('hashchange', this.routeChange.bind(this));

       // kui aadressireal ei ole hashi siis lisan juurde
       if(!window.location.hash){
         window.location.hash = 'home-view';
         // routechange siin ei ole vaja sest käsitsi muutmine käivitab routechange event'i ikka
       }else{
         //esimesel käivitamisel vaatame urli üle ja uuendame menüüd
         this.routeChange();
       }

       //saan kätte purgid localStorage kui on
       if(localStorage.secrets){
           //võtan stringi ja teen tagasi objektideks
           this.secrets = JSON.parse(localStorage.secrets);
           console.log('laadisin localStorageist massiiivi ' + this.secrets.length);

           //tekitan loendi htmli
           this.secrets.forEach(function(secret){

               var new_secret = new Secret(secret.id, secret.saladus, secret.date);

               var li = new_secret.createHtmlElement();
               document.querySelector('.list-of-secrets').appendChild(li);

           });

       }else{

		   //küsin AJAXIGA
			var xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function() {
				if (xhttp.readyState == 4 && xhttp.status == 200) {

					console.log(xhttp.responseText);
					//tekst -> objekktideks
					Saladus.instance.secrets = JSON.parse(xhttp.responseText);
					console.log(Saladus.instance.secrets);

					//teen purgid htmli
					Saladus.instance.secrets.forEach(function(secret){

					   var new_secret = new Secret(secret.id, secret.saladus, secret.date);

					   var li = new_secret.createHtmlElement();
					   document.querySelector('.list-of-secrets').appendChild(li);

				   });

				   //salvestan localStoragisse
				   localStorage.setItem('secrets', JSON.stringify(Saladus.instance.secrets));


				}
			};
			xhttp.open("GET", "save.php", true);
			xhttp.send();


	   }


       // esimene loogika oleks see, et kuulame hiireklikki nupul
       this.bindEvents();

     },

     bindEvents: function(){
       document.querySelector('.add-new-secret').addEventListener('click', this.addNewClick.bind(this));

       //kuulan trükkimist otsikastis
       document.querySelector('#search').addEventListener('keyup', this.search.bind(this));

     },
	 deleteSecret: function(event){

		// millele vajutasin SPAN
		console.log(event.target);

		// tema parent ehk mille sees ta on LI
		console.log(event.target.parentNode);

		//mille sees see on UL
		console.log(event.target.parentNode.parentNode);

		//id
		console.log(event.target.dataset.id);

		var c = confirm("Oled kindel?");

		// vajutas no, pani ristist kinni
		if(!c){	return; }

		//KUSTUTAN
		console.log('kustutan');

		// KUSTUTAN HTMLI
		var ul = event.target.parentNode.parentNode;
		var li = event.target.parentNode;

		ul.removeChild(li);

		//KUSTUTAN OBJEKTI ja uuenda localStoragit

		var delete_id = event.target.dataset.id;

		for(var i = 0; i < this.secrets.length; i++){

			if(this.secrets[i].id == delete_id){
				//see on see
				//kustuta kohal i objekt ära
				this.secrets.splice(i, 1);
				break;
			}
		}

		localStorage.setItem('secrets', JSON.stringify(this.secrets));



	 },
     search: function(event){
         //otsikasti väärtus
         var needle = document.querySelector('#search').value.toLowerCase();
         console.log(needle);

         var list = document.querySelectorAll('ul.list-of-secrets li');
         console.log(list);

         for(var i = 0; i < list.length; i++){

             var li = list[i];

             // ühe listitemi sisu tekst
             var stack = li.querySelector('.content').innerHTML.toLowerCase();

             //kas otsisõna on sisus olemas
             if(stack.indexOf(needle) !== -1){
                 //olemas
                 li.style.display = 'list-item';

             }else{
                 //ei ole, index on -1, peidan
                 li.style.display = 'none';

             }

         }
     },

     addNewClick: function(event){
       //salvestame purgi
       //console.log(event);

       var saladus = document.querySelector('.saladus').value;
       var date = document.querySelector('.date').value;

       //console.log(saladus + ' ' + date);
       //1) tekitan uue secret'i
	   var id = guid();
       var new_secret = new Secret(id, saladus, date);

       //lisan massiiivi purgi
       this.secrets.push(new_secret);
       console.log(JSON.stringify(this.secrets));
       // JSON'i stringina salvestan localStorage'isse
       localStorage.setItem('secrets', JSON.stringify(this.secrets));


		//AJAX
		var xhttp = new XMLHttpRequest();

		//mis juhtub kui päring lõppeb
		xhttp.onreadystatechange = function() {

			console.log(xhttp.readyState);

			if (xhttp.readyState == 4 && xhttp.status == 200) {

				console.log(xhttp.responseText);
			}
		};

		//teeb päringu
		xhttp.open("GET", "save.php?id="+id+"&saladus="+saladus+"&date="+date, true);
		xhttp.send();


       // 2) lisan selle htmli listi juurde
       var li = new_secret.createHtmlElement();
       document.querySelector('.list-of-secrets').appendChild(li);


     },

     routeChange: function(event){

       //kirjutan muuutujasse lehe nime, võtan maha #
       this.currentRoute = location.hash.slice(1);
       console.log(this.currentRoute);

       //kas meil on selline leht olemas?
       if(this.routes[this.currentRoute]){

         //muudan menüü lingi aktiivseks
         this.updateMenu();

         this.routes[this.currentRoute].render();


       }else{
         /// 404 - ei olnud
       }


     },

     updateMenu: function() {
       //http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
       //1) võtan maha aktiivse menüülingi kui on
       document.querySelector('.active-menu').className = document.querySelector('.active-menu').className.replace('active-menu', '');

       //2) lisan uuele juurde
       //console.log(location.hash);
       document.querySelector('.'+this.currentRoute).className += ' active-menu';

     }

   }; //Saladuse LÕPP

   var Secret = function(new_id, new_saladus, new_date){
	 this.id = new_id;
     this.saladus = new_saladus;
     this.date = new_date;
     console.log('created new secret');
   };

   Secret.prototype = {
     createHtmlElement: function(){

       // võttes saladus ja date ->
       /*
       li
        span.letter
          M <- saladus esimene täht
        span.content
          saladus | date
       */

       var li = document.createElement('li');

       var span = document.createElement('span');
       span.className = 'letter';

       var letter = document.createTextNode(this.saladus.charAt(0));
       span.appendChild(letter);

       li.appendChild(span);

       var span_with_content = document.createElement('span');
       span_with_content.className = 'content';

       var content = document.createTextNode(this.saladus + ' | ' + this.date);
       span_with_content.appendChild(content);

       li.appendChild(span_with_content);

	   //DELETE nupp
	   var span_delete = document.createElement('span');
	   span_delete.style.color = "red";
	   span_delete.style.cursor = "pointer";

	   //kustutamiseks panen id kaasa
	   span_delete.setAttribute("data-id", this.id);

	   span_delete.innerHTML = " Delete";

	   li.appendChild(span_delete);

	   //keegi vajutas nuppu
	   span_delete.addEventListener("click", Saladus.instance.deleteSecret.bind(Saladus.instance));

       return li;

     }
   };

   //HELPER
   function guid(){
		var d = new Date().getTime();
		if(window.performance && typeof window.performance.now === "function"){
			d += performance.now(); //use high-precision timer if available
		}
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random()*16)%16 | 0;
			d = Math.floor(d/16);
			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
		});
		return uuid;
	}

   // kui leht laetud käivitan Saladuste rakenduse
   window.onload = function(){
     var app = new Saladus();
   };

})();
