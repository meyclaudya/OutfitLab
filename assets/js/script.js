// Search Functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');
    const mobileSearchContainer = document.querySelector('.mobile-search-container');
    const mobileSearchInput = mobileSearchContainer?.querySelector('.search-input');
    const productCards = document.querySelectorAll('.product-card');

    // Function to check if device is mobile/tablet
    function isMobileDevice() {
        return window.innerWidth <= 992;
    }

    // Function to perform search
    function performSearch(searchTerm) {
        const searchTermLower = searchTerm.toLowerCase().trim();
        console.log('Performing search for:', searchTermLower); // Log search term
        
        let productsToDisplay = [];

        if (searchTermLower === '') {
            // If search term is empty, render products based on current page category
            console.log('Search term empty, rendering by page category.');
            renderProductsByPageCategory(); 
        } else {
            // If search term is not empty, filter global allProducts
            console.log('Filtering all products (' + allProducts.length + ' items) by search term.'); // Log global products count for filter
            productsToDisplay = allProducts.filter(product => {
                const title = product.title ? product.title.toLowerCase() : '';
                const category = product.category ? product.category.toLowerCase() : '';
                const pageCategory = product.pageCategory ? product.pageCategory.toLowerCase() : '';

                // Check if title, category, or pageCategory includes the search term
                return title.includes(searchTermLower) || 
                       category.includes(searchTermLower) ||
                       pageCategory.includes(searchTermLower);
            });

            console.log('Search results (' + productsToDisplay.length + ' items):', productsToDisplay); // Log search results
            renderProducts(productsToDisplay); // Render the search results
        }
    }

    // Function to reset search results
    function resetSearch() {
        productCards.forEach(card => {
            card.style.display = 'flex';
        });
    }

    // Desktop search
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            if (!isMobileDevice()) {
                performSearch(this.value);
            }
        });
    }

    // Mobile search
    if (mobileSearchBtn && mobileSearchContainer && mobileSearchInput) {
        // Toggle search container
        mobileSearchBtn.addEventListener('click', function() {
            mobileSearchContainer.classList.toggle('active');
            if (mobileSearchContainer.classList.contains('active')) {
                mobileSearchInput.focus();
            } else {
                mobileSearchInput.value = '';
                resetSearch();
            }
        });

        // Handle search input
        mobileSearchInput.addEventListener('input', function() {
            performSearch(this.value);
        });

        // Close search container when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileSearchContainer.classList.contains('active')) {
                if (!mobileSearchContainer.contains(e.target) && !mobileSearchBtn.contains(e.target)) {
                    mobileSearchContainer.classList.remove('active');
                    mobileSearchInput.value = '';
                    resetSearch();
                }
            }
        });
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        if (!isMobileDevice()) {
            if (mobileSearchContainer) {
                mobileSearchContainer.classList.remove('active');
            }
            if (mobileSearchInput) {
                mobileSearchInput.value = '';
            }
        }
        resetSearch();
    });
});

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Global variable to store all fetched products
let allProducts = [];

// Function to fetch and display products (initial load)
async function fetchAndDisplayProducts() {
    try {
        console.log('Fetching products...');
        const response = await fetch('../php/get_all_products.php');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Check if data is an array
        if (!Array.isArray(data)) {
            console.error('Received data is not an array:', data);
            throw new Error('Invalid data format received from server');
        }
        
        console.log('Products received:', data);
        
        // Store products globally
        allProducts = data; 
        console.log('All products stored globally (' + allProducts.length + ' items):', allProducts); // Log global products

        // Render initial products based on page category
        renderProductsByPageCategory();
        
    } catch (error) {
        console.error('Error fetching products:', error);
        const productGrid = document.getElementById('productGrid');
        if (productGrid) {
            productGrid.innerHTML = '<p class="error-message">Terjadi kesalahan saat memuat produk. Silakan coba lagi nanti.</p>';
        }
    }
}

