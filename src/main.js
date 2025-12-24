import './style.css';
import { products } from './data/products';
import { ProductCard } from './components/ProductCard';
import { formatMoney } from './utils/formatters';

// --- ESTADO ---
let cart = [];
const WHATSAPP_NUMBER = "573000000000"; 

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
    grid.style.opacity = '0';
    setTimeout(() => {
        if (lista.length > 0) {
            grid.innerHTML = lista.map(product => ProductCard(product)).join('');
            document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.currentTarget.getAttribute('data-id'));
                    const select = document.querySelector(`.variant-selector[data-id="${id}"]`);
                    const variantIndex = parseInt(select.value);
                    addToCart(id, variantIndex);
                    openCart();
                });
            });
        } else {
            grid.innerHTML = `<div class="col-span-full text-center py-12"><p class="text-gray-400">No hay productos disponibles.</p></div>`;
        }
        grid.style.opacity = '1';
    }, 200);
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
    cartTotalElement.textContent = formatMoney(totalPrice);

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
            <div class="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
                <div class="flex items-center gap-3">
                    <img src="${item.imagen}" class="w-12 h-12 rounded-lg object-cover bg-gray-100">
                    <div>
                        <h5 class="font-bold text-sm text-gray-800 dark:text-white">${item.nombre}</h5>
                        <p class="text-xs text-agro-primary font-bold bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded inline-block">${item.variantName}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${item.quantity} x ${formatMoney(item.precio)}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-agro-dark dark:text-gray-200 text-sm">${formatMoney(item.precio * item.quantity)}</span>
                    <button class="remove-btn text-red-400 hover:text-red-600 transition p-1" data-unique-id="${item.uniqueId}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => removeFromCart(e.currentTarget.getAttribute('data-unique-id')));
        });
    }
};

const openCart = () => { cartModal.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
const closeCart = () => { cartModal.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; };

const checkout = () => {
    if (cart.length === 0) return;
    let message = "Hola Agrotienda! 🌿 Pedido:%0A%0A";
    cart.forEach(item => message += `▪ ${item.quantity} x ${item.nombre} (${item.variantName}) - ${formatMoney(item.precio * item.quantity)}%0A`);
    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    message += `%0A*TOTAL: ${formatMoney(totalPrice)}*`;
    message += `%0A%0A🛑 *Entrega Miércoles o Viernes (Pago Contra Entrega).*`;
    message += "%0A%0AMis datos de entrega son:";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
};

// --- NOTIFICACIONES ---
const showToast = () => {
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

// --- HERO SLIDESHOW (FONDO DINÁMICO) ---
const startHeroSlideshow = () => {
    // Imágenes reales del paisaje de Fresno
    const heroImages = [
        '/images/fresnolog.jpg',
        '/images/arbolaguacate.jpg',
        '/images/cultivomazorcsa.jpeg',
        '/images/yucacultivo.jpg'
    ];
    
    const container = document.getElementById('hero-bg');
    if (!container) return;

    // Crear elementos de imagen
    heroImages.forEach((src, index) => {
        const slide = document.createElement('div');
        slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
        slide.style.backgroundImage = `url('${src}')`;
        container.appendChild(slide);
    });

    // Ciclo infinito
    let currentIndex = 0;
    const slides = document.querySelectorAll('.hero-slide');
    
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 5000); // Cambia cada 5 segundos
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    startHeroSlideshow(); // <-- Iniciar slideshow
    
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

    setTimeout(() => { showToast(); setInterval(showToast, 30000); }, 3000);
});