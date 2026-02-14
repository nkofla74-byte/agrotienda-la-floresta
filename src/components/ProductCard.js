import { formatMoney } from '../utils/formatters';

export const ProductCard = (product, isAdminMode = false) => {
    const isAvailable = product.disponible !== false;
    
    // Precio inicial (primera variante)
    const precioInicial = product.variantes && product.variantes.length > 0 
        ? product.variantes[0].precio 
        : 0;

    // Generar opciones del select (Libras, Kilos, etc.)
    const optionsHTML = product.variantes ? product.variantes.map((v, index) => 
        `<option value="${index}">${v.nombre}</option>`
    ).join('') : '';

    // --- Lógica del Botón Principal ---
    let actionButtonHTML;
    
    if (isAdminMode) {
        // MODO ADMIN: Botones de Activar/Desactivar
        const btnColor = isAvailable ? "red" : "green";
        const btnText = isAvailable ? "Desactivar" : "Activar";
        actionButtonHTML = `
            <button onclick="window.toggleAvailability(${product.id})" 
                class="w-full mt-4 bg-${btnColor}-100 hover:bg-${btnColor}-200 text-${btnColor}-700 font-bold py-3 rounded-xl border border-${btnColor}-300 transition-colors">
                ${btnText}
            </button>
        `;
    } else {
        // MODO CLIENTE: Controles de compra
        if (isAvailable) {
            actionButtonHTML = `
                <div class="mt-4 space-y-3">
                    <div class="flex items-center justify-between gap-3">
                        
                        <div class="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                            <button class="card-qty-btn minus w-8 h-8 flex items-center justify-center text-gray-500 hover:text-agro-primary hover:bg-white dark:hover:bg-slate-600 rounded-l-lg transition" data-id="${product.id}">
                                <i class="fa-solid fa-minus text-xs"></i>
                            </button>
                            <input type="number" 
                                   class="card-qty-input w-8 h-8 text-center bg-transparent text-sm font-bold text-gray-700 dark:text-white outline-none" 
                                   value="1" min="1" max="99" readonly data-id="${product.id}">
                            <button class="card-qty-btn plus w-8 h-8 flex items-center justify-center text-gray-500 hover:text-agro-primary hover:bg-white dark:hover:bg-slate-600 rounded-r-lg transition" data-id="${product.id}">
                                <i class="fa-solid fa-plus text-xs"></i>
                            </button>
                        </div>

                        <div class="text-right">
                            <div class="text-xl font-black text-agro-dark dark:text-green-400 leading-none transition-all" id="price-${product.id}">
                                ${formatMoney(precioInicial)}
                            </div>
                            <span class="text-[10px] text-gray-400 font-medium">Precio estimado</span>
                        </div>
                    </div>

                    <button class="add-to-cart-btn w-full bg-agro-primary hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200/50 dark:shadow-none flex items-center justify-center gap-2 transition-all transform active:scale-95" data-id="${product.id}">
                        <i class="fa-solid fa-basket-shopping"></i> Agregar al Canasto
                    </button>
                </div>
            `;
        } else {
            // Producto Agotado
            actionButtonHTML = `
                <div class="mt-4 w-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 font-bold py-3 rounded-xl border border-gray-200 dark:border-slate-600 flex items-center justify-center gap-2 cursor-not-allowed">
                    <i class="fa-regular fa-clock"></i> Próxima Cosecha
                </div>
            `;
        }
    }

    // Estilos de tarjeta agotada
    const cardStateClass = isAvailable ? "" : "opacity-75 grayscale"; 

    return `
    <div class="product-card group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-300 flex flex-col h-full ${cardStateClass}">
        
        <div class="h-56 overflow-hidden relative bg-gray-100 dark:bg-slate-700">
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            
            <span class="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-agro-dark dark:text-green-400 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm z-10 uppercase tracking-wide">
                ${product.categoria}
            </span>

            ${!isAvailable ? `<div class="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] z-20"><span class="bg-red-500 text-white font-bold text-sm px-4 py-1 rounded-full transform -rotate-3 shadow-lg border-2 border-white">AGOTADO</span></div>` : ''}
        </div>

        <div class="p-5 flex flex-col flex-grow">
            <div class="mb-3">
                <h4 class="font-bold text-lg text-gray-800 dark:text-gray-100 leading-tight mb-1 group-hover:text-agro-primary transition-colors">${product.nombre}</h4>
                <p class="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 leading-relaxed h-8">${product.descripcion || 'Producto fresco del campo.'}</p>
            </div>

            <div class="mt-auto">
                <div class="relative">
                    <select class="variant-selector w-full bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg block p-2.5 outline-none focus:ring-1 focus:ring-agro-primary cursor-pointer" 
                            data-id="${product.id}" 
                            onchange="window.updateCardPrice(this, ${product.id})"
                            ${!isAvailable && !isAdminMode ? 'disabled' : ''}>
                        ${optionsHTML}
                    </select>
                </div>

                ${actionButtonHTML}
            </div>
        </div>
    </div>
    `;
};