// Function to render products into the grid
function renderProducts(productsToRender) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    console.log('Rendering ' + productsToRender.length + ' products.'); // Log rendering count

    if (productsToRender.length === 0) {
        productGrid.innerHTML = '<p class="no-products">Tidak ada produk yang tersedia</p>';
        return;
    }

    productGrid.innerHTML = productsToRender.map(product => `
        <div class="product-card" data-id="${product.id}" data-is-sale="${product.isSale}">
            <img src="${product.image}" alt="${product.title}" class="product-img">
            <h3 class="product-title">${product.title}</h3>
            ${product.isSale ? 
                `<p class="product-price"><span class="original-price">Rp ${product.originalPrice.toLocaleString()}</span> Rp ${product.price.toLocaleString()}</p>` :
                `<p class="product-price">Rp ${product.price.toLocaleString()}</p>`
            }
            <p class="product-stock">Stok: ${product.stock}</p>
            <button class="add-to-cart">Tambah ke Keranjang</button>
        </div>
    `).join('');
    
    // Re-attach event listeners after rendering
     attachAddToCartListeners();
}

// Function to render products based on current page category
function renderProductsByPageCategory() {
     // Get current page path
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop().split('.')[0];
    console.log('Current page name (from URL) for initial render:', pageName);

    let filteredProducts = [];
    if (pageName === 'index') {
        // Filter produk untuk halaman beranda (hanya yang pageCategory 'beranda')
        console.log(`Filtering products for index page (pageCategory 'beranda').`);
         filteredProducts = allProducts.filter(product => 
            product.pageCategory && 
            product.pageCategory.toLowerCase() === 'beranda' 
        );
    } else if (pageName === 'sale') {
        // Tampilkan produk dengan isSale: true di halaman sale
        console.log(`Filtering products for sale page.`);
        filteredProducts = allProducts.filter(product => product.isSale === true);
    } else {
        // Tampilkan produk berdasarkan pageCategory di halaman lain (pria, wanita, anak, accessories)
        console.log(`Filtering products for page category: ${pageName}`);
        filteredProducts = allProducts.filter(product => 
            product.pageCategory && 
            product.pageCategory.toLowerCase().includes(pageName) 
        );
    }

    console.log('Initial filtered products for display:', filteredProducts);
    renderProducts(filteredProducts); // Render the filtered products
}

// Function to attach Add to Cart listeners (using delegation would be better for performance on large grids)
function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productId = productCard.dataset.id;
            const isSale = productCard.dataset.isSale === 'true';
            
            // Find product in the global allProducts array (or filteredProducts if preferred)
            const product = allProducts.find(p => p.id === productId);
            if (!product) {
                console.error('Product not found:', productId);
                return;
            }
            
            // Check stock
            if (product.stock <= 0) {
                showNotification('Stok habis!', 'error');
                return;
            }
            
            // Add to cart
            const existingItem = cart.find(item => item.id === productId && item.isSale === isSale);
            if (existingItem) {
                if (existingItem.quantity < product.stock) {
                    existingItem.quantity++;
                } else {
                    showNotification('Stok tidak mencukupi!', 'error');
                    return;
                }
            } else {
                cart.push({
                    id: productId,
                    title: product.title,
                    price: product.price,
                    image: product.image, // Store image path
                    quantity: 1,
                    isSale: isSale
                });
            }
            
            // Update localStorage and cart count
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            // Show success message
            showNotification('Produk berhasil ditambahkan ke keranjang!', 'success');
        });
    });
}

// Function to update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count'); // Menggunakan kelas .cart-count
    if (cartCount) {
        // Ensure the 'cart' variable is up-to-date before calculating
        cart = JSON.parse(localStorage.getItem('cart')) || []; // Re-read from localStorage just to be sure
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        console.log('Updating cart count. Total items:', totalItems);
        cartCount.textContent = totalItems;
    }
}

// Function to update item quantity
function updateQuantity(productId, isSale, change) {
    const item = cart.find(item => item.id === productId && item.isSale === isSale);
    if (item) {

        const newQuantity = item.quantity + change;

        if (newQuantity > 0) {
            
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update tampilan tanpa refresh
            renderCartItems(); 
            updateCartCount();
        } else if (newQuantity === 0) {
            // Hapus item jika kuantitas jadi 0
            removeFromCart(productId, isSale); // removeFromCart akan memanggil render dan update count
        }
    }
}

