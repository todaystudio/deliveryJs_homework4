"use strict";
const buttonAuth = document.querySelector('.button-auth'),
	modalAuth = document.querySelector('.modal-auth'),
	closeAuth = document.querySelector('.close-auth'),
	logInForm = document.querySelector('#logInForm'),
	loginInput = document.querySelector('#login'),
	passInput = document.querySelector('#password'),
	alertLogin = document.querySelector('#alertLogin'),
	alertPass = document.querySelector('#alertPass'),
	userName = document.querySelector('.user-name'),
	buttonOut = document.querySelector('.button-out'),
	cardsRestaurants = document.querySelector('.cards-restaurants'),
	containerPromo = document.querySelector('.container-promo'),
	restaurants = document.querySelector('.restaurants'),
	menu = document.querySelector('.menu'),
	logo = document.querySelector('.logo'),
	cardsMenu = document.querySelector('.cards-menu'),
	cartButton = document.querySelector("#cart-button"),
	modal = document.querySelector(".modal"),
	close = document.querySelector(".close"),
	headerMenu = document.querySelector('#headerMenu'),
	modalBody = document.querySelector('.modal-body'),
	modalPrice = document.querySelector('.modal-pricetag'),
	buttonClearCart = document.querySelector('.clear-cart');
	

let login = localStorage.getItem('Delivery');
const cart = [];

