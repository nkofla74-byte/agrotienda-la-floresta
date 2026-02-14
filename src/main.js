import './style.css';
import { ProductCard } from './components/ProductCard';
import { formatMoney } from './utils/formatters';
import { supabase } from './supabaseClient'; 

// --- ESTADO ---
let products = []; 
let cart = [];
const WHATSAPP_NUMBER = "573182359277"; 

// --- 1. LÓGICA DE FECHAS (Sin cambios) ---
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

    if (diaSemana === 4 || diaSemana === 5 || diaSemana === 6 || (diaSemana === 0 && hora < 18)) {
        texto = "Haz tu pedido antes del <strong>DOMINGO 6:00 PM</strong>. Recibes el Martes/Miércoles.";
        if (diaSemana === 0) esUrgente = true;
    } else {
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

// --- 2. GESTIÓN DE PRODUCTOS ---
const fetchProducts = async () => {
    const grid = document.getElementById('product-grid');
    
    try {
        const { data: productosDB, error } = await supabase
            .from('productos')
            .select(`*, variantes(*), categorias(nombre)`)
            .eq('activo', true)
            .order('id', { ascending: true });

        if (error) throw error;
        
        if (productosDB && productosDB.length > 0) {
            products = productosDB.map(p => ({
                id: p.id,
                nombre: p.nombre,
                descripcion: p.descripcion,
                imagen: p.imagen_url || '/images/vite.svg',
                categoria: p.categorias?.nombre || 'Varios', 
                disponible: p.activo,
                variantes: p.variantes.map(v => ({
                    nombre: `${v.unidad} ${v.calidad && v.calidad !== 'Estándar' ? `(${v.calidad})` : ''}`,
                    precio: v.precio,
                    stock: v.stock_disponible,
                    unidad: v.unidad
                })).sort((a, b) => a.precio - b.precio)
            }));

            renderProducts(products); 
        } else {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500">No hay productos disponibles por el momento.</div>`;
        }

    } catch (error) {
        console.error('Error cargando productos:', error);
        // Fallback: Si falla la BD, limpia el grid para que no se quede "Cargando..."
        if(grid) grid.innerHTML = `<div class="col-span-full text-center py-12 text-red-400">Error de conexión. Intenta recargar.</div>`;
    }
};

// Suscripción a cambios
const subscribeToUpdates = () => {
    supabase.channel('cambios-productos')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'productos' }, () => fetchProducts())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'variantes' }, () => fetchProducts())
        .subscribe();
};

// --- 3. LÓGICA DE CARRITO (CORREGIDA Y BLINDADA) ---
const addToCart = (productId, variantIndex, quantityToAdd) => {
    try {
        const product = products.find(p => p.id === productId);
        if (!product) { console.error("Producto no encontrado en memoria"); return; }

        const variant = product.variantes[variantIndex];
        if (!variant) { console.error("Variante no válida"); return; }
        
        if (variant.stock === false) {
            alert("Esta presentación está agotada temporalmente.");
            return;
        }

        const uniqueId = `${productId}-${variantIndex}`;
        const existingItem = cart.find(item => item.uniqueId === uniqueId);
        
        if (existingItem) {
            existingItem.quantity += quantityToAdd;
        } else {
            cart.push({
                uniqueId: uniqueId,
                id: product.id,
                nombre: product.nombre,
                imagen: product.imagen,
                variantName: variant.nombre,
                precio: variant.precio,
                quantity: quantityToAdd
            });
        }
        updateCartUI();
        animateCartIcon(); 
        showAddedToast(product.nombre, quantityToAdd);
    } catch (err) {
        console.error("Error en addToCart:", err);
    }
};

