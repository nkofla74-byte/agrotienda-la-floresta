import { formatMoney } from '../utils/formatters';

export const ProductCard = (product, isAdminMode = false) => {
    const isAvailable = product.disponible !== false;
    // Protección: Si por error no hay variantes, ponemos 0 para que no rompa la página
    const precioInicial = product.variantes && product.variantes.length > 0 
        ? product.variantes[0].precio 
        : 0;
        
    const isLowStock = isAvailable && (product.id % 3 === 0); 
    
    const optionsHTML = product.variantes ? product.variantes.map((v, index) => 
        `<option value="${index}">${v.nombre}</option>`
    ).join('') : '';

    // Lógica de Botones (Igual que antes)
    let actionButtonHTML;
    if (isAdminMode) {
        if (isAvailable) {
            actionButtonHTML = `<button onclick="window.toggleAvailability(${product.id})" class="w-full bg-red-100 text-red-700 font-bold py-3 rounded-xl border border-red-300">Desactivar</button>`;
        } else {
            actionButtonHTML = `<button onclick="window.toggleAvailability(${product.id})" class="w-full bg-green-100 text-green-700 font-bold py-3 rounded-xl border border-green-300">Activar</button>`;
        }
    } else {
        const btnClass = isAvailable 
            ? "bg-agro-primary hover:bg-agro-dark text-white shadow-green-200 add-to-cart-btn" 
            : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200";
        const btnText = isAvailable 
            ? `<i class="fa-solid fa-basket-shopping"></i><span>Agregar</span>` 
            : `<span class="font-medium text-xs">Próxima Cosecha</span>`;
        
        actionButtonHTML = `
            <button class="w-full font-bold py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${btnClass}" data-id="${product.id}" ${!isAvailable ? 'disabled' : ''}>
                ${btnText}
            </button>
        `;
    }

    const cardStateClass = isAvailable ? "" : "opacity-95"; 

    return `
    <div class="product-card group bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-500 flex flex-col h-full relative isolate ${cardStateClass}">
        
        <div class="h-64 overflow-hidden relative bg-gray-100 dark:bg-slate-700">
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            <span class="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-agro-dark dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 border border-white/50">${product.categoria}</span>
            ${!isAvailable ? `<div class="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[1px]"><span class="bg-white/95 text-agro-dark font-black text-sm px-5 py-2 rounded-full shadow-2xl transform -rotate-6 border-2 border-agro-primary">AGOTADO 🍂</span></div>` : ''}
        </div>

        <div class="p-6 flex flex-col flex-grow relative bg-white dark:bg-slate-800 transition-colors">
            <h4 class="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">${product.nombre}</h4>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2 h-10">${product.descripcion}</p>
            
            <div class="mt-auto bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                <div class="text-center mb-2">
                    <span class="text-[10px] text-orange-500 dark:text-orange-400 font-bold tracking-widest uppercase bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">Precio Referencia *</span>
                    <div class="text-2xl font-black text-agro-dark dark:text-white mt-1 transition-all duration-300" id="price-${product.id}">
                        ${formatMoney(precioInicial)}
                    </div>
                </div>

                <div class="relative mb-4">
                    <select class="variant-selector w-full bg-white dark:bg-slate-800 border border-gray-200 text-gray-700 text-sm rounded-xl block pl-3 p-2.5 shadow-sm font-medium disabled:bg-gray-50" data-id="${product.id}" onchange="window.updateCardPrice(this, ${product.id})" ${(!isAvailable && !isAdminMode) ? 'disabled' : ''}>
                        ${optionsHTML}
                    </select>
                </div>
                
                ${actionButtonHTML}
                
                <p class="text-[10px] text-center text-gray-400 mt-2 italic">* Confirmar valor por WhatsApp</p>
            </div>
        </div>
    </div>
    `;
};