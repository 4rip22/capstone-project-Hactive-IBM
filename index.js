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


    // Data produk contoh
    const products = [
        { id: 1, name: 'Smartwatch X1', price: 1500000, imageUrl: 'https://placehold.co/300x200/3498db/ffffff?text=Smartwatch' },
        { id: 2, name: 'Headphone Nirkabel', price: 850000, imageUrl: 'https://placehold.co/300x200/2ecc71/ffffff?text=Headphone' },
        { id: 3, name: 'Kamera Digital Pro', price: 4500000, imageUrl: 'https://placehold.co/300x200/e67e22/ffffff?text=Kamera' },
        { id: 4, name: 'Power Bank 20000mAh', price: 300000, imageUrl: 'https://placehold.co/300x200/9b59b6/ffffff?text=Powerbank' },
        { id: 5, name: 'Mouse Gaming RGB', price: 250000, imageUrl: 'https://placehold.co/300x200/f1c40f/ffffff?text=Mouse' },
        { id: 6, name: 'Keyboard Mekanik', price: 700000, imageUrl: 'https://placehold.co/300x200/1abc9c/ffffff?text=Keyboard' },
    ];

    // Menginisialisasi keranjang dari localStorage atau array kosong
    let cart = loadCart(); // Keranjang akan menyimpan objek { productId, quantity }

    // Fungsi untuk menyimpan keranjang ke localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Fungsi untuk memuat keranjang dari localStorage
    function loadCart() {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    }

    // Fungsi untuk memperbarui tampilan jumlah item di keranjang
    function updateCartCountDisplay() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Fungsi untuk merender produk ke halaman
    function renderProducts() {
        productGrid.innerHTML = ''; // Bersihkan grid produk
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/cccccc/333333?text=Gambar+Tidak+Tersedia';">
                <h3>${product.name}</h3>
                <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
                <button class="btn btn-add-to-cart" data-id="${product.id}">Tambah ke Keranjang</button>
            `;
            productGrid.appendChild(productCard);
        });

        // Tambahkan event listener ke tombol "Tambah ke Keranjang"
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id); // Pastikan ID adalah angka
                addToCart(productId);
            });
        });
    }

    // Fungsi untuk menambahkan produk ke keranjang (Create)
    function addToCart(productId) {
        const existingItemIndex = cart.findIndex(item => item.productId === productId);

        if (existingItemIndex > -1) {
            // Jika produk sudah ada di keranjang, tingkatkan kuantitasnya
            cart[existingItemIndex].quantity++;
        } else {
            // Jika produk belum ada, tambahkan sebagai item baru dengan kuantitas 1
            cart.push({ productId: productId, quantity: 1 });
        }
        saveCart(); // Simpan keranjang yang diperbarui
        updateCartCountDisplay(); // Perbarui tampilan jumlah item
        renderCartItems(); // Perbarui tampilan modal keranjang jika terbuka
        console.log(`Produk dengan ID ${productId} ditambahkan ke keranjang.`, cart);
        showMessageBox('Produk berhasil ditambahkan ke keranjang!', 'success');
    }

    // Fungsi untuk merender item di modal keranjang (Read)
    function renderCartItems() {
        cartItemsContainer.innerHTML = ''; // Bersihkan container item keranjang
        let totalPrice = 0;

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartTotalPriceDisplay.textContent = 'Rp 0';
            return;
        } else {
            emptyCartMessage.classList.add('hidden');
        }

        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.productId);
            if (product) {
                const itemTotal = product.price * cartItem.quantity;
                totalPrice += itemTotal;

                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';
                cartItemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/60x60/cccccc/333333?text=Gambar';">
                        <div class="cart-item-details">
                            <h4>${product.name}</h4>
                            <p class="price">Rp ${product.price.toLocaleString('id-ID')}</p>
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
            }
        });
        cartTotalPriceDisplay.textContent = `Rp ${totalPrice.toLocaleString('id-ID')}`;

        // Tambahkan event listener untuk tombol kuantitas dan hapus
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                updateQuantity(productId, 1); // Tambah 1
            });
        });

        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                updateQuantity(productId, -1); // Kurang 1
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = parseInt(event.target.dataset.id);
                removeItemFromCart(productId);
            });
        });
    }

    // Fungsi untuk memperbarui kuantitas item di keranjang (Update)
    function updateQuantity(productId, change) {
        const itemIndex = cart.findIndex(item => item.productId === productId);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                // Jika kuantitas menjadi 0 atau kurang, hapus item
                removeItemFromCart(productId);
            } else {
                saveCart();
                updateCartCountDisplay();
                renderCartItems();
            }
        }
    }

    // Fungsi untuk menghapus item dari keranjang (Delete)
    function removeItemFromCart(productId) {
        // Filter array cart, hanya menyimpan item yang ID-nya tidak sama dengan productId yang akan dihapus
        cart = cart.filter(item => item.productId !== productId);
        saveCart();
        updateCartCountDisplay();
        renderCartItems();
        showMessageBox('Produk dihapus dari keranjang.', 'info');
    }


    // Event listener untuk membuka dan menutup modal keranjang
    openCartModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'flex'; // Mengubah display menjadi flex untuk centering
        renderCartItems(); // Render ulang item keranjang setiap kali modal dibuka
    });

    closeCartModalBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Menutup modal jika mengklik di luar konten modal
    window.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });


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
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.querySelector('i').classList.remove('fa-times');
                hamburger.querySelector('i').classList.add('fa-bars');
            }
        });
    });

    // --- Bagian Game (Memory Game) ---
    const gameBoard = document.getElementById('game-board');
    const gameTimerDisplay = document.getElementById('game-timer');
    const matchedPairsDisplay = document.getElementById('matched-pairs');
    const totalPairsDisplay = document.getElementById('total-pairs');
    const resetGameBtn = document.getElementById('reset-game-btn');

    const cardEmojis = ['🍎', '🍌', '🍇', '🍓', '🍍', '🍉', '🥝', '🥭']; // 8 pasangan
    let cards = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let canFlip = true;
    let timerInterval;
    let seconds = 0;

    // Fungsi untuk mengacak array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Fungsi untuk menginisialisasi game
    function initializeGame() {
        gameBoard.innerHTML = ''; // Bersihkan papan game
        flippedCards = [];
        matchedPairs = 0;
        seconds = 0;
        canFlip = true;
        matchedPairsDisplay.textContent = matchedPairs;
        totalPairsDisplay.textContent = cardEmojis.length;
        clearInterval(timerInterval);
        gameTimerDisplay.textContent = '00:00';

        // Buat pasangan kartu
        cards = [...cardEmojis, ...cardEmojis];
        shuffle(cards); // Acak kartu

        cards.forEach((emoji, index) => {
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

            card.addEventListener('click', () => flipCard(card));
            gameBoard.appendChild(card);
        });

        startTimer();
    }

    // Fungsi untuk memulai timer
    function startTimer() {
        timerInterval = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            gameTimerDisplay.textContent =
                `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        }, 1000);
    }

    // Fungsi untuk membalik kartu
    function flipCard(card) {
        if (!canFlip || card.classList.contains('flipped') || flippedCards.length === 2) {
            return; // Jangan balik jika tidak bisa membalik, sudah terbalik, atau sudah ada 2 kartu terbalik
        }

        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            canFlip = false; // Nonaktifkan membalik sementara
            setTimeout(checkForMatch, 1000); // Periksa kecocokan setelah 1 detik
        }
    }

    // Fungsi untuk memeriksa kecocokan kartu
    function checkForMatch() {
        const [card1, card2] = flippedCards;
        const emoji1 = card1.dataset.emoji;
        const emoji2 = card2.dataset.emoji;

        if (emoji1 === emoji2) {
            // Kartu cocok
            matchedPairs++;
            matchedPairsDisplay.textContent = matchedPairs;
            card1.removeEventListener('click', () => flipCard(card1)); // Nonaktifkan klik pada kartu yang cocok
            card2.removeEventListener('click', () => flipCard(card2));
            flippedCards = [];
            canFlip = true;

            if (matchedPairs === cardEmojis.length) {
                clearInterval(timerInterval); // Hentikan timer
                showMessageBox(`Selamat! Anda menyelesaikan game dalam ${gameTimerDisplay.textContent}!`, 'success');
            }
        } else {
            // Kartu tidak cocok, balik kembali
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flippedCards = [];
                canFlip = true;
            }, 1000);
        }
    }

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


    // Event listener untuk tombol reset game
    resetGameBtn.addEventListener('click', initializeGame);

    // Inisialisasi saat DOM dimuat
    renderProducts();
    initializeGame();
    updateCartCountDisplay(); // Panggil saat inisialisasi untuk menampilkan jumlah keranjang yang dimuat
});