const changeCartQuantity = (uniqueId, change) => {
    const itemIndex = cart.findIndex(item => item.uniqueId === uniqueId);
    if (itemIndex === -1) return;

    const newQuantity = cart[itemIndex].quantity + change;
    if (newQuantity > 0) {
        cart[itemIndex].quantity = newQuantity;
    } else {
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

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountElement) cartCountElement.textContent = totalItems;
    
    if (totalItems > 0) {
        cartCountElement.classList.remove('scale-0');
        checkoutBtn.disabled = false;
    } else {
        cartCountElement.classList.add('scale-0');
        checkoutBtn.disabled = true;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    if (cartTotalElement) cartTotalElement.textContent = formatMoney(totalPrice) + "*";

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
                            <button class="qty-btn w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-white hover:shadow-sm transition" data-action="decrease" data-id="${item.uniqueId}"><i class="fa-solid fa-minus text-[10px]"></i></button>
                            <span class="text-xs font-bold w-4 text-center dark:text-white">${item.quantity}</span>
                            <button class="qty-btn w-6 h-6 rounded-full flex items-center justify-center text-agro-primary hover:bg-white hover:shadow-sm transition" data-action="increase" data-id="${item.uniqueId}"><i class="fa-solid fa-plus text-[10px]"></i></button>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="font-bold text-sm text-gray-700 dark:text-gray-200">~${formatMoney(item.precio * item.quantity)}</span>
                    <button class="remove-btn text-red-400 text-[10px] hover:text-red-600 hover:underline transition" data-unique-id="${item.uniqueId}">Eliminar</button>
                </div>
            </div>
        `).join('');

        const alertDiv = document.createElement('div');
        alertDiv.className = "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 p-3 rounded-lg text-xs text-orange-800 dark:text-orange-200 mt-4 flex gap-2";
        alertDiv.innerHTML = `<i class="fa-solid fa-triangle-exclamation mt-0.5"></i> <p><strong>Nota:</strong> Precios sujetos a cambios leves según cosecha.</p>`;
        cartItemsContainer.appendChild(alertDiv);

        // Listeners del carrito
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
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

// --- 4. CHECKOUT (CORREGIDO PARA ESPERAR BASE DE DATOS) ---
const checkout = async () => {
    if (cart.length === 0) return;

    const nombre = prompt("👤 Por favor, ingresa tu Nombre Completo para el pedido:");
    if (!nombre || nombre.trim() === "") return; 

    const direccion = prompt("📍 Ingresa tu Dirección de Entrega (Conjunto/Torre/Apto):");
    if (!direccion || direccion.trim() === "") return; 

    const checkoutBtn = document.getElementById('checkout-btn');
    const btnTextOriginal = checkoutBtn.innerHTML;
    checkoutBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Guardando...';
    checkoutBtn.disabled = true;

    const totalPrice = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

    try {
        // --- GUARDADO SEGURO EN BD (CON AWAIT) ---
        // Esperamos a que la base de datos confirme antes de seguir
        const { error } = await supabase.from('pedidos').insert([{ 
            cliente_nombre: nombre, 
            cliente_direccion: direccion, 
            detalle_pedido: cart, 
            total: totalPrice, 
            estado: 'pendiente' 
        }]);

        if (error) throw error;

    } catch (error) {
        console.error("Error guardando en BD (Continuando a WhatsApp):", error);
        // No bloqueamos la venta si falla la BD, pero dejamos registro en consola
    }

    // --- GENERACIÓN DE MENSAJE Y REDIRECCIÓN ---
    let message = `¡Hola amigos de La Floresta! 👋\n\n`;
    message += `Soy *${nombre}*. Me gustaría pedir:\n\n`;
    
    cart.forEach(item => {
        message += `✅ *${item.quantity} x ${item.nombre}* - ${item.variantName}\n   └ Ref: ${formatMoney(item.precio * item.quantity)}\n`;
    });
    
    message += `\n💰 *VALOR APROXIMADO: ${formatMoney(totalPrice)}*`;
    message += `\n_(Entiendo que este valor es una referencia)_\n`;
    message += `\n----------------------------------\n`;
    message += `📦 *Confirmación de Entrega:*\n`;
    message += `Tengo presente los días de entrega.\n`;
    message += `🤝 Pago Contra Entrega.\n`;
    message += `\n📍 *Dirección:* ${direccion}`;
    
    // Codificar URL de forma segura para evitar errores con # o tildes
    const mensajeCodificado = encodeURIComponent(message);
    const numeroLimpio = WHATSAPP_NUMBER.replace(/\D/g, ''); // Limpiar el número

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    let urlWhatsApp = '';
    if (isMobile) {
        urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroLimpio}&text=${mensajeCodificado}`;
    } else {
        urlWhatsApp = `https://web.whatsapp.com/send?phone=${numeroLimpio}&text=${mensajeCodificado}`;
    }

    // Abrir WhatsApp en nueva pestaña
    window.open(urlWhatsApp, '_blank');

    setTimeout(() => {
        checkoutBtn.innerHTML = btnTextOriginal;
        checkoutBtn.disabled = false;
        // Opcional: Podrías limpiar el carrito aquí si quieres: cart = []; updateCartUI();
    }, 1000);
};

