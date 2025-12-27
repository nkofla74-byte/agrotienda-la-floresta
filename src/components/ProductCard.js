import { formatMoney } from '../utils/formatters';

export const ProductCard = (product, isAdminMode = false) => {
    const isAvailable = product.disponible !== false;
    
    // Protección: Si por error no hay variantes, ponemos 0
    const precioInicial = product.variantes && product.variantes.length > 0 
        ? product.variantes[0].precio 
        : 0;
        
    const isLowStock = isAvailable && (product.id % 3 === 0); 
    
    const optionsHTML = product.variantes ? product.variantes.map((v, index) => 
        `<option value="${index}">${v.nombre}</option>`
    ).join('') : '';

    // --- Lógica de Botones Visualmente Mejorada para Dark Mode ---
    let actionButtonHTML;
    if (isAdminMode) {
        if (isAvailable) {
            // Admin: Desactivar (Rojo adaptado)
            actionButtonHTML = `<button onclick="window.toggleAvailability(${product.id})" class="w-full bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 font-bold py-3 rounded-xl border border-red-300 dark:border-red-800 transition-colors">Desactivar</button>`;
        } else {
            // Admin: Activar (Verde adaptado)
            actionButtonHTML = `<button onclick="window.toggleAvailability(${product.id})" class="w-full bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 font-bold py-3 rounded-xl border border-green-300 dark:border-green-800 transition-colors">Activar</button>`;
        }
    } else {
        // Usuario: Botón de compra
        const btnClass = isAvailable 
            ? "bg-agro-primary hover:bg-agro-dark text-white shadow-lg shadow-green-200/50 dark:shadow-none add-to-cart-btn" 
            : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-slate-600";
            
        const btnText = isAvailable 
            ? `<i class="fa-solid fa-basket-shopping"></i><span>Agregar</span>` 
            : `<span class="font-medium text-xs"><i class="fa-regular fa-clock"></i> Próxima Cosecha</span>`;
        
        actionButtonHTML = `
            <button class="w-full font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${btnClass}" data-id="${product.id}" ${!isAvailable ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;
    }

    // Opacidad y escala de grises para productos agotados
    const cardStateClass = isAvailable ? "" : "opacity-95 grayscale-[0.6] dark:grayscale-[0.8]"; 

    return `
    <div class="product-card group bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-500 flex flex-col h-full relative isolate ${cardStateClass}">
        
        <div class="h-64 overflow-hidden relative bg-gray-100 dark:bg-slate-700">
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            
            <span class="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-agro-dark dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 border border-white/50 dark:border-slate-600">${product.categoria}</span>
            
            ${!isAvailable ? `<div class="absolute inset-0 bg-black/40 dark:bg-black/60 z-10 flex items-center justify-center backdrop-blur-[2px]"><span class="bg-white/95 dark:bg-slate-800 text-agro-dark dark:text-red-400 font-black text-sm px-5 py-2 rounded-full shadow-2xl transform -rotate-6 border-2 border-agro-primary dark:border-red-500">AGOTADO 🍂</span></div>` : ''}
        </div>

        <div class="p-6 flex flex-col flex-grow relative bg-white dark:bg-slate-800 transition-colors duration-300">
            <h4 class="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">${product.nombre}</h4>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2 h-10">${product.descripcion}</p>
            
            <div class="mt-auto bg-gray-50 dark:bg-slate-700/30 rounded-2xl p-4 border border-gray-100 dark:border-slate-700/50 transition-colors duration-300">
                <div class="text-center mb-3">
                    <span class="text-[10px] text-orange-500 dark:text-orange-300 font-bold tracking-widest uppercase bg-orange-100 dark:bg-orange-900/20 px-2 py-0.5 rounded">Precio Referencia *</span>
                    <div class="text-2xl font-black text-agro-dark dark:text-white mt-1 transition-all duration-300" id="price-${product.id}">
                        ${formatMoney(precioInicial)}
                    </div>
                </div>

                <div class="relative mb-4">
                    <select class="variant-selector w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-sm rounded-xl block pl-3 p-2.5 shadow-sm focus:ring-2 focus:ring-agro-primary dark:focus:ring-green-500 outline-none transition-colors duration-300 disabled:bg-gray-100 dark:disabled:bg-slate-700" data-id="${product.id}" onchange="window.updateCardPrice(this, ${product.id})" ${(!isAvailable && !isAdminMode) ? 'disabled' : ''}>
                        ${optionsHTML}
                    </select>
                </div>
                
                ${actionButtonHTML}
                
                <p class="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-2 italic">* Confirmar valor por WhatsApp</p>
            </div>
        </div>
    </div>
    `;
};