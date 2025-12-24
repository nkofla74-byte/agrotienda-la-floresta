import './style.css';
import { products as initialProducts } from './data/products';
import { ProductCard } from './components/ProductCard';
import { formatMoney } from './utils/formatters';
import { supabase } from './supabaseClient'; // Importamos la conexión

// --- ESTADO ---
let products = [...initialProducts]; // Copia inicial
let cart = [];
const WHATSAPP_NUMBER = "573122339294"; 

// --- DETECTAR MODO ADMIN ---
const urlParams = new URLSearchParams(window.location.search);
const isAdminMode = urlParams.has('admin');

// --- FUNCIONES SUPABASE (NUBE - NO TOCAR) ---

// 1. Cargar Stock Real desde la Nube
const fetchStock = async () => {
    const { data, error } = await supabase
        .from('inventario')
        .select('*');

    if (error) {
        console.error('Error cargando stock:', error);
        return;
    }

    if (data) {
        products = products.map(p => {
            const stockInfo = data.find(item => item.id === p.id);
            return { ...p, disponible: stockInfo ? stockInfo.disponible : true };
        });
        renderProducts(products); 
    }
};

// 2. Suscribirse a cambios en Tiempo Real
const subscribeToStock = () => {
    supabase
        .channel('cambios-stock')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'inventario' }, (payload) => {
            console.log('Cambio detectado en la nube!', payload);
            const updatedItem = payload.new;
            
            const productIndex = products.findIndex(p => p.id === updatedItem.id);
            if (productIndex !== -1) {
                products[productIndex].disponible = updatedItem.disponible;
                renderProducts(products);
                
                if (isAdminMode) {
                    showToastAdmin(products[productIndex].nombre, updatedItem.disponible);
                }
            }
        })
        .subscribe();
};

// 3. Cambiar Stock (Solo Admin)
window.toggleAvailability = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newState = !product.disponible;

    // Actualización visual inmediata
    product.disponible = newState;
    renderProducts(products);

    // Guardar en Supabase
    const { error } = await supabase
        .from('inventario')
        .update({ disponible: newState })
        .eq('id', productId);

    if (error) {
        console.error("Error actualizando Supabase:", error);
        alert("Hubo un error guardando el cambio en la nube.");
        product.disponible = !newState; // Revertir si falla
        renderProducts(products);
    }
};

// --- FUNCIÓN GLOBAL PRECIO ---
window.updateCardPrice = (selectElement, productId) => {
    const variantIndex = selectElement.value;
    const product = products.find(p => p.id === productId);
    const newPrice = product.variantes[variantIndex].precio;
    const priceDisplay = document.getElementById(`price-${productId}`);
    if(priceDisplay) {
        priceDisplay.style.opacity = '0.5';
        priceDisplay.style.transform = 'scale(0.9)';
        setTimeout(() => {
            priceDisplay.textContent = formatMoney(newPrice);
            priceDisplay.style.opacity = '1';
            priceDisplay.style.transform = 'scale(1)';
        }, 150);
    }
};

// --- SELECTORES ---
const grid = document.getElementById('product-grid');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartModal = document.getElementById('cart-modal');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');

// --- FUNCIONES RENDER ---
const renderProducts = (lista) => {
    if (lista.length > 0) {
        grid.innerHTML = lista.map(product => ProductCard(product, isAdminMode)).join('');
        
        if (!isAdminMode) {
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if(e.currentTarget.disabled) return;
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    const select = document.querySelector(`.variant-selector[data-id="${id}"]`);
                    const variantIndex = parseInt(select.value);
                    addToCart(id, variantIndex);
                    openCart();
                });
            });
        }
    } else {
        grid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-gray-400">Cargando productos...</p></div>`;
    }
};

