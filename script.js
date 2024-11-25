document.addEventListener('DOMContentLoaded', () => {
    let cartObject = {};
    const quentity = document.querySelector('.quantity');
    const cartItems = document.querySelector('.cart-items');
    const emptyCart = document.querySelector('.empty-content');
    const cartTotal = document.querySelector('.cart-total');
    const confirmButton = document.querySelector('.confirm-order');
    const overlay = document.querySelector('.overlay');
    const orderSummaryContainer = document.querySelector('.order-summary');
    const startNewOrderButton = document.querySelector('.start-new-order');
    const cartSummary = document.querySelector('.cart-summary');
    const dessertFlex = document.getElementById('dessert-flex');

    let productDataArray = [];

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            productDataArray = data;
            initializeDessertCart();
        });

    const initializeDessertCart = () => {
        productDataArray.forEach(product => {
            const card = createProductCard(product);
            dessertFlex.appendChild(card);
            setupCardEvents(card, product);
        });
    };

    const createProductCard = (product) => {
        const card = document.createElement('div');
        card.classList.add('products-card');
        card.innerHTML = `
            <picture>
                <source media="(max-width: 768px)" srcset="${product.image.mobile}">
                <source media="(max-width: 1024px)" srcset="${product.image.tablet}">
                <img class="image-product" src="${product.image.desktop}" alt="${product.name}">
            </picture>        
            <button class="addToCart"><img src="assets/images/icon-add-to-cart.svg" alt="icon-add-to-cart">Add to Cart</button>
            <div class="counter hidden">
                <img class="icon-decrement" src="assets/images/icon-decrement-quantity.svg" alt="icon-decrement-quantity">
                <span>0</span>
                <img class="icon-increment" src="assets/images/icon-increment-quantity.svg" alt="icon-increment-quantity">
            </div>
            <p>${product.category}</p>
            <h2 class="product-name">${product.name}</h2>
            <h3 class="price">$${product.price.toFixed(2)}</h3>
        `;
        return card;
    };

    const setupCardEvents = (card, product) => {
        const addToCartButton = card.querySelector('.addToCart');
        const counterElement = card.querySelector('.counter');
        const productImage = card.querySelector('.image-product');
        const productName = product.name;
        const productPrice = product.price;

        const updateQuantity = (quantity) => {
            counterElement.querySelector('span').textContent = quantity;
            updateCartDisplay();
        };

        addToCartButton.addEventListener('click', () => {
            addToCartButton.classList.add('hidden');
            counterElement.classList.remove('hidden');
            productImage.classList.add('active');
            if (!cartObject[productName]) {
                cartObject[productName] = { price: productPrice, quantity: 1 };
            } else {
                cartObject[productName].quantity += 1;
            }
            updateQuantity(cartObject[productName].quantity);
        });

        card.querySelector('.icon-increment').addEventListener('click', () => {
            if (!cartObject[productName]) {
                cartObject[productName] = { price: productPrice, quantity: 1 };
            } else {
                cartObject[productName].quantity += 1;
            }
            updateQuantity(cartObject[productName].quantity);
        });

        card.querySelector('.icon-decrement').addEventListener('click', () => {
            if (cartObject[productName] && cartObject[productName].quantity > 0) {
                cartObject[productName].quantity -= 1;
                if (cartObject[productName].quantity === 0) {
                    delete cartObject[productName];
                    addToCartButton.classList.remove('hidden');
                    counterElement.classList.add('hidden');
                    productImage.classList.remove('active');
                }
                updateQuantity(cartObject[productName].quantity);
            }
        });
    };

    const updateCartDisplay = () => {
        cartItems.innerHTML = '';
        let totalQuantity = 0;
        let totalPrice = 0;

        for (const [productName, product] of Object.entries(cartObject)) {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div>
                    <h2>${productName}</h2>
                    <div class="pdcs-infos">
                        <p class="product-quantity">${product.quantity}x</p>
                        <p class="single-price">@ $${product.price.toFixed(2)}</p>
                        <p class="total-price">$${(product.quantity * product.price).toFixed(2)}</p>
                    </div>
                </div>
                <svg class="icon-remove" 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="10" height="10" fill="none"
                    viewBox="0 0 10 10">
                    <path d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/>
                </svg>
            `;
            cartItems.appendChild(cartItem);
            totalQuantity += product.quantity;
            totalPrice += product.quantity * product.price;

            cartItem.querySelector('.icon-remove').addEventListener('click', () => {
                delete cartObject[productName];
                document.querySelectorAll('.products-card').forEach(card => {
                    if (card.querySelector('.product-name').textContent === productName) {
                        card.querySelector('.addToCart').classList.remove('hidden');
                        card.querySelector('.counter').classList.add('hidden');
                        card.querySelector('.counter span').textContent = '0';
                        card.querySelector('.image-product').classList.remove('active');
                    }
                });
                updateCartDisplay();
            });
        }

        quentity.textContent = totalQuantity;
        emptyCart.style.display = totalQuantity > 0 ? 'none' : 'block';
        cartSummary.style.display = totalQuantity > 0 ? 'block' : 'none';
        cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
    };

    confirmButton.addEventListener('click', () => {
        overlay.style.display = 'block';
        let summaryHtml = '';
        let totalPrice = 0;

        for (const [productName, product] of Object.entries(cartObject)) {
            const productInfo = productDataArray.find(p => p.name === productName);
            if (productInfo) {  // Check if productInfo is defined
                summaryHtml += `
                    <div class="summary-item">
                        <div class="final-infos">
                            <img class="image-thumbnail" src="${productInfo.image.thumbnail}" alt="${productName} thumbnail">
                            <div>
                                <h2>${productName}</h2>
                                <div class="final-div-infos">
                                    <p class="product-quantity">${product.quantity}x</p>
                                    <p class="single-price">@ $${product.price.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                        <p class="final-price">$${(product.quantity * product.price).toFixed(2)}</p>
                    </div>
                `;
                totalPrice += product.quantity * product.price;
            }
        }

        summaryHtml += `<p class ="final-total">Order Total <strong>$${totalPrice.toFixed(2)}</strong></p>`;
        orderSummaryContainer.innerHTML = summaryHtml;
    });

    startNewOrderButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        cartObject = {};
        cartItems.innerHTML = '';
        quentity.textContent = '0';
        cartTotal.textContent = 'Total: $0.00';
        cartSummary.style.display = 'none';
        emptyCart.style.display = 'block';
        document.querySelectorAll('.addToCart').forEach(button => button.classList.remove('hidden'));
        document.querySelectorAll('.counter').forEach(counter => counter.classList.add('hidden'));
        document.querySelectorAll('.image-product').forEach(image => image.classList.remove('active'));
    });
});