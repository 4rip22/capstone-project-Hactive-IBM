document.addEventListener('DOMContentLoaded', () => {
    // --- Bagian E-commerce ---
    const productGrid = document.getElementById('productGrid');
    const cartCount = document.getElementById('cart-count');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    // Elemen modal keranjang
    const cartModal = document.getElementById('cartModal');
    const openCartModalBtn = document.getElementById('openCartModal');
    const closeCartModalBtn = document.getElementById('closeCartModal');
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const cartTotalPriceDisplay = document.getElementById('cartTotalPrice');
    const emptyCartMessage = document.getElementById('emptyCartMessage');

    // Elemen formulir kontak
    const contactForm = document.getElementById('contactForm');

    // Elemen Search
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    // Elemen Rekomendasi
    const recommendationGrid = document.getElementById('recommendationGrid');


    // Data produk (akan diisi dari API dan produk statis)
    let products = []; // Array untuk menyimpan semua produk yang diambil dari API
    let cart = loadCart(); // Keranjang akan menyimpan objek { product: {}, quantity: N }

    // Produk statis tambahan
    const staticProducts = [
        { id: 101, title: 'iPhone 15 Pro Max', price: 1500, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcu0vb2Gg-iybuhgRgBPZqsfyC5KYNcIEICA&s', category: 'electronics' }, 
        { id: 102, title: 'Laptop Gaming ROG Strix', price: 2000, image: 'https://gizmologi.id/wp-content/uploads/2020/08/asus-rog-strix-g1517.jpg', category: 'electronics' }, 
        { id: 103, title: 'Laptop Coding ThinkPad X1', price: 1800, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgwn8nv7Hxl_B6jWhQ1Lev15sqdAzx8k7C4Q&s', category: 'electronics' }, 
        { id: 105, title: 'Headphone Nirkabel', price: 50, image: 'https://s.alicdn.com/@sc04/kf/Haf12b41bbd274f5d9a491f35042bf7a6N.jpg_720x720q50.jpg', category: 'electronics' }, 
        { id: 106, title: 'Kamera Digital Pro', price: 300, image: 'https://foto.kontan.co.id/GWZlkiGGRZs8iHBzSKc06rDIvcQ=/smart/2020/08/04/600418153p.jpg', category: 'electronics' }, 
        { id: 107, title: 'Power Bank 20000mAh', price: 20, image: 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/115/MTA-179057787/samsung_samsung_power_bank_20000mah_3_port_45w_fast_charging_garansi_resmi_full01_p86sj7yp.jpg', category: 'electronics' }, // [Image of Power Bank 20000mAh]
        { id: 108, title: 'Mouse Gaming RGB', price: 15, image: 'https://img.lazcdn.com/g/p/eb6b0b2a09c3789fd6754b87efca469c.jpg_720x720q80.jpg', category: 'electronics' }, 
        { id: 109, title: 'Keyboard Mekanik', price: 45, image: 'https://images.tokopedia.net/img/cache/700/VqbcmM/2023/5/30/8a74e2f2-1ea2-4174-8237-bdd0f77dacbd.png', category: 'electronics' }, 
    ];


    // Fungsi untuk mengambil produk dari API
    async function fetchProducts() {
        productGrid.innerHTML = '<p class="loading-message">Memuat produk...</p>'; // Tampilkan pesan loading
        try {
            // Mengambil lebih banyak produk (misalnya 20) dari FakestoreAPI
            const response = await fetch('https://fakestoreapi.com/products?limit=20');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiProducts = await response.json();
            
            // Gabungkan produk dari API dengan produk statis
            // Pastikan ID produk statis tidak tumpang tindih dengan ID API (API biasanya dimulai dari 1)
            products = [...apiProducts, ...staticProducts];
            console.log('Produk berhasil dimuat dari API dan digabungkan dengan statis:', products); 
            
            if (products.length === 0) {
                console.warn('Tidak ada produk yang tersedia setelah penggabungan!');
            }
            renderProducts(products); // Render semua produk setelah dimuat
            renderRecommendations(); // Tampilkan rekomendasi awal
        } catch (error) {
            console.error('Error fetching products:', error);
            productGrid.innerHTML = '<p class="error-message">Gagal memuat produk. Silakan coba lagi nanti.</p>';
            showMessageBox('Gagal memuat produk dari server.', 'error');
        }
    }

    // Fungsi untuk menyimpan keranjang ke localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Keranjang disimpan ke localStorage:', JSON.parse(JSON.stringify(cart))); // Log keranjang saat disimpan (deep copy)
    }

    // Fungsi untuk memuat keranjang dari localStorage
    function loadCart() {
        const storedCart = localStorage.getItem('cart');
        let loadedCart = [];
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                // Validasi struktur: pastikan setiap item memiliki objek 'product' dengan 'id' dan 'quantity' adalah angka
                if (Array.isArray(parsedCart) && parsedCart.every(item => 
                    item && typeof item.quantity === 'number' && item.product && typeof item.product.id !== 'undefined' // ID bisa string/number
                )) {
                    loadedCart = parsedCart;
                } else {
                    console.warn('Struktur keranjang tidak valid ditemukan di localStorage. Mereset keranjang.', parsedCart);
                    localStorage.removeItem('cart'); // Hapus keranjang yang tidak valid
                }
            } catch (e) {
                console.error('Error saat mengurai keranjang dari localStorage. Mereset keranjang.', e);
                localStorage.removeItem('cart'); // Hapus keranjang yang rusak
            }
        }
        console.log('Keranjang dimuat dari localStorage:', loadedCart); // Log keranjang saat dimuat
        return loadedCart;
    }

    // Fungsi untuk memperbarui tampilan jumlah item di keranjang
    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        console.log('Total item di keranjang diperbarui:', totalItems); // Log total item
    }

    // Fungsi untuk merender produk ke halaman (digunakan untuk produk utama dan rekomendasi)
    function renderProductCards(containerElement, productsToRender, isRecommendation = false) {
        containerElement.innerHTML = ''; // Bersihkan container
        if (productsToRender.length === 0) {
            const noProductsMessage = document.createElement('p');
            noProductsMessage.textContent = isRecommendation ? 'Tidak ada rekomendasi.' : 'Tidak ada produk yang ditemukan.';
            containerElement.appendChild(noProductsMessage);
            return;
        }
        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            // Perhatikan penggunaan product.image dan product.title sesuai API
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/333333?text=Gambar+Tidak+Tersedia';">
                <h3>${product.title}</h3>
                <p class="price">Rp ${product.price ? (product.price * 15000).toLocaleString('id-ID') : 'N/A'}</p>
                <button class="btn btn-add-to-cart" data-id="${product.id}">Tambah ke Keranjang</button>
            `;
            containerElement.appendChild(productCard);
        });

        // Tambahkan event listener ke tombol "Tambah ke Keranjang"
        // Penting: Event listener harus ditambahkan setelah elemen dirender
        containerElement.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id); // Pastikan ID adalah angka
                console.log('Tombol "Tambah ke Keranjang" diklik. Product ID:', productId, 'Tipe:', typeof productId);
                addToCart(productId);
            });
        });
    }

    // Wrapper untuk render produk utama
    function renderProducts(productsToRender = products) {
        renderProductCards(productGrid, productsToRender);
    }

    // Fungsi untuk merender produk rekomendasi
    function renderRecommendations(lastAddedCategory = null, excludeProductId = null) {
        let recommendedProducts = [];
        if (lastAddedCategory && products.length > 0) {
            // Filter produk dari kategori yang sama, kecuali produk yang baru saja ditambahkan
            recommendedProducts = products.filter(p =>
                p.category === lastAddedCategory && p.id !== excludeProductId
            );
            // Acak dan ambil beberapa saja (misal 4)
            shuffle(recommendedProducts);
            recommendedProducts = recommendedProducts.slice(0, 4);
        }

        // Jika tidak ada rekomendasi berdasarkan kategori, atau kurang dari 4, ambil acak
        if (recommendedProducts.length < 4 && products.length > 0) {
            const remainingNeeded = 4 - recommendedProducts.length;
            const shuffledAllProducts = shuffle([...products]); // Salin dan acak semua produk
            let randomAdditions = shuffledAllProducts.filter(p =>
                !recommendedProducts.some(rp => rp.id === p.id) && p.id !== excludeProductId
            ).slice(0, remainingNeeded);
            recommendedProducts = [...recommendedProducts, ...randomAdditions];
        }
        console.log('Produk rekomendasi:', recommendedProducts); // Log rekomendasi
        renderProductCards(recommendationGrid, recommendedProducts, true);
    }


    // Fungsi untuk menambahkan produk ke keranjang (Create)
    function addToCart(productId) {
        console.log('Memulai addToCart untuk productId:', productId);
        const productToAdd = products.find(p => p.id === productId); // Dapatkan detail produk lengkap

        if (!productToAdd) {
            console.error('ERROR: Produk tidak ditemukan di daftar produk global saat addToCart:', productId);
            showMessageBox('Terjadi kesalahan: Produk tidak ditemukan.', 'error');
            return;
        }

        // Penting: Cari item di keranjang berdasarkan product.id yang ada di dalam objek product
        const existingItemIndex = cart.findIndex(item => item.product.id === productId); 
        console.log('Keranjang sebelum penambahan/pembaruan:', JSON.parse(JSON.stringify(cart))); // Log deep copy
        console.log('Existing item index:', existingItemIndex);

        if (existingItemIndex > -1) {
            // Jika produk sudah ada di keranjang, tingkatkan kuantitasnya
            cart[existingItemIndex].quantity++;
            console.log(`Kuantitas produk ${productToAdd.title} ditingkatkan menjadi ${cart[existingItemIndex].quantity}`);
        } else {
            // Jika produk belum ada, tambahkan sebagai item baru dengan objek produk lengkap
            cart.push({ product: productToAdd, quantity: 1 });
            console.log(`Produk ${productToAdd.title} ditambahkan ke keranjang.`);
        }
        saveCart(); // Simpan keranjang yang diperbarui
        updateCartCountDisplay(); // Perbarui tampilan jumlah item
        renderCartItems(); // Perbarui tampilan modal keranjang jika terbuka
        console.log(`Produk dengan ID ${productId} (${productToAdd.title}) ditambahkan/diperbarui di keranjang. Keranjang saat ini:`, JSON.parse(JSON.stringify(cart)));
        showMessageBox(`${productToAdd.title} berhasil ditambahkan ke keranjang!`, 'success'); // Notifikasi lebih spesifik

        // Perbarui rekomendasi berdasarkan kategori produk yang baru ditambahkan
        renderRecommendations(productToAdd.category, productToAdd.id);
    }

    // Fungsi untuk merender item di modal keranjang (Read)
    function renderCartItems() {
        console.log('Merender item keranjang. Keranjang saat ini:', JSON.parse(JSON.stringify(cart)));
        cartItemsContainer.innerHTML = ''; // Bersihkan container item keranjang
        let totalPrice = 0;

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartTotalPriceDisplay.textContent = 'Rp 0';
            console.log('Keranjang kosong.');
            return;
        } else {
            emptyCartMessage.classList.add('hidden');
        }

        cart.forEach(cartItem => {
            // Akses detail produk langsung dari cartItem.product
            const product = cartItem.product;
            if (!product || typeof product.id === 'undefined') { // Tambahkan pengecekan lebih ketat
                console.error('ERROR: Item keranjang memiliki produk yang tidak valid atau tidak ada ID:', cartItem);
                return; // Lewati item yang tidak valid
            }
            // Pastikan price adalah number sebelum dikalikan
            const itemPrice = typeof product.price === 'number' ? product.price : 0;
            const itemTotal = itemPrice * cartItem.quantity * 15000; // Konversi USD ke IDR
            totalPrice += itemTotal;

            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            product.image = product.image || 'https://placehold.co/60x60/cccccc/333333?text=Gambar'; // Fallback image for cart
            product.title = product.title || 'Produk Tidak Dikenal'; // Fallback title for cart

            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/cccccc/333333?text=Gambar';">
                    <div class="cart-item-details">
                        <h4>${product.title}</h4>
                        <p class="price">Rp ${itemPrice ? (itemPrice * 15000).toLocaleString('id-ID') : 'N/A'}</p>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-quantity" data-id="${product.id}">-</button>
                        <span class="quantity-display">${cartItem.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${product.id}">+</button>
                    </div>
                    <button class="remove-item-btn" data-id="${product.id}">Hapus</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });
        cartTotalPriceDisplay.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;
        console.log('Item keranjang berhasil dirender. Total harga:', totalPrice);

        // Tambahkan event listener untuk tombol kuantitas dan hapus
        // Penting: Event listener harus ditambahkan setelah elemen dirender
        cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                console.log('Tombol "+" diklik untuk Product ID:', productId);
                updateQuantity(productId, 1); // Tambah 1
            });
        });

        cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                console.log('Tombol "-" diklik untuk Product ID:', productId);
                updateQuantity(productId, -1); // Kurang 1
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                console.log('Tombol "Hapus" diklik untuk Product ID:', productId);
                removeItemFromCart(productId);
            });
        });
    }

    // Fungsi untuk memperbarui kuantitas item di keranjang (Update)
    function updateQuantity(productId, change) {
        console.log('Memulai updateQuantity untuk productId:', productId, 'perubahan:', change);
        // Penting: Cari item di keranjang berdasarkan product.id yang ada di dalam objek product
        const itemIndex = cart.findIndex(item => item.product.id === productId); 
        
        if (itemIndex > -1) {
            const product = cart[itemIndex].product; // Dapatkan detail produk langsung dari item keranjang
            cart[itemIndex].quantity += change;
            console.log(`Kuantitas produk ${product.title} diubah menjadi ${cart[itemIndex].quantity}`);

            if (cart[itemIndex].quantity <= 0) {
                // Jika kuantitas menjadi 0 atau kurang, hapus item
                console.log(`Kuantitas ${product.title} mencapai 0 atau kurang. Menghapus item.`);
                removeItemFromCart(productId);
            } else {
                saveCart();
                updateCartCountDisplay();
                renderCartItems();
                // Notifikasi saat kuantitas diubah
                showMessageBox(`Kuantitas ${product.title} diperbarui menjadi ${cart[itemIndex].quantity}.`, 'info');
            }
        } else {
            console.error('ERROR: Produk tidak ditemukan di keranjang untuk diperbarui:', productId);
        }
    }

    // Fungsi untuk menghapus item dari keranjang (Delete)
    function removeItemFromCart(productId) {
        console.log('Memulai removeItemFromCart untuk productId:', productId);
        // Penting: Temukan produk untuk notifikasi sebelum difilter
        const productToRemove = cart.find(item => item.product.id === productId); 
        // Filter berdasarkan product.id yang ada di dalam objek product
        cart = cart.filter(item => item.product.id !== productId); 
        saveCart();
        updateCartCountDisplay();
        renderCartItems();
        if (productToRemove) {
            showMessageBox(`${productToRemove.product.title} dihapus dari keranjang.`, 'info'); // Notifikasi lebih spesifik
            console.log(`${productToRemove.product.title} berhasil dihapus dari keranjang.`);
        } else {
            showMessageBox('Produk dihapus dari keranjang.', 'info');
            console.log('Produk dengan ID', productId, 'dihapus dari keranjang (detail tidak ditemukan).');
        }
    }


    // Event listener untuk membuka dan menutup modal keranjang
    openCartModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'flex'; // Mengubah display menjadi flex untuk centering
        renderCartItems(); // Render ulang item keranjang setiap kali modal dibuka
        console.log('Modal keranjang dibuka.');
    });

    closeCartModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
        console.log('Modal keranjang ditutup.');
    });

    // Menutup modal jika mengklik di luar konten modal
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
            console.log('Modal keranjang ditutup (klik di luar).');
        }
    });

    // --- Logika Formulir Kontak ---
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Mencegah pengiriman formulir default

        // Ambil nilai dari input formulir
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Simulasi pengiriman data (misalnya, ke konsol)
        console.log('Pesan Kontak Diterima:');
        console.log('Nama:', name);
        console.log('Email:', email);
        console.log('Pesan:', message);

        // Tampilkan pesan sukses kepada pengguna
        showMessageBox('Pesan Anda telah berhasil dikirim!', 'success');

        // Bersihkan formulir setelah pengiriman
        contactForm.reset();
    });

    // Fungsi untuk menampilkan pesan (pengganti alert)
    function showMessageBox(message, type = 'info') {
        const messageBox = document.createElement('div');
        messageBox.className = `message-box ${type}`;
        messageBox.textContent = message;

        // Styling dasar untuk message box
        messageBox.style.position = 'fixed';
        messageBox.style.top = '20px';
        messageBox.style.left = '50%';
        messageBox.style.transform = 'translateX(-50%)';
        messageBox.style.padding = '15px 25px';
        messageBox.style.borderRadius = '8px';
        messageBox.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        messageBox.style.zIndex = '9999';
        messageBox.style.color = '#fff';
        messageBox.style.fontWeight = 'bold';
        messageBox.style.textAlign = 'center';
        messageBox.style.opacity = '0';
        messageBox.style.transition = 'opacity 0.3s ease-in-out';

        if (type === 'success') {
            messageBox.style.backgroundColor = '#2ecc71'; // Green
        } else if (type === 'error') {
            messageBox.style.backgroundColor = '#e74c3c'; // Red
        } else {
            messageBox.style.backgroundColor = '#3498db'; // Blue (info)
        }

        document.body.appendChild(messageBox);

        // Animasi fade-in
        setTimeout(() => {
            messageBox.style.opacity = '1';
        }, 100);

        // Animasi fade-out dan hapus setelah 3 detik
        setTimeout(() => {
            messageBox.style.opacity = '0';
            messageBox.addEventListener('transitionend', () => messageBox.remove());
        }, 3000);
    }


    // Logika Hamburger Menu
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        // Mengganti ikon hamburger menjadi 'X' dan sebaliknya
        const icon = hamburger.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Menutup menu saat link diklik (untuk pengalaman mobile)
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (event) => {
            // Mencegah perilaku default link (lompat langsung)
            event.preventDefault();

            // Dapatkan target ID dari href link
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth' // Animasi scroll halus
                    });
                }
            }

            // Tutup menu hamburger setelah mengklik link (untuk mobile)
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // --- Logika Pencarian Produk ---
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        // Filter dari array 'products' yang sudah dimuat dari API
        const filteredProducts = products.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm)) || // Handle category undefined
            String(product.id).includes(searchTerm) // Tambahkan pencarian berdasarkan ID juga
        );
        renderProducts(filteredProducts); // Render produk yang sudah difilter
    }

    searchBtn.addEventListener('click', performSearch); // Event listener untuk tombol cari
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch(); // Lakukan pencarian saat menekan Enter
        } else {
            // Opsional: Lakukan pencarian real-time saat mengetik
            // performSearch();
        }
    });


    // --- Bagian Game (Memory Game) ---
    // Elemen Memory Game
    const memoryGameContainer = document.getElementById('memoryGameContainer');
    const memoryGameBoard = document.getElementById('memory-game-board');
    const memoryGameTimerDisplay = document.getElementById('memory-game-timer');
    const memoryMatchedPairsDisplay = document.getElementById('memory-matched-pairs');
    const memoryTotalPairsDisplay = document.getElementById('memory-total-pairs');
    const resetMemoryGameBtn = document.getElementById('reset-memory-game-btn');

    const cardEmojis = ['🍎', '🍌', '🍇', '🍓', '🍍', '🍉', '🥝', '🥭']; // 8 pasangan
    let memoryCards = []; // Renamed to avoid conflict
    let memoryFlippedCards = []; // Renamed
    let memoryMatchedPairs = 0; // Renamed
    let memoryCanFlip = true; // Renamed
    let memoryTimerInterval; // Renamed
    let memorySeconds = 0; // Renamed

    // Fungsi untuk mengacak array
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;
        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    // Fungsi untuk menginisialisasi Memory Game
    function initializeMemoryGame() {
        memoryGameBoard.innerHTML = ''; // Bersihkan papan game
        memoryFlippedCards = [];
        memoryMatchedPairs = 0;
        memorySeconds = 0;
        memoryCanFlip = true;
        memoryMatchedPairsDisplay.textContent = memoryMatchedPairs;
        memoryTotalPairsDisplay.textContent = cardEmojis.length;
        clearInterval(memoryTimerInterval);
        memoryGameTimerDisplay.textContent = '00:00';

        // Buat pasangan kartu
        memoryCards = [...cardEmojis, ...cardEmojis];
        shuffle(memoryCards); // Acak kartu

        memoryCards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.emoji = emoji;
            card.dataset.index = index;

            const cardFront = document.createElement('div');
            cardFront.className = 'card-face card-front';
            cardFront.textContent = '?'; // Tanda tanya di bagian depan kartu

            const cardBack = document.createElement('div');
            cardBack.className = 'card-face card-back';
            cardBack.textContent = emoji; // Emoji di bagian belakang kartu

            card.appendChild(cardFront);
            card.appendChild(cardBack);

            card.addEventListener('click', () => flipCardMemory(card)); // Use specific flip function
            memoryGameBoard.appendChild(card);
        });

        startMemoryTimer();
    }

    // Fungsi untuk memulai timer Memory Game
    function startMemoryTimer() {
        memoryTimerInterval = setInterval(() => {
            memorySeconds++;
            const minutes = Math.floor(memorySeconds / 60);
            const remainingSeconds = memorySeconds % 60;
            memoryGameTimerDisplay.textContent =
                `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        }, 1000);
    }

    // Fungsi untuk membalik kartu Memory Game
    function flipCardMemory(card) {
        if (!memoryCanFlip || card.classList.contains('flipped') || memoryFlippedCards.length === 2) {
            return; // Jangan balik jika tidak bisa membalik, sudah terbalik, atau sudah ada 2 kartu terbalik
        }

        card.classList.add('flipped');
        memoryFlippedCards.push(card);

        if (memoryFlippedCards.length === 2) {
            memoryCanFlip = false; // Nonaktifkan membalik sementara
            setTimeout(checkForMatchMemory, 1000); // Periksa kecocokan setelah 1 detik
        }
    }

    // Fungsi untuk memeriksa kecocokan kartu Memory Game
    function checkForMatchMemory() {
        const [card1, card2] = memoryFlippedCards;
        const emoji1 = card1.dataset.emoji;
        const emoji2 = card2.dataset.emoji;

        if (emoji1 === emoji2) {
            // Kartu cocok
            memoryMatchedPairs++;
            memoryMatchedPairsDisplay.textContent = memoryMatchedPairs;
            card1.removeEventListener('click', () => flipCardMemory(card1)); // Nonaktifkan klik pada kartu yang cocok
            card2.removeEventListener('click', () => flipCardMemory(card2));
            memoryFlippedCards = [];
            memoryCanFlip = true;

            if (memoryMatchedPairs === cardEmojis.length) {
                clearInterval(memoryTimerInterval); // Hentikan timer
                showMessageBox(`Selamat! Anda menyelesaikan Memory Game dalam ${memoryGameTimerDisplay.textContent}!`, 'success');
            }
        } else {
            // Kartu tidak cocok, balik kembali
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                memoryFlippedCards = [];
                memoryCanFlip = true;
            }, 1000);
        }
    }

    resetMemoryGameBtn.addEventListener('click', initializeMemoryGame); // Event listener untuk tombol reset Memory Game


    // --- Bagian Tic Tac Toe Game ---
    const ticTacToeGameContainer = document.getElementById('ticTacToeGameContainer');
    const ticTacToeBoard = document.getElementById('tic-tac-toe-board');
    const ticTacToeCells = document.querySelectorAll('#tic-tac-toe-board .cell');
    const ticTacToeCurrentPlayerDisplay = document.getElementById('tic-tac-toe-current-player');
    const ticTacToeStatusDisplay = document.getElementById('tic-tac-toe-status');
    const resetTicTacToeBtn = document.getElementById('reset-tic-tac-toe-btn');

    let ticTacToeBoardState = ['', '', '', '', '', '', '', '', ''];
    let ticTacToeCurrentPlayer = 'X';
    let ticTacToeGameActive = false;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    // Fungsi untuk menginisialisasi Tic Tac Toe Game
    function initializeTicTacToeGame() {
        ticTacToeBoardState = ['', '', '', '', '', '', '', '', ''];
        ticTacToeCurrentPlayer = 'X';
        ticTacToeGameActive = true;
        ticTacToeCurrentPlayerDisplay.textContent = ticTacToeCurrentPlayer;
        ticTacToeStatusDisplay.textContent = `Giliran ${ticTacToeCurrentPlayer}`;
        ticTacToeCells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('X', 'O');
            cell.addEventListener('click', handleCellClick); // Re-add event listener
        });
    }

    // Fungsi untuk menangani klik sel di Tic Tac Toe
    function handleCellClick(event) {
        const clickedCell = event.target;
        const clickedCellIndex = parseInt(clickedCell.dataset.cellIndex);

        if (ticTacToeBoardState[clickedCellIndex] !== '' || !ticTacToeGameActive) {
            return; // Jangan lakukan apa-apa jika sel sudah terisi atau game tidak aktif
        }

        ticTacToeBoardState[clickedCellIndex] = ticTacToeCurrentPlayer;
        clickedCell.textContent = ticTacToeCurrentPlayer;
        clickedCell.classList.add(ticTacToeCurrentPlayer);

        checkTicTacToeResult();
    }

    // Fungsi untuk memeriksa hasil Tic Tac Toe
    function checkTicTacToeResult() {
        let roundWon = false;
        for (let i = 0; i < winningConditions.length; i++) {
            const winCondition = winningConditions[i];
            let a = ticTacToeBoardState[winCondition[0]];
            let b = ticTacToeBoardState[winCondition[1]];
            let c = ticTacToeBoardState[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            ticTacToeStatusDisplay.textContent = `Pemain ${ticTacToeCurrentPlayer} Menang!`;
            showMessageBox(`Selamat! Pemain ${ticTacToeCurrentPlayer} memenangkan Tic Tac Toe!`, 'success');
            ticTacToeGameActive = false;
            ticTacToeCells.forEach(cell => cell.removeEventListener('click', handleCellClick)); // Remove listeners
            return;
        }

        let roundDraw = !ticTacToeBoardState.includes('');
        if (roundDraw) {
            ticTacToeStatusDisplay.textContent = 'Permainan Seri!';
            showMessageBox('Tic Tac Toe: Permainan Seri!', 'info');
            ticTacToeGameActive = false;
            ticTacToeCells.forEach(cell => cell.removeEventListener('click', handleCellClick)); // Remove listeners
            return;
        }

        // Ganti pemain
        ticTacToeCurrentPlayer = ticTacToeCurrentPlayer === 'X' ? 'O' : 'X';
        ticTacToeCurrentPlayerDisplay.textContent = ticTacToeCurrentPlayer;
        ticTacToeStatusDisplay.textContent = `Giliran ${ticTacToeCurrentPlayer}`;
    }

    resetTicTacToeBtn.addEventListener('click', initializeTicTacToeGame); // Event listener untuk tombol reset Tic Tac Toe


    // --- Bagian Rock Paper Scissors Game ---
    const rockPaperScissorsGameContainer = document.getElementById('rockPaperScissorsGameContainer');
    const rpsPlayerChoiceDisplay = document.getElementById('rps-player-choice');
    const rpsComputerChoiceDisplay = document.getElementById('rps-computer-choice');
    const rpsStatusDisplay = document.getElementById('rps-status');
    const rpsRockBtn = document.getElementById('rps-rock');
    const rpsPaperBtn = document.getElementById('rps-paper');
    const rpsScissorsBtn = document.getElementById('rps-scissors');
    const resetRpsBtn = document.getElementById('reset-rps-btn');

    const rpsChoices = ['Batu', 'Kertas', 'Gunting'];

    // Fungsi untuk menginisialisasi Rock Paper Scissors
    function initializeRockPaperScissors() {
        rpsPlayerChoiceDisplay.textContent = '?';
        rpsComputerChoiceDisplay.textContent = '?';
        rpsStatusDisplay.textContent = 'Pilih gerakanmu!';
        rpsRockBtn.disabled = false;
        rpsPaperBtn.disabled = false;
        rpsScissorsBtn.disabled = false;
    }

    // Fungsi untuk memainkan satu ronde Rock Paper Scissors
    function playRPS(playerChoice) {
        rpsPlayerChoiceDisplay.textContent = playerChoice;
        const computerChoice = rpsChoices[Math.floor(Math.random() * rpsChoices.length)];
        rpsComputerChoiceDisplay.textContent = computerChoice;

        let result = '';
        if (playerChoice === computerChoice) {
            result = 'Seri!';
        } else if (
            (playerChoice === 'Batu' && computerChoice === 'Gunting') ||
            (playerChoice === 'Kertas' && computerChoice === 'Batu') ||
            (playerChoice === 'Gunting' && computerChoice === 'Kertas')
        ) {
            result = 'Anda Menang!';
            showMessageBox('Selamat! Anda memenangkan Batu-Gunting-Kertas!', 'success');
        } else {
            result = 'Komputer Menang!';
            showMessageBox('Ups! Komputer memenangkan Batu-Gunting-Kertas.', 'info');
        }
        rpsStatusDisplay.textContent = result;
    }

    rpsRockBtn.addEventListener('click', () => playRPS('Batu'));
    rpsPaperBtn.addEventListener('click', () => playRPS('Kertas'));
    rpsScissorsBtn.addEventListener('click', () => playRPS('Gunting'));
    resetRpsBtn.addEventListener('click', initializeRockPaperScissors);


    // --- Bagian Guess The Number Game ---
    const guessTheNumberGameContainer = document.getElementById('guessTheNumberGameContainer');
    const guessInput = document.getElementById('guess-input');
    const guessBtn = document.getElementById('guess-btn');
    const guessFeedbackDisplay = document.getElementById('guess-feedback');
    const guessCountDisplay = document.getElementById('guess-count');
    const resetGuessBtn = document.getElementById('reset-guess-btn');

    let randomNumber;
    let guessCount;
    let guessGameActive;

    // Fungsi untuk menginisialisasi Guess The Number
    function initializeGuessTheNumber() {
        randomNumber = Math.floor(Math.random() * 100) + 1; // Angka antara 1 dan 100
        guessCount = 0;
        guessGameActive = true;
        guessInput.value = '';
        guessInput.disabled = false;
        guessBtn.disabled = false;
        guessFeedbackDisplay.textContent = 'Mulai menebak!';
        guessCountDisplay.textContent = guessCount;
        console.log('Angka rahasia (untuk debugging):', randomNumber); // Untuk debugging
    }

    // Fungsi untuk menangani tebakan di Guess The Number
    function handleGuess() {
        if (!guessGameActive) return;

        const playerGuess = parseInt(guessInput.value);

        if (isNaN(playerGuess) || playerGuess < 1 || playerGuess > 100) {
            showMessageBox('Mohon masukkan angka antara 1 dan 100.', 'error');
            return;
        }

        guessCount++;
        guessCountDisplay.textContent = guessCount;

        if (playerGuess === randomNumber) {
            guessFeedbackDisplay.textContent = `Selamat! Anda menebak angka ${randomNumber} dengan ${guessCount} tebakan!`;
            showMessageBox(`Selamat! Anda menebak angka ${randomNumber} dengan ${guessCount} tebakan!`, 'success');
            guessGameActive = false;
            guessInput.disabled = true;
            guessBtn.disabled = true;
        } else if (playerGuess < randomNumber) {
            guessFeedbackDisplay.textContent = 'Terlalu rendah! Coba lagi.';
        } else {
            guessFeedbackDisplay.textContent = 'Terlalu tinggi! Coba lagi.';
        }
        guessInput.value = ''; // Bersihkan input setelah tebakan
    }

    guessBtn.addEventListener('click', handleGuess);
    guessInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleGuess();
        }
    });
    resetGuessBtn.addEventListener('click', initializeGuessTheNumber);


    // --- Logika Pemilihan Game Utama ---
    const selectMemoryGameBtn = document.getElementById('selectMemoryGame');
    const selectTicTacToeBtn = document.getElementById('selectTicTacToe');
    const selectRockPaperScissorsBtn = document.getElementById('selectRockPaperScissors');
    const selectGuessTheNumberBtn = document.getElementById('selectGuessTheNumber');

    const gameContainers = document.querySelectorAll('.game-container'); // All game containers
    const gameSelectButtons = document.querySelectorAll('.btn-game-select'); // All game selection buttons

    function switchGame(gameId) {
        // Hide all game containers
        gameContainers.forEach(container => {
            container.classList.add('hidden-game');
            container.classList.remove('active-game');
            // Stop any ongoing game timers/states if applicable
            if (container.id === 'memoryGameContainer') {
                clearInterval(memoryTimerInterval);
            }
        });

        // Deactivate all game selection buttons
        gameSelectButtons.forEach(button => {
            button.classList.remove('active');
        });

        // Show the selected game container and activate its button
        if (gameId === 'memoryGameContainer') {
            memoryGameContainer.classList.remove('hidden-game');
            memoryGameContainer.classList.add('active-game');
            selectMemoryGameBtn.classList.add('active');
            initializeMemoryGame(); // Initialize the game when selected
        } else if (gameId === 'ticTacToeGameContainer') {
            ticTacToeGameContainer.classList.remove('hidden-game');
            ticTacToeGameContainer.classList.add('active-game');
            selectTicTacToeBtn.classList.add('active');
            initializeTicTacToeGame(); // Initialize the game when selected
        } else if (gameId === 'rockPaperScissorsGameContainer') {
            rockPaperScissorsGameContainer.classList.remove('hidden-game');
            rockPaperScissorsGameContainer.classList.add('active-game');
            selectRockPaperScissorsBtn.classList.add('active');
            initializeRockPaperScissors(); // Initialize the game when selected
        } else if (gameId === 'guessTheNumberGameContainer') {
            guessTheNumberGameContainer.classList.remove('hidden-game');
            guessTheNumberGameContainer.classList.add('active-game');
            selectGuessTheNumberBtn.classList.add('active');
            initializeGuessTheNumber(); // Initialize the game when selected
        }
    }

    // Event listeners for game selection buttons
    selectMemoryGameBtn.addEventListener('click', () => switchGame('memoryGameContainer'));
    selectTicTacToeBtn.addEventListener('click', () => switchGame('ticTacToeGameContainer'));
    selectRockPaperScissorsBtn.addEventListener('click', () => switchGame('rockPaperScissorsGameContainer'));
    selectGuessTheNumberBtn.addEventListener('click', () => switchGame('guessTheNumberGameContainer'));


    // Inisialisasi saat DOM dimuat
    console.log('DOM Content Loaded. Initializing app.');
    fetchProducts(); // Panggil fungsi untuk mengambil produk dari API
    switchGame('memoryGameContainer'); // Tampilkan Memory Game secara default saat halaman dimuat
    updateCartCountDisplay(); // Perbarui tampilan jumlah keranjang yang dimuat
});