// Function to remove item from cart
function removeFromCart(productId, isSale) {
    // Filter cart untuk menghapus item
    cart = cart.filter(item => !(item.id === productId && item.isSale === isSale));
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update tampilan tanpa refresh
    renderCartItems();
    updateCartCount();
}

// Function to clear cart
function clearCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    // Update tampilan tanpa refresh
    renderCartItems();
    updateCartCount();
}

// Function to render cart items on cart.html
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return; // Hanya berjalan di cart.html

    console.log('Rendering cart items...');
    // Pastikan cart data konsisten sebelum dirender
    let currentCart = JSON.parse(localStorage.getItem('cart')) || [];
     currentCart = currentCart.map(item => ({
         ...item,
         id: String(item.id),
         isSale: !!item.isSale 
     }));
     // Update global cart variable if necessary, or just use currentCart
     cart = currentCart; // Update global cart variable

    console.log('Cart data for rendering:', cart);

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Keranjang belanja kosong</p>';
        console.log('Cart is empty. Displaying empty message.');
        // Update total to 0 if cart is empty
        const totalElement = document.getElementById('cartTotal');
        if (totalElement) {
             totalElement.textContent = 'Total: Rp 0';
        }

    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
             if (!item.id || !item.title || item.price === undefined || item.quantity === undefined || item.isSale === undefined || !item.image) {
                console.error('Invalid or incomplete item in cart during render:', item);
                return ''; 
            }
            return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <span>${item.title}</span>
                <span>Rp ${item.price.toLocaleString()}</span>
                <span>
                    <button onclick="updateQuantity('${item.id}', ${item.isSale}, -1)">-</button>
                    ${item.quantity}
                    <button onclick="updateQuantity('${item.id}', ${item.isSale}, 1)">+</button>
                </span>
                <span>Rp ${(item.price * item.quantity).toLocaleString()}</span>
                <button onclick="removeFromCart('${item.id}', ${item.isSale})">Hapus</button>
            </div>
        `;
        }).join('');
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalElement = document.getElementById('cartTotal');
        if (totalElement) {
             totalElement.textContent = `Total: Rp ${total.toLocaleString()}`;
        }
       
        console.log('Cart items rendered. Total:', total);
    }
     // Pastikan ikon keranjang juga terupdate setelah merender item
     updateCartCount();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load and display products (on product pages)
    if (document.getElementById('productGrid')) {
        fetchAndDisplayProducts();
    }
    
    // Update cart count (on all pages with .cart-count)
    updateCartCount();
    
    // Cart page functionality (only for cart.html)
    // Initial render if on cart page
    const cartItemsContainer = document.getElementById('cartItems');
    if (cartItemsContainer) {
         renderCartItems(); // Render cart when page is loaded
    }
});

// Menambahkan event listener ke icon keranjang
document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
});

// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const categoryNav = document.querySelector('.category-nav');

    if (mobileMenuBtn && categoryNav) {
        mobileMenuBtn.addEventListener('click', () => {
            categoryNav.classList.toggle('active');
        });

        // Close menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                categoryNav.classList.remove('active');
            }
        });
    }
});

// Email Subscription Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const subscriptionForm = document.querySelector('.subscription-form');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                showNotification('Terima kasih telah berlangganan newsletter kami!', 'success');
                emailInput.value = '';
            } else {
                showNotification('Mohon masukkan alamat email yang valid', 'error');
            }
        });
    }
});

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add notification to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Get product price
function getProductPrice(productCard) {
    const salePrice = productCard.querySelector('.sale-price');
    const regularPrice = productCard.querySelector('.product-price');
    
    if (salePrice) {
        return salePrice.textContent.trim();
    } else if (regularPrice) {
        // Remove any child elements (like original price) and get only the price text
        const priceText = Array.from(regularPrice.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join('');
        return priceText || regularPrice.textContent.trim();
    }
    
    return '0';
}

// Get product image
function getProductImage(productCard) {
    const imgElement = productCard.querySelector('.product-img');
    return imgElement ? imgElement.src : '';
}
