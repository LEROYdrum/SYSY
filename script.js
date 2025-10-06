document.addEventListener('DOMContentLoaded', () => {
    const cart = [];
    const whatsappNumber = "2250788903460";
    const whatsappLink = `https://wa.me/${whatsappNumber}`;
    
    // Éléments du DOM
    const cartModal = document.getElementById('cart-modal');
    const openCartBtn = document.getElementById('open-cart');
    const closeCartBtn = document.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-whatsapp');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    /**
     * Met à jour l'affichage du panier (liste des articles, total, compteur).
     */
    function updateCartDisplay(flashIndex = -1) {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">Votre panier est vide.</p>';
        } else {
            cart.forEach((item, index) => {
                total += item.price;
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                
                // Si c'est le dernier article ajouté, on ajoute la classe 'flash'
                if (index === flashIndex) {
                    itemElement.classList.add('flash');
                }

                itemElement.innerHTML = `
                    <div class="cart-item-info">
                        <p><strong>${item.name}</strong> <small>${item.details.replace(/[()]/g, '')}</small></p>
                        <small>${item.price.toLocaleString('fr-FR')} FCFA</small>
                    </div>
                    <div class="cart-item-actions">
                        <span class="remove-item" data-index="${index}" title="Retirer l'article">&#10005;</span>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);

                // Retirer la classe 'flash' après 100ms
                if (index === flashIndex) {
                    setTimeout(() => {
                        itemElement.classList.remove('flash');
                    }, 100);
                }
            });
        }

        cartTotalElement.textContent = `${total.toLocaleString('fr-FR')} FCFA`;
        cartCountElement.textContent = cart.length;
    }

    /**
     * Ajoute un article au panier.
     */
    function addItemToCart(name, price, details) {
        cart.push({ name, price, details });
        // Appel de la mise à jour en indiquant l'index du nouvel article pour le flash
        updateCartDisplay(cart.length - 1); 
    }

    /**
     * Gère l'ajout d'articles en écoutant les clics sur les boutons.
     */
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const itemElement = e.target.closest('.menu-item') || e.target.closest('.supplement-item');
            if (itemElement) {
                const name = itemElement.dataset.name;
                const price = parseInt(itemElement.dataset.price);
                const details = itemElement.dataset.details || "Détails à confirmer"; 
                addItemToCart(name, price, details);
            }
        });
    });

    /**
     * Gère la suppression d'articles du panier.
     */
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            // Pas de flash à la suppression
            updateCartDisplay(); 
        }
    });

    /**
     * Ouverture/Fermeture du modal.
     */
    openCartBtn.onclick = () => { cartModal.style.display = 'block'; }
    closeCartBtn.onclick = () => { cartModal.style.display = 'none'; }
    window.onclick = (event) => { if (event.target === cartModal) { cartModal.style.display = 'none'; } }

    /**
     * Génère le message de commande détaillé pour WhatsApp et redirige.
     */
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Votre panier est vide. Veuillez ajouter des articles avant de commander.");
            return;
        }

        let total = 0;
        
        // 1. Regrouper les articles
        const groupedCart = cart.reduce((acc, item) => {
            // Utiliser le nom ET les détails pour bien séparer les articles
            const key = `${item.name} - ${item.details}`;
            if (!acc[key]) {
                acc[key] = { count: 0, price: 0, unitPrice: item.price, details: item.details };
            }
            acc[key].count++;
            acc[key].price += item.price;
            total += item.price;
            return acc;
        }, {});

        // --- Début de la construction du message clair ---
        let messageText = "✨ Nouvelle Commande SYSY'S DELICACIES ✨\n\n";
        
        messageText += "Détail de ma sélection :\n";
        
        // 2. Formatter les articles
        for (const key in groupedCart) {
            const item = groupedCart[key];
            
            let formattedName = key;
            
            // Retirer le double tiret de la clé pour un affichage plus propre.
            formattedName = formattedName.replace(/ - /g, ' - '); 
            
            // Format final : • 2x Nom de la Box - Détails = X FCFA
            messageText += `• ${item.count}x ${formattedName} = ${item.price.toLocaleString('fr-FR')} FCFA\n`;
        }
        
        // 3. Ajouter le total et les instructions
        messageText += `\n*TOTAL ESTIMÉ : ${total.toLocaleString('fr-FR')} FCFA*\n\n`;
        
        
        // --- Fin de la construction du message clair ---

        // L'encodage URI est crucial pour que le message passe sur WhatsApp
        const encodedMessage = encodeURIComponent(messageText);
        
        // Ouvre WhatsApp avec le message pré-rempli
        window.open(`${whatsappLink}?text=${encodedMessage}`, '_blank');
    });

    // Initialisation : s'assurer que le panier s'affiche au chargement
    updateCartDisplay(); 
});