(function() {
	'use strict'
	const listOfFavourites = document.querySelector('.favourites-list'),
		listOfCards = document.querySelector('.gallery-cards'),
		select = document.querySelector('.select-genre'),
		viewCard = document.querySelector('.gallery-type-cards'),
		viewList = document.querySelector('.gallery-type-list'),
		toggleButton = document.querySelector(".favourites-hamburger"),
		container = document.querySelector('.main-container');

	const favList = [],
		listOfAllGenres = [],
		listOfGanresFiltered = [];

	let closing = false;


	toggleButton.addEventListener( "click", function(e) {
		e.preventDefault();
		container.classList.toggle("is-active");
	});

	(async () => {
        	let url = 'http://my-json-server.typicode.com/moviedb-tech/movies/list/';
        	let response = await fetch(url);
        	let data = await response.json(); // читаем ответ в формате JSON
        	if(response.ok){
            		data.forEach(function(item, index){
                	listOfAllGenres.push(...item.genres);
                	printCards(item);
            	});
            	showModal(document.querySelectorAll('.card'), data);
            	printSelect(listOfAllGenres);
            	downloadingFavList();
        	}
    	})()

	function printSelect(list){
		list.forEach(function(elem, index){
			if (!listOfGanresFiltered.some(function(item){
				return item.toLowerCase() === elem.toLowerCase();
			})) {
				listOfGanresFiltered.push(elem);
				select.insertAdjacentHTML('beforeEnd',`
					<option value="${elem}">${elem[0].toUpperCase() + elem.slice(1, elem.length)}</option>
				`);
			}
		})
	}



	function printCards(data){
		let card = document.createElement('div');
		card.dataset.genres = data.genres;
		card.dataset.movieId = data.id;
		card.classList.add('card');
		card.insertAdjacentHTML('afterBegin',`
		<div class="card-img">
			<div class="to-favourites">&#9733;</div>
			<img src="${data.img}" alt="${data.name}">
		</div>
		<div class="card-text-container">
			<div class="card-title">
				<p class="card-name">${data.name}</p>
				<p class="card-year">${data.year}</p>
			</div>
			<div class="card-text">
				<p class="card-desc">${data.description}</p>
				<p class="card-genres">${data.genres}</p>
			</div>
		</div>
		`);
		listOfCards.append(card);
	}

	function showModal(item, data){
		item.forEach(function(elem, index){
			elem.addEventListener('click', function(e){
				if (closing === false && !e.target.classList.contains('to-favourites')) {
					const newModal = createModal(data[index]);
					modalListener(data[index], newModal);
					setTimeout(function(){
						document.querySelector('body').classList.add('open');
						newModal.classList.add('open-z');
					}, 10);
				} else if(closing === false && e.target.classList.contains('to-favourites')){
					addRemoveToFavourite(data[index])
				}
			})
		})
	}


	function createModal(data){
		let state = '';
		function checkFav(item){
			return item.id === data.id;
		}
		if (favList.some(checkFav)) {
			state = 'change-state';
		}

		const myModal = document.createElement('div');
		myModal.classList.add('modal');
		myModal.insertAdjacentHTML('afterBegin', `
			<div class="modal-overlay">
				<div class="modal-window">
					<div class="modal-info">
						<img class="modal-img" src="${data.img}" alt="${data.name}">
						<div class="modal-year">
							<span class="to-favourites ${state}">&#9733;</span>
							<span>${data.year}</span>
						</div>
						<div class="modal-genres">
							${data.genres}
						</div>
					</div>
					<div class="modal-text">
						<h3 class="modal-title">${data.name}</h3>
						<p class="modal-desc">${data.description}</p>
						<p class="modal-director">Director: ${data.director}</p>
						<p class="modal-starring">Starring: ${data.starring}</p>
					</div>
					<button class="modal-exit" data-close='true'>&#10006;</button>
				</div>
			</div>
			`);
		document.body.append(myModal);
		return myModal;
	}

	function modalListener(data, modal){
		modal.querySelector('.to-favourites').addEventListener('click', function(){
			this.classList.toggle('change-state');
			addRemoveToFavourite(data)
		})
	}

	function destroyModal(){
		document.querySelector('.modal').classList.remove('open-z');
		document.querySelector('.modal').remove();
		closing = false;
	}

	document.body.addEventListener('click', function(e){
		if (e.target.dataset.close){
			closing = true;
			document.querySelector('body').classList.remove('open');
			setTimeout(destroyModal, 300);
		}
	})

	function addRemoveToFavourite(data){
		function checkFav(item){
			return item.id === data.id;
		}
		document.querySelector(`.card[data-movie-id = '${data.id}'] .to-favourites`).classList.toggle('change-state');
		if (favList.some(checkFav)) {
			favList.splice(favList.findIndex(checkFav), 1);
			document.querySelector(`.favourites-list-item[data-movie-id='${data.id}']`).remove();
			sessionStorage.removeItem(data.id);
		} else {
			favList.push(data);
			listOfFavourites.insertAdjacentHTML('afterBegin', `
				<li data-movie-id='${data.id}' class="favourites-list-item ">
					<p>${data.name}</p>
					<div class="fav-item-del">✖</div>
				</li>
				`);
			sessionStorage.setItem(data.id, JSON.stringify({id: data.id, name: data.name}));
			
			listOfFavourites.querySelector(`.favourites-list-item .fav-item-del`).addEventListener('click', function(){
				favList.splice(favList.findIndex(checkFav), 1);
				document.querySelector(`.favourites-list-item[data-movie-id='${data.id}']`).remove();
				sessionStorage.removeItem(data.id);
				document.querySelector(`.card[data-movie-id = '${data.id}'] .to-favourites`).classList.toggle('change-state');
			})
		}
	}

	select.addEventListener('change', function(){
		listOfCards.querySelectorAll('.card').forEach(function(item, index){
			if(item.classList.contains('none')){
				item.classList.remove('none');
			}
			if (!item.dataset.genres.split(',').some(function(elem){
				return elem.toLowerCase() === select.value.toLowerCase();
			}) && select.value !== 'all' ){ 
				item.classList.add('none'); 
			}
		})
	})


	function downloadingFavList(){
		if (sessionStorage.length) {
			for (let i = 0; i < sessionStorage.length; i++) {
				let key = sessionStorage.key(i);
				favList.push(JSON.parse(sessionStorage.getItem(key)));
				listOfFavourites.insertAdjacentHTML('afterBegin', `
					<li data-movie-id='${key}' class="favourites-list-item ">
						<p>${JSON.parse(sessionStorage.getItem(key)).name}</p>
						<div class="fav-item-del">✖</div>
					</li>
				`);
				document.querySelector(`.card[data-movie-id='${key}'] .to-favourites`).classList.add('change-state');
	
				listOfFavourites.querySelector(`.favourites-list-item .fav-item-del`).addEventListener('click', function(){
					function checkFav(item){
						return item.id === key;
					}
					favList.splice(favList.findIndex(checkFav), 1);
					document.querySelector(`.favourites-list-item[data-movie-id='${key}']`).remove();
					sessionStorage.removeItem(key);
					document.querySelector(`.card[data-movie-id='${key}'] .to-favourites`).classList.remove('change-state');
				})
			}
		}
	}

	viewCard.addEventListener('click', function(){
		if(listOfCards.classList.contains('to-list')){
			listOfCards.classList.toggle('to-list');
			viewCard.classList.toggle('selected');
			viewList.classList.toggle('selected');
		}
	})

	viewList.addEventListener('click', function(){
		if(!listOfCards.classList.contains('to-list')){
			listOfCards.classList.toggle('to-list')
			viewList.classList.toggle('selected');
			viewCard.classList.toggle('selected');
		}
	})

})();