const getData = async (url) => {
	const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Ошибка по адресу ${url}, 
			статус ошибки: ${response.status}.`);
		}
		return await response.json();
};

const toggleModalAuth = () => {
	modalAuth.classList.toggle('is-open');
};
const toggleModal = () => {
	modal.classList.toggle("is-open");
};

const authorized = () => {
	const logOut = () => {
		login = '';
		localStorage.removeItem('Delivery');
		buttonAuth.style.display = '';
		buttonOut.style.display = '';
		userName.style.display = '';
		loginInput.classList.remove('not-value');
		alertLogin.textContent = 'Логин';
		alertLogin.style.color = '';
		passInput.classList.remove('not-value');
		alertPass.textContent = 'Пароль';
		alertPass.style.color = '';
		cartButton.style.display = '';
		buttonOut.removeEventListener('click', logOut);
		checkAuth();
	};
	console.log('Авторизован');
	userName.textContent = login;

	buttonAuth.style.display = "none";
	buttonOut.style.display = 'flex';
	userName.style.display = 'flex';
	cartButton.style.display = 'flex';

	buttonOut.addEventListener('click', logOut);
};

const notAuthorized = () => {
	console.log('Не авторизован');

	const logIn = (e) => {
		e.preventDefault();	
		if (!loginInput.value) {
			loginInput.classList.add('not-value');
			alertLogin.textContent = 'Введите логин';
			alertLogin.style.color = 'red';
		} if (!passInput.value) {
			passInput.classList.add('not-value');
			alertPass.textContent = 'Введите пароль';
			alertPass.style.color = 'red';
		} else {
			login = loginInput.value;
			localStorage.setItem('Delivery', login);
			toggleModalAuth();
			buttonAuth.removeEventListener('click', toggleModalAuth);
			closeAuth.removeEventListener('click', toggleModalAuth);
			logInForm.removeEventListener('submit', logIn);
			logInForm.reset();
			checkAuth();
		}
	};

	buttonAuth.addEventListener('click', toggleModalAuth);
	closeAuth.addEventListener('click', toggleModalAuth);
	logInForm.addEventListener('submit', logIn);
};

const checkAuth = () => {
	if (login) {
		authorized();
	} else {
		notAuthorized();
	}
};

checkAuth();

const renderHeader = ({ kitchen, name, stars, price }) => {
	headerMenu.innerHTML = '';
	const header = `
		<h2 class="section-title restaurant-title">${name}</h2>
		<div class="card-info">
			<div class="rating">
				${stars}
			</div>
			<div class="price">От ${price} ₽</div>
			<div class="category">${kitchen}</div>
		</div>
	`;
	headerMenu.insertAdjacentHTML('beforeend', header);
};

const createCardRestaurants = ({ image, name, time_of_delivery: timeOfDelivery, kitchen, price, stars, products }) => {
	const card = `
	<a class="card card-restaurant" 
		data-products="${products}"
		data-name="${name}"
		data-kitchen="${kitchen}"
		data-stars="${stars}"
		data-price="${price}" >
		<img src="${image}" alt="${name}" class="card-image"/>
		<div class="card-text">
			<div class="card-heading">
				<h3 class="card-title">"${name}"</h3>
				<span class="card-tag tag">${timeOfDelivery} мин</span>
			</div>
			<!-- /.card-heading -->
			<div class="card-info">
				<div class="rating">
					${stars}
				</div>
				<div class="price">От ${price} ₽</div>
				<div class="category">${kitchen}</div>
			</div>
		</div>
	</a>
	`;

	cardsRestaurants.insertAdjacentHTML('beforeend', card);
};

const createCardGood = ({ description, id, image, name, price }) => {
	const card = document.createElement('div');
	card.className = 'card';
	card.insertAdjacentHTML('beforeend', `
			<img src="${image}" alt="${name}" class="card-image"/>
			<div class="card-text">
				<div class="card-heading">
					<h3 class="card-title card-title-reg">${name}</h3>
				</div>
				<div class="card-info">
					<div class="ingredients">
						${description}
					</div>
				</div>
				<div class="card-buttons">
					<button class="button button-primary button-add-cart" id="${id}">
						<span class="button-card-text">В корзину</span>
						<span class="button-cart-svg"></span>
					</button>
					<strong class="card-price card-price-bold">${price} ₽</strong>
				</div>
			</div>
	`);

	cardsMenu.insertAdjacentElement('beforeend', card);
};

const openGoods = (event) => {
	if (login) {
		const target = event.target;
		const restaurant = target.closest('.card-restaurant');
		if (restaurant) {
			cardsMenu.textContent = '';
			containerPromo.classList.add('hide');
			restaurants.classList.add('hide');
			menu.classList.remove('hide');
			getData(`../db/${restaurant.dataset.products}`)
			.then((data) => {
				data.forEach(createCardGood);
			});
			renderHeader(restaurant.dataset);
		}
	} else {
		toggleModalAuth();
	}
};

logo.addEventListener('click', () => {
	containerPromo.classList.remove('hide');
	restaurants.classList.remove('hide');
	menu.classList.add('hide');
});

function addToCart(e) {
	const target = e.target;
	const buttonAddToCart = target.closest('.button-add-cart');
	if (buttonAddToCart) {
		const card = target.closest('.card');
		const title = card.querySelector('.card-title-reg').textContent;
		const cost = card.querySelector('.card-price').textContent;
		const id = buttonAddToCart.id;
		const food = cart.find((item) => {
			return item.id === id;
		});

		if (food) {
			food.count += 1;
		} else {	
			cart.push({
				id,
				title,
				cost,
				count: 1
			});
		}
		console.log(cart);
	}
};

function renderCart() {
	modalBody.textContent = '';
	cart.forEach(({ id, title, cost, count }) => {
		const itemCart = `
			<div class="food-row">
				<span class="food-name">${title}</span>
				<strong class="food-price">${cost}</strong>
				<div class="food-counter">
					<button class="counter-button counter-minus" data-id="${id}">-</button>
					<span class="counter">${count}</span>
					<button class="counter-button counter-plus" data-id="${id}">+</button>
				</div>
			</div>
		`;
		modalBody.insertAdjacentHTML('afterbegin', itemCart);
	});
	const totalPrice = cart.reduce((res, item) => {
		return res + (parseFloat(item.cost)) * item.count;
	}, 0);
	modalPrice.textContent = totalPrice + ' ₽';
};

function changeCount(e) {
	const target = e.target;
	if (target.classList.contains('counter-button')) {
		const food = cart.find((item) => {
			return item.id === target.dataset.id;
		});
		if (target.classList.contains('counter-minus')) {
			food.count--;
			if (food.count === 0) {
				cart.splice(cart.indexOf(food), 1)
			}
		}
		if (target.classList.contains('counter-plus')) food.count++;
		renderCart();
	}
};

function init() {
	getData('../db/partners.json')
	.then((data) => {
		data.forEach(createCardRestaurants)
	});

	cartButton.addEventListener("click", () => {
		renderCart();
		toggleModal();
	});
	buttonClearCart.addEventListener('click', () => {
		cart.length = 0;
		renderCart();
	});

	modalBody.addEventListener('click', changeCount);
	cardsMenu.addEventListener('click', addToCart);
	close.addEventListener("click", toggleModal);
	buttonAuth.addEventListener('click', toggleModalAuth);
	closeAuth.addEventListener('click', toggleModalAuth);
	cardsRestaurants.addEventListener('click', openGoods);
};

init();