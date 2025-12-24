import { formatMoney } from '../utils/formatters';

export const ProductCard = (product) => {
    const precioInicial = product.variantes[0].precio;
    const isLowStock = product.id % 3 === 0; 
    const optionsHTML = product.variantes.map((v, index) => 
        `<option value="${index}">${v.nombre}</option>`
    ).join('');

    return `
    <div class="product-card group bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-2xl dark:shadow-black/60 dark:hover:shadow-green-900/20 border border-gray-100 dark:border-slate-700 overflow-hidden transition-all duration-500 flex flex-col h-full hover:-translate-y-2 relative isolate">
        
        <div class="h-64 overflow-hidden relative bg-gray-100 dark:bg-slate-700">
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition z-10"></div>
            
            <img src="${product.imagen}" alt="${product.nombre}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
            
            <span class="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-agro-dark dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 border border-white/50 dark:border-slate-600">
                ${product.categoria}
            </span>
            ${isLowStock ? `
            <span class="absolute bottom-3 right-3 bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse z-20">
                <i class="fa-solid fa-bolt"></i> ¡Se agota!
            </span>
            ` : ''}
        </div>

        <div class="p-6 flex flex-col flex-grow relative bg-white dark:bg-slate-800 transition-colors">
            
            <h4 class="font-bold text-xl text-gray-800 dark:text-gray-100 mb-2 group-hover:text-agro-primary dark:group-hover:text-green-400 transition-colors">${product.nombre}</h4>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2 h-10">${product.descripcion}</p>
            
            <div class="mt-auto bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
                
                <div class="text-center mb-3">
                    <span class="text-xs text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase">Precio</span>
                    <div class="text-2xl font-black text-agro-dark dark:text-white transition-all duration-300 price-display drop-shadow-sm" id="price-${product.id}">
                        ${formatMoney(precioInicial)}
                    </div>
                </div>

                <div class="relative mb-4">
                    <i class="fa-solid fa-scale-balanced absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm z-10"></i>
                    <select 
                        class="variant-selector w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 text-sm rounded-xl focus:ring-agro-primary focus:border-agro-primary block pl-9 p-2.5 shadow-sm cursor-pointer hover:border-agro-accent transition appearance-none font-medium"
                        data-id="${product.id}"
                        onchange="window.updateCardPrice(this, ${product.id})"
                    >
                        ${optionsHTML}
                    </select>
                    <i class="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                </div>

                <button 
                    class="add-to-cart-btn w-full bg-agro-primary hover:bg-agro-dark text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 dark:shadow-none hover:shadow-green-300 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
                    data-id="${product.id}"
                >
                    <i class="fa-solid fa-basket-shopping"></i>
                    <span>Agregar</span>
                </button>
            </div>
        </div>
    </div>
    `;
};