const addToCart = (productId, variantIndex) => {
    const product = products.find(p => p.id === productId);
    const variant = product.variantes[variantIndex];
    const uniqueId = `${productId}-${variantIndex}`;
    
    const existingItem = cart.find(item => item.uniqueId === uniqueId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            uniqueId: uniqueId,
            id: product.id,
            nombre: product.nombre,
            imagen: product.imagen,
            variantName: variant.nombre,
            precio: variant.precio,
            quantity: 1
        });
    }
    updateCartUI();
};

const removeFromCart = (uniqueId) => {
    cart = cart.filter(item => item.uniqueId !== uniqueId);
    updateCartUI();
};

// --- AQUÍ ESTÁN LOS CAMBIOS IMPORTANTES (VISUALES) ---

const updateCartUI = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCountElement.classList.remove('scale-0');
        checkoutBtn.disabled = false;
    } else {
        cartCountElement.classList.add('scale-0');
        checkoutBtn.disabled = true;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    // CAMBIO 1: Añadimos asterisco al total para indicar que es referencia
    cartTotalElement.textContent = formatMoney(totalPrice) + "*"; 

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                <i class="fa-solid fa-basket-shopping text-5xl mb-4 text-gray-200 dark:text-gray-700"></i>
                <p>Tu canasta está vacía</p>
                <button onclick="document.getElementById('cart-overlay').click()" class="mt-4 text-agro-primary font-bold hover:underline">Ir a comprar</button>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in mb-2">
                <div class="flex items-center gap-3">
                    <img src="${item.imagen}" class="w-12 h-12 rounded-lg object-cover bg-gray-100">
                    <div>
                        <h5 class="font-bold text-sm text-gray-800 dark:text-white">${item.nombre}</h5>
                        <p class="text-xs text-agro-primary font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded inline-block">${item.variantName}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.quantity} x ~${formatMoney(item.precio)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-agro-dark dark:text-gray-200 text-sm">~${formatMoney(item.precio * item.quantity)}</span>
                    <button class="remove-btn text-red-400 hover:text-red-600 transition p-1" data-unique-id="${item.uniqueId}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `).join('');

        // CAMBIO 2: Alerta visual amarilla dentro del carrito
        const alertDiv = document.createElement('div');
        alertDiv.className = "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-3 rounded-lg text-xs text-orange-800 dark:text-orange-200 mt-4 flex gap-2 items-start";
        alertDiv.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation mt-0.5"></i>
            <p><strong>Importante:</strong> Los precios mostrados son de referencia. El valor final puede variar levemente según la cosecha del día. Te confirmaremos el total exacto por WhatsApp.</p>
        `;
        cartItemsContainer.appendChild(alertDiv);

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => removeFromCart(e.currentTarget.getAttribute('data-unique-id')));
        });
    }
};

const openCart = () => { cartModal.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
const closeCart = () => { cartModal.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; };

const checkout = () => {
    if (cart.length === 0) return;
    
    // CAMBIO 3: Mensaje de WhatsApp actualizado y protegido
    let message = "¡Hola amigos de La Floresta! 👋%0A%0A";
    message += "Me gustaría pedir los siguientes productos (sujetos a disponibilidad y precio del día): 🌿%0A%0A";
    
    cart.forEach(item => {
        message += `✅ *${item.quantity} x ${item.nombre}* - ${item.variantName}%0A   └ Ref: ${formatMoney(item.precio * item.quantity)}%0A`;
    });
    
    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    
    message += `%0A💰 *VALOR APROXIMADO: ${formatMoney(totalPrice)}*`;
    message += `%0A_(Entiendo que este valor es una referencia y confirmaremos el precio final en el chat)_`;
    
    message += "%0A%0A----------------------------------%0A";
    message += "📦 *Confirmación de Entrega:*%0A";
    message += "Tengo presente que las entregas son los *Miércoles y Viernes*.";
    message += "%0A🤝 El pago lo haré *Contra Entrega* una vez reciba y verifique la calidad de los productos.";
    message += "%0A%0A📍 *Mi Dirección:* (Escribe aquí tu dirección)%0A";
    message += "👤 *A nombre de:* (Tu nombre)%0A";
    message += "👤 *apto :* (numero de apto)%0A";
    message += "📝 *Nota adicional:* (Timbre, dejar en portería, etc)";
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
};

// --- NOTIFICACIONES (Igual que antes) ---
const showToast = () => {
    if (isAdminMode) return; 
    const nombres = ["Doña Gloria", "Don Jorge", "María", "Camilo", "La Sra. Rosa"];
    const barrios = ["Barrio El Centro", "Alto de la Cruz", "La Pesebrera", "Barrio Sorbetes"];
    const acciones = ["compró", "pidió", "llevó"];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomName = nombres[Math.floor(Math.random() * nombres.length)];
    const randomBarrio = barrios[Math.floor(Math.random() * barrios.length)];
    const randomAccion = acciones[Math.floor(Math.random() * acciones.length)];

    const toast = document.createElement('div');
    toast.className = "flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border-l-4 border-agro-primary min-w-[280px] transform translate-y-10 opacity-0 transition-all duration-500 pointer-events-auto";
    toast.innerHTML = `
        <img src="${randomProduct.imagen}" class="w-10 h-10 rounded-md object-cover">
        <div>
            <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Hace un momento en <strong>${randomBarrio}</strong></p>
            <p class="text-sm text-agro-dark dark:text-white leading-tight"><strong>${randomName}</strong> ${randomAccion} <span class="text-agro-primary font-bold">${randomProduct.nombre}</span></p>
        </div>
    `;
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
        setTimeout(() => { toast.classList.add('translate-y-10', 'opacity-0'); setTimeout(() => toast.remove(), 500); }, 5000);
    }
};

const showToastAdmin = (productName, isAvailable) => {
    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 ${isAvailable ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'} p-4 rounded-xl shadow-xl border-l-4 min-w-[280px] fixed top-4 right-4 z-50 animate-bounce`;
    toast.innerHTML = `
        <i class="fa-solid ${isAvailable ? 'fa-check text-green-600' : 'fa-xmark text-red-600'} text-xl"></i>
        <div>
            <p class="font-bold text-gray-800">${productName}</p>
            <p class="text-xs text-gray-600">${isAvailable ? 'Ahora está DISPONIBLE' : 'Marcado como AGOTADO'}</p>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

const startHeroSlideshow = () => {
    const heroImages = ['/images/fresnolog.jpg', '/images/arbolaguacate.jpg', '/images/cultivomazorcsa.jpeg', '/images/yucacultivo.jpg'];
    const container = document.getElementById('hero-bg');
    if (!container) return;
    heroImages.forEach((src, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        slide.style.backgroundImage = `url('${src}')`;
        container.appendChild(slide);
    });
    let currentIndex = 0;
    const slides = document.querySelectorAll('.hero-slide');
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 5000);
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Iniciamos cosas estáticas
    startHeroSlideshow();
    
    // 2. Cargamos el stock desde la nube
    await fetchStock(); 
    
    // 3. Nos suscribimos a cambios en tiempo real
    subscribeToStock();

    // UI Events
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkout);

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.theme = isDark ? 'dark' : 'light';
    });

    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-agro-dark', 'text-white', 'shadow');
                b.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            });
            e.target.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            e.target.classList.add('bg-agro-dark', 'text-white', 'shadow');
            const cat = e.target.getAttribute('data-category');
            renderProducts(cat === 'todo' ? products : products.filter(p => p.categoria === cat));
        });
    });

    if(!isAdminMode) {
        setTimeout(() => { showToast(); setInterval(showToast, 30000); }, 3000);
    } else {
        const adminBadge = document.createElement('div');
        adminBadge.className = "fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-2xl z-50 font-bold border-2 border-white animate-pulse";
        adminBadge.innerHTML = '<i class="fa-solid fa-user-gear"></i> MODO ADMIN';
        document.body.appendChild(adminBadge);
    }
});