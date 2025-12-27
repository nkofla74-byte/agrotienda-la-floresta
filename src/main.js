import './style.css';
import { products as initialProducts } from './data/products';
import { ProductCard } from './components/ProductCard';
import { formatMoney } from './utils/formatters';
import { supabase } from './supabaseClient'; 

// --- ESTADO ---
let products = [...initialProducts]; 
let cart = [];
const WHATSAPP_NUMBER = "573122339294"; 

// --- 1. LÓGICA DE FECHAS DE CORTE (DEADLINES) ---
const actualizarDeadlineBanner = () => {
    const ahora = new Date();
    const diaSemana = ahora.getDay(); 
    const hora = ahora.getHours();
    
    const banner = document.getElementById('deadline-banner');
    const deadlineText = document.getElementById('deadline-text');
    const badge = document.getElementById('deadline-badge');

    if (!banner || !deadlineText) return;

    let texto = "";
    let esUrgente = false;
    let proximoDespacho = "";

    // Ciclo 1 (Despacho Lunes) vs Ciclo 2 (Despacho Jueves)
    if (diaSemana === 4 || diaSemana === 5 || diaSemana === 6 || (diaSemana === 0 && hora < 18)) {
        proximoDespacho = "Lunes";
        texto = "Haz tu pedido antes del <strong>DOMINGO 6:00 PM</strong>. Recibes el Martes/Miércoles.";
        if (diaSemana === 0) esUrgente = true;
    } else {
        proximoDespacho = "Jueves";
        texto = "Haz tu pedido antes del <strong>MIÉRCOLES 6:00 PM</strong>. Recibes el Viernes/Sábado.";
        if (diaSemana === 3) esUrgente = true;
    }

    deadlineText.innerHTML = texto;
    banner.classList.remove('hidden');

    if (esUrgente && badge) {
        badge.classList.remove('hidden');
        banner.classList.add('border-red-500', 'bg-red-50');
        banner.classList.remove('border-orange-500');
    }
};

// --- 2. GESTIÓN DE STOCK (SUPABASE) ---
const fetchStock = async () => {
    const { data, error } = await supabase.from('inventario').select('*');
    if (error) { console.error('Error cargando stock:', error); return; }
    
    if (data) {
        products = products.map(p => {
            const stockInfo = data.find(item => item.id === p.id);
            return { ...p, disponible: stockInfo ? stockInfo.disponible : true };
        });
        renderProducts(products); 
    }
};

const subscribeToStock = () => {
    supabase.channel('cambios-stock')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'inventario' }, (payload) => {
            const updatedItem = payload.new;
            const productIndex = products.findIndex(p => p.id === updatedItem.id);
            if (productIndex !== -1) {
                products[productIndex].disponible = updatedItem.disponible;
                renderProducts(products);
            }
        }).subscribe();
};

// --- 3. LÓGICA DE CARRITO (MEJORADA) ---

// Agregar producto (Sin abrir carrito, solo feedback)
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
    
    // ANIMACIONES (Feedback Visual)
    animateCartIcon(); // El ícono del carrito salta
    showAddedToast(product.nombre); // Mensaje flotante verde
};

// Cambiar cantidad (+/-) desde la canasta
const changeCartQuantity = (uniqueId, change) => {
    const itemIndex = cart.findIndex(item => item.uniqueId === uniqueId);
    if (itemIndex === -1) return;

    const newQuantity = cart[itemIndex].quantity + change;

    if (newQuantity > 0) {
        cart[itemIndex].quantity = newQuantity;
    } else {
        // Si baja a 0, preguntamos o eliminamos directo? Eliminamos directo por UX rápida.
        cart.splice(itemIndex, 1);
    }
    updateCartUI();
};

const removeFromCart = (uniqueId) => {
    cart = cart.filter(item => item.uniqueId !== uniqueId);
    updateCartUI();
};

const updateCartUI = () => {
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartTotalElement = document.getElementById('cart-total');
    const cartItemsContainer = document.getElementById('cart-items');

    // 1. Contador Flotante
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCountElement.classList.remove('scale-0');
        checkoutBtn.disabled = false;
    } else {
        cartCountElement.classList.add('scale-0');
        checkoutBtn.disabled = true;
    }

    // 2. Total Monetario
    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    cartTotalElement.textContent = formatMoney(totalPrice) + "*";

    // 3. Renderizar Items con Botones +/-
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                <i class="fa-solid fa-basket-shopping text-5xl mb-4 text-gray-200"></i>
                <p>Tu canasta está vacía</p>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 mb-2 animate-fade-in select-none">
                <div class="flex items-center gap-3">
                    <img src="${item.imagen}" class="w-12 h-12 rounded-lg object-cover bg-gray-100">
                    <div>
                        <h5 class="font-bold text-sm text-gray-800 dark:text-white">${item.nombre}</h5>
                        <p class="text-xs text-agro-primary font-bold">${item.variantName}</p>
                        
                        <div class="flex items-center gap-3 mt-2 bg-gray-50 dark:bg-slate-700 rounded-full px-1 w-fit">
                            <button class="qty-btn w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition" data-action="decrease" data-id="${item.uniqueId}">
                                <i class="fa-solid fa-minus text-[10px]"></i>
                            </button>
                            <span class="text-xs font-bold w-4 text-center dark:text-white">${item.quantity}</span>
                            <button class="qty-btn w-6 h-6 rounded-full flex items-center justify-center text-agro-primary hover:bg-white hover:shadow-sm transition" data-action="increase" data-id="${item.uniqueId}">
                                <i class="fa-solid fa-plus text-[10px]"></i>
                            </button>
                        </div>

                    </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="font-bold text-sm text-gray-700 dark:text-gray-200">~${formatMoney(item.precio * item.quantity)}</span>
                    <button class="remove-btn text-red-400 text-[10px] hover:text-red-600 hover:underline transition" data-unique-id="${item.uniqueId}">Eliminar</button>
                </div>
            </div>
        `).join('');

        // Nota legal
        const alertDiv = document.createElement('div');
        alertDiv.className = "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 p-3 rounded-lg text-xs text-orange-800 dark:text-orange-200 mt-4 flex gap-2";
        alertDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation mt-0.5"></i> <p><strong>Nota:</strong> Precios sujetos a cambios leves según cosecha.</p>`;
        cartItemsContainer.appendChild(alertDiv);

        // ASIGNAR EVENTOS (+/-)
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // stopPropagation evita clicks fantasmas si hubiera contenedores clicables
                e.stopPropagation();
                const uniqueId = e.currentTarget.getAttribute('data-id');
                const action = e.currentTarget.getAttribute('data-action');
                changeCartQuantity(uniqueId, action === 'increase' ? 1 : -1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => removeFromCart(e.currentTarget.getAttribute('data-unique-id')));
        });
    }
};

// --- 4. CHECKOUT (SOLUCIÓN DEFINITIVA A BLOQUEOS) ---
const checkout = () => {
    if (cart.length === 0) return;

    // 1. Pedir datos (Usando prompt estándar)
    const nombre = prompt("👤 Por favor, ingresa tu Nombre Completo para el pedido:");
    if (!nombre || nombre.trim() === "") return; 

    const direccion = prompt("📍 Ingresa tu Dirección de Entrega (Conjunto/Torre/Apto):");
    if (!direccion || direccion.trim() === "") return; 

    // 2. Feedback visual
    const checkoutBtn = document.getElementById('checkout-btn');
    const btnTextOriginal = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Abriendo WhatsApp...';
    checkoutBtn.disabled = true;

    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

    // 3. BACKUP EN NUBE (Fire & Forget)
    // No usamos 'await' para no detener el hilo principal y abrir WhatsApp rápido
    supabase
        .from('pedidos')
        .insert([{ 
            nombre_cliente: nombre, 
            direccion_entrega: direccion, 
            productos: cart, 
            total_estimado: totalPrice, 
            estado: 'pendiente' 
        }])
        .then(({ error }) => { if (error) console.warn("Error backup nube:", error); });

    // 4. CONSTRUIR URL
    let message = `¡Hola amigos de La Floresta! 👋%0A%0A`;
    message += `Soy *${nombre}*. Me gustaría pedir:%0A%0A`;
    
    cart.forEach(item => {
        message += `✅ *${item.quantity} x ${item.nombre}* - ${item.variantName}%0A   └ Ref: ${formatMoney(item.precio * item.quantity)}%0A`;
    });
    
    message += `%0A💰 *VALOR APROXIMADO: ${formatMoney(totalPrice)}*`;
    message += `%0A_(Entiendo que este valor es una referencia)_`;
    message += `%0A%0A----------------------------------%0A`;
    message += `📍 *Dirección:* ${direccion}%0A`;
    message += `📦 *Entrega:* Miércoles o Sábado%0A`;
    message += `🤝 *Pago:* Contra Entrega`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    // 5. NAVEGACIÓN SEGURA (ESTO EVITA EL BLOQUEO)
    // Usamos location.href para navegar en la misma pestaña. 
    // Los bloqueadores de popups NO bloquean esto.
    window.location.href = whatsappUrl;

    // Restaurar botón (por si el usuario regresa con el botón Atrás)
    setTimeout(() => {
        checkoutBtn.innerHTML = btnTextOriginal;
        checkoutBtn.disabled = false;
    }, 2000);
};

// --- 5. UI HELPERS & ANIMACIONES ---

const animateCartIcon = () => {
    const cartBtn = document.getElementById('cart-btn');
    cartBtn.classList.remove('animate-bounce');
    void cartBtn.offsetWidth; // Reiniciar animación
    cartBtn.classList.add('animate-bounce');
    // Quitar la clase después de un segundo
    setTimeout(() => cartBtn.classList.remove('animate-bounce'), 1000);
};

const showAddedToast = (productName) => {
    const toast = document.createElement('div');
    // Estilo verde "Éxito"
    toast.className = "fixed top-24 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in border-2 border-green-400";
    toast.innerHTML = `<i class="fa-solid fa-check-circle text-xl"></i> <div><p class="text-xs font-bold uppercase opacity-80">Agregado</p><p class="font-bold text-sm">${productName}</p></div>`;
    document.body.appendChild(toast);
    
    // Auto-eliminar
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
};

// --- RENDERIZADO GLOBAL ---
const grid = document.getElementById('product-grid');
const renderProducts = (lista) => {
    if (lista.length > 0) {
        grid.innerHTML = lista.map(product => ProductCard(product, false)).join(''); // False = Modo Cliente
        
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(e.currentTarget.disabled) return;
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                const select = document.querySelector(`.variant-selector[data-id="${id}"]`);
                const variantIndex = parseInt(select.value);
                addToCart(id, variantIndex);
                // NOTA: Ya no llamamos a openCart() aquí
            });
        });
    } else {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400">Cargando productos...</div>`;
    }
};

window.updateCardPrice = (selectElement, productId) => {
    const variantIndex = selectElement.value;
    const product = products.find(p => p.id === productId);
    const newPrice = product.variantes[variantIndex].precio;
    const priceDisplay = document.getElementById(`price-${productId}`);
    if(priceDisplay) priceDisplay.textContent = formatMoney(newPrice);
};

const showToast = () => {
    const nombres = ["Doña Gloria", "Don Jorge", "María", "Camilo", "La Sra. Rosa"];
    const randomName = nombres[Math.floor(Math.random() * nombres.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];

    const toast = document.createElement('div');
    toast.className = "fixed bottom-6 left-6 z-40 bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border-l-4 border-agro-primary flex items-center gap-3 transform translate-y-20 opacity-0 transition-all duration-500 pointer-events-none";
    toast.innerHTML = `
        <img src="${randomProduct.imagen}" class="w-10 h-10 rounded-md object-cover">
        <div>
            <p class="text-xs text-gray-500 dark:text-gray-400">Hace un momento</p>
            <p class="text-sm dark:text-gray-200"><strong>${randomName}</strong> pidió <span class="text-agro-primary font-bold">${randomProduct.nombre}</span></p>
        </div>
    `;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => toast.classList.remove('translate-y-20', 'opacity-0'));
    setTimeout(() => { 
        toast.classList.add('translate-y-20', 'opacity-0'); 
        setTimeout(() => toast.remove(), 500); 
    }, 4000);
};

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
    startHeroSlideshow();
    actualizarDeadlineBanner();
    await fetchStock(); 
    subscribeToStock();

    // Eventos UI
    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartModal = document.getElementById('cart-modal');
    
    const openCart = () => { cartModal.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const closeCart = () => { cartModal.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; };

    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    document.getElementById('checkout-btn').addEventListener('click', checkout);

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.theme = isDark ? 'dark' : 'light';
    });

    const mobileMenu = document.getElementById('mobile-menu');
    document.getElementById('mobile-menu-btn').addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
    document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.add('hidden')));

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-agro-dark', 'text-white', 'shadow');
                b.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            });
            e.target.classList.remove('text-gray-500', 'dark:text-gray-400');
            e.target.classList.add('bg-agro-dark', 'text-white', 'shadow');
            const cat = e.target.getAttribute('data-category');
            renderProducts(cat === 'todo' ? products : products.filter(p => p.categoria === cat));
        });
    });

    setTimeout(() => { showToast(); setInterval(showToast, 30000); }, 3000);
});