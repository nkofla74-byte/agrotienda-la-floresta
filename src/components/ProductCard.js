import { formatMoney } from '../utils/formatters';

// Aceptamos el segundo parámetro 'isAdminMode'
export const ProductCard = (product, isAdminMode = false) => {
    const isAvailable = product.disponible !== false;
    const precioInicial = product.variantes[0].precio;
    const isLowStock = isAvailable && (product.id % 3 === 0); 
    
    const optionsHTML = product.variantes.map((v, index) => 
        `<option value="${index}">${v.nombre}</option>`
    ).join('');

    // --- LÓGICA DE BOTONES ---
    let actionButtonHTML;
    
    if (isAdminMode) {
        // MODO ADMIN: Botones de Gestión
        if (isAvailable) {
            actionButtonHTML = `
                <button onclick="window.toggleAvailability(${product.id})" class="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 rounded-xl border border-red-300 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-power-off"></i> Desactivar
                </button>
            `;
        } else {
            actionButtonHTML = `
                <button onclick="window.toggleAvailability(${product.id})" class="w-full bg-green-100 hover:bg-green-200 text-green-700 font-bold py-3 rounded-xl border border-green-300 transition flex items-center justify-center gap-2">
                    <i class="fa-solid fa-power-off"></i> Activar
                </button>
            `;
        }
    } else {
        // MODO CLIENTE: Botones de Compra (Lógica anterior)
        const btnClass = isAvailable 
            ? "bg-agro-primary hover:bg-agro-dark text-white shadow-green-200 hover:shadow-green-300 active:scale-95 add-to-cart-btn" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none border border-gray-200";

        const btnText = isAvailable 
            ? `<i class="fa-solid fa-basket-shopping"></i><span>Agregar</span>` 
            : `<span class="font-medium text-xs">Próxima Cosecha</span>`;
        
        actionButtonHTML = `
            <button 
                class="w-full font-bold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${btnClass}"
                data-id="${product.id}"
                ${!isAvailable ? 'disabled' : ''}
            >
                ${btnText}
            </button>
        `;
    }

    const cardStateClass = isAvailable ? "" : "opacity-95"; 

    return `
    <div class="product-card group bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-2xl dark:shadow-black/60 border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-500 flex flex-col h-full relative isolate ${cardStateClass}">
        
        <div class="h-64 overflow-hidden relative bg-gray-100 dark:bg-slate-700">
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            
            <span class="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-agro-dark dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 border border-white/50 dark:border-slate-600">
                ${product.categoria}
            </span>

            ${!isAvailable ? `
            <div class="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <span class="bg-white/95 text-agro-dark font-black text-sm px-5 py-2 rounded-full shadow-2xl transform -rotate-6 border-2 border-agro-primary">
                    AGOTADO 🍂
                </span>
            </div>
            ` : ''}
        </div>

        <div class="p-6 flex flex-col flex-grow relative bg-white dark:bg-slate-800 transition-colors">
            
            <h4 class="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">${product.nombre}</h4>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2 h-10">${product.descripcion}</p>
            
            <div class="mt-auto bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div class="relative mb-4">
                    <select 
                        class="variant-selector w-full bg-white dark:bg-slate-800 border border-gray-200 text-gray-700 text-sm rounded-xl block pl-3 p-2.5 shadow-sm font-medium disabled:bg-gray-50 disabled:text-gray-400"
                        data-id="${product.id}"
                        onchange="window.updateCardPrice(this, ${product.id})"
                        ${(!isAvailable && !isAdminMode) ? 'disabled' : ''} 
                    >
                        ${optionsHTML}
                    </select>
                </div>

                ${actionButtonHTML}
            </div>
        </div>
    </div>
    `;
};