// --- 5. UI HELPERS ---
const animateCartIcon = () => {
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.classList.remove('animate-bounce');
        void cartBtn.offsetWidth; 
        cartBtn.classList.add('animate-bounce');
        setTimeout(() => cartBtn.classList.remove('animate-bounce'), 1000);
    }
};

const showAddedToast = (productName, quantity) => {
    const toast = document.createElement('div');
    toast.className = "fixed top-24 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in border-2 border-green-400";
    toast.innerHTML = `<i class="fa-solid fa-check-circle text-xl"></i> <div><p class="text-xs font-bold uppercase opacity-80">Agregado</p><p class="font-bold text-sm">${quantity}x ${productName}</p></div>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.5s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
};

const grid = document.getElementById('product-grid');

// --- RENDERIZADO CON PROTECCIÓN ---
const renderProducts = (lista) => {
    if (lista && lista.length > 0) {
        grid.innerHTML = lista.map(product => ProductCard(product, false)).join('');
        
        // A. Botones de cantidad (+/-) en la tarjeta
        document.querySelectorAll('.card-qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                const input = document.querySelector(`.card-qty-input[data-id="${id}"]`);
                if (!input) return; // Si no hay input, salir

                let val = parseInt(input.value);
                if (e.currentTarget.classList.contains('plus')) val++;
                else if (e.currentTarget.classList.contains('minus') && val > 1) val--;
                input.value = val;
            });
        });

        // B. Botón "Agregar al Canasto"
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(e.currentTarget.disabled) return;
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                
                // Buscar elementos en la tarjeta
                const select = document.querySelector(`.variant-selector[data-id="${id}"]`);
                const qtyInput = document.querySelector(`.card-qty-input[data-id="${id}"]`);
                
                // VALIDACIÓN CRÍTICA:
                // Si el usuario no actualizó ProductCard.js, 'qtyInput' será null.
                // Usamos "1" por defecto si no se encuentra el input.
                const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
                
                if (select) {
                    const variantIndex = parseInt(select.value);
                    addToCart(id, variantIndex, quantity);
                } else {
                    console.error("No se encontró el selector de variantes. Revisa ProductCard.js");
                }
                
                // Resetear visualmente
                if (qtyInput) qtyInput.value = 1;
            });
        });
    } else {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-gray-400">No se encontraron productos.</div>`;
    }
};

window.updateCardPrice = (selectElement, productId) => {
    const variantIndex = selectElement.value;
    const product = products.find(p => p.id === productId);
    if(product && product.variantes[variantIndex]){
        const newPrice = product.variantes[variantIndex].precio;
        const priceDisplay = document.getElementById(`price-${productId}`);
        if(priceDisplay) {
            priceDisplay.textContent = formatMoney(newPrice);
            priceDisplay.classList.add('scale-110', 'text-green-600');
            setTimeout(() => priceDisplay.classList.remove('scale-110', 'text-green-600'), 200);
        }
    }
};

const showToast = () => {
    if(products.length === 0) return;
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
    await fetchProducts(); 
    subscribeToUpdates();

    const cartBtn = document.getElementById('cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartModal = document.getElementById('cart-modal');
    
    const openCart = () => { cartModal.classList.add('open'); cartOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; };
    const closeCart = () => { cartModal.classList.remove('open'); cartOverlay.classList.remove('open'); document.body.style.overflow = ''; };

    if(cartBtn) cartBtn.addEventListener('click', openCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCart);
    const checkoutButton = document.getElementById('checkout-btn');
    if(checkoutButton) checkoutButton.addEventListener('click', checkout);

    const themeToggle = document.getElementById('theme-toggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.theme = isDark ? 'dark' : 'light';
        });
    }

    const mobileMenu = document.getElementById('mobile-menu');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if(mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.add('hidden')));
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('bg-agro-dark', 'text-white', 'shadow');
                b.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-50', 'dark:hover:bg-gray-700');
            });
            e.target.classList.remove('text-gray-500', 'dark:text-gray-400');
            e.target.classList.add('bg-agro-dark', 'text-white', 'shadow');
            const cat = e.target.getAttribute('data-category');
            if (cat === 'todo') {
                renderProducts(products);
            } else {
                const filtrados = products.filter(p => p.categoria.toLowerCase() === cat.toLowerCase());
                renderProducts(filtrados);
            }
        });
    });

    setTimeout(() => { showToast(); setInterval(showToast, 30000); }, 3000);
});