import { supabase } from './supabaseClient';
import { formatMoney } from './utils/formatters';

// --- VARIABLES GLOBALES ---
let pedidosData = [];
let basketIngredients = []; // Array temporal para armar la canasta

// --- ELEMENTOS DOM ---
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');

// --- 1. AUTENTICACIÓN ---
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        loginScreen.style.display = 'none';
        dashboard.classList.remove('hidden');
        dashboard.style.display = 'flex';
        initDashboard();
    } else {
        loginScreen.style.display = 'flex';
        dashboard.classList.add('hidden');
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        const errorMsg = document.getElementById('error-msg');
        if(errorMsg) {
            errorMsg.textContent = "Credenciales incorrectas";
            errorMsg.classList.remove('hidden');
        } else {
            alert("Credenciales incorrectas");
        }
    }
});

logoutBtn.addEventListener('click', () => supabase.auth.signOut());

async function initDashboard() {
    await loadPedidos();
    await loadCategories();
    await loadProductsForBuilder(); // Cargar lista para el constructor
    document.getElementById('tab-pedidos').click();
}

// --- 2. SISTEMA DE PESTAÑAS ---
const views = {
    pedidos: document.getElementById('view-pedidos'),
    crear: document.getElementById('view-crear'),
    inventario: document.getElementById('view-inventario')
};
const tabs = {
    pedidos: document.getElementById('tab-pedidos'),
    crear: document.getElementById('tab-crear'),
    inventario: document.getElementById('tab-inventario')
};

const switchTab = (activeTab) => {
    Object.values(views).forEach(el => el.classList.add('hidden'));
    Object.values(tabs).forEach(el => el.classList.replace('active-tab', 'inactive-tab'));

    views[activeTab].classList.remove('hidden');
    tabs[activeTab].classList.replace('inactive-tab', 'active-tab');

    if (activeTab === 'pedidos') loadPedidos();
    if (activeTab === 'inventario') loadInventario();
    if (activeTab === 'crear') loadProductsForBuilder(); // Refrescar lista de ingredientes
};

Object.keys(tabs).forEach(key => tabs[key].addEventListener('click', () => switchTab(key)));

// --- 3. GESTIÓN DE PEDIDOS ---
async function loadPedidos() {
    const tbody = document.getElementById('pedidos-body');
    tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-400">Cargando pedidos...</td></tr>';
    
    const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    
    if (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-red-500">Error cargando pedidos</td></tr>';
        return;
    }

    pedidosData = data; 

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500">No hay pedidos registrados.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(p => {
        const fecha = new Date(p.created_at).toLocaleString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
        let listaItems = Array.isArray(p.detalle_pedido) 
            ? p.detalle_pedido.map(i => `<div>• <b>${i.quantity}</b>x ${i.nombre}</div>`).join('') 
            : '<span class="italic text-gray-400">Sin detalles</span>';

        const statusColor = p.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
        const actionBtn = p.estado === 'pendiente' 
            ? `<button class="btn-despachar text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-200 px-3 py-1 rounded-md text-xs font-bold transition" data-id="${p.id}">DESPACHAR</button>`
            : `<i class="fa-solid fa-circle-check text-green-500 text-lg"></i>`;

        return `
            <tr class="hover:bg-gray-50 border-b last:border-0 bg-white">
                <td class="p-4 text-xs text-gray-500">${fecha}</td>
                <td class="p-4 font-bold text-gray-800">${p.cliente_nombre || 'Anónimo'}</td>
                <td class="p-4 text-xs max-w-[150px] truncate" title="${p.cliente_direccion}">${p.cliente_direccion || '-'}</td>
                <td class="p-4 text-xs">${listaItems}</td>
                <td class="p-4 text-right font-mono font-bold">${formatMoney(p.total)}</td>
                <td class="p-4 text-center"><span class="px-2 py-1 rounded-full text-[10px] font-bold ${statusColor} uppercase">${p.estado}</span></td>
                <td class="p-4 text-center">${actionBtn}</td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.btn-despachar').forEach(btn => {
        btn.addEventListener('click', () => marcarDespachado(btn.getAttribute('data-id')));
    });
}

window.marcarDespachado = async (id) => {
    if(!confirm('¿Confirmas que este pedido ya fue enviado?')) return;
    const { error } = await supabase.from('pedidos').update({ estado: 'despachado' }).eq('id', id);
    if (!error) loadPedidos();
};

const btnExcel = document.getElementById('btn-excel');
if(btnExcel) {
    btnExcel.addEventListener('click', () => {
        if (pedidosData.length === 0) return alert("No hay datos para exportar");
        let csv = "ID,Fecha,Cliente,Direccion,Total,Estado,Detalle\n";
        pedidosData.forEach(p => {
            let detalleTexto = Array.isArray(p.detalle_pedido) ? p.detalle_pedido.map(i => `${i.quantity}x ${i.nombre}`).join(" | ") : "";
            const nombre = (p.cliente_nombre || "").replace(/,/g, " ");
            const dir = (p.cliente_direccion || "").replace(/,/g, " ");
            const fecha = new Date(p.created_at).toLocaleDateString();
            csv += `${p.id},${fecha},${nombre},${dir},${p.total},${p.estado},"${detalleTexto}"\n`;
        });
        const link = document.createElement("a");
        link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
        link.download = `pedidos_lafloresta_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// --- 4. LÓGICA DE CANASTAS (NUEVO) ---

// A. Cargar productos activos para el select
async function loadProductsForBuilder() {
    const { data } = await supabase.from('productos').select('id, nombre').eq('activo', true).order('nombre');
    const select = document.getElementById('basket-product-select');
    if(data && select) {
        select.innerHTML = '<option value="">Selecciona un producto...</option>' + 
            data.map(p => `<option value="${p.nombre}">${p.nombre}</option>`).join('');
    }
}

// B. Toggle visual del Constructor
const isBasketCheck = document.getElementById('is-basket-check');
const basketBuilder = document.getElementById('basket-builder');
const simpleDesc = document.getElementById('simple-desc-container');

if(isBasketCheck) {
    isBasketCheck.addEventListener('change', (e) => {
        if(e.target.checked) {
            basketBuilder.classList.remove('hidden');
            simpleDesc.classList.add('hidden');
            // Limpiar variantes y poner una por defecto para Canasta
            document.getElementById('variantes-container').innerHTML = '';
            addVariantRow('Canasta', '');
        } else {
            basketBuilder.classList.add('hidden');
            simpleDesc.classList.remove('hidden');
            document.getElementById('variantes-container').innerHTML = '';
            addVariantRow('', '');
        }
    });
}

// C. Agregar ingrediente a la lista temporal
const addIngBtn = document.getElementById('add-ingredient-btn');
if(addIngBtn) {
    addIngBtn.addEventListener('click', () => {
        const select = document.getElementById('basket-product-select');
        const qtyInput = document.getElementById('basket-qty');
        const nombre = select.value;
        const qty = qtyInput.value;

        if(!nombre || qty < 1) return;

        basketIngredients.push({ nombre, qty });
        renderBasketList();
        select.value = "";
        qtyInput.value = 1;
        select.focus();
    });
}

function renderBasketList() {
    const ul = document.getElementById('basket-list');
    if(basketIngredients.length === 0) {
        ul.innerHTML = '<li class="text-gray-400 italic text-center text-xs py-2">Agrega productos aquí...</li>';
        return;
    }
    ul.innerHTML = basketIngredients.map((item, index) => `
        <li class="flex justify-between items-center bg-green-100 text-green-900 px-3 py-1 rounded text-xs">
            <span><b>${item.qty}x</b> ${item.nombre}</span>
            <button type="button" onclick="removeIngredient(${index})" class="text-red-500 hover:text-red-700 font-bold">×</button>
        </li>
    `).join('');
}

window.removeIngredient = (index) => {
    basketIngredients.splice(index, 1);
    renderBasketList();
};

// --- 5. CREAR PRODUCTO / CANASTA ---
async function loadCategories() {
    const { data } = await supabase.from('categorias').select('*');
    const select = document.getElementById('prod-cat');
    if (data && select) {
        select.innerHTML = data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    }
}

// Función auxiliar para agregar fila de variante
function addVariantRow(unidadVal = '', precioVal = '') {
    const varContainer = document.getElementById('variantes-container');
    const div = document.createElement('div');
    div.className = 'flex gap-2 mb-2 animate-fade-in items-center';
    div.innerHTML = `
        <input type="text" class="var-nombre flex-1 p-2 border rounded text-sm bg-gray-50 outline-none" placeholder="Unidad (ej: Libra)" value="${unidadVal}" required>
        <input type="number" class="var-precio w-1/3 p-2 border rounded text-sm bg-gray-50 outline-none" placeholder="Precio" value="${precioVal}" required>
        <button type="button" class="text-red-400 hover:text-red-600 p-2 remove-var transition"><i class="fa-solid fa-trash"></i></button>
    `;
    div.querySelector('.remove-var').addEventListener('click', () => div.remove());
    varContainer.appendChild(div);
}

const addVarBtn = document.getElementById('add-variant-btn');
if (addVarBtn) addVarBtn.addEventListener('click', () => addVariantRow());

// Agregar una fila inicial
if(document.getElementById('variantes-container').children.length === 0) addVariantRow();

const productForm = document.getElementById('product-form');
if (productForm) {
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById('prod-nombre').value;
        const isBasket = document.getElementById('is-basket-check').checked;
        
        // Generación de descripción inteligente
        let descripcionFinal = "";
        if (isBasket) {
            if (basketIngredients.length === 0) return alert("Una canasta debe tener al menos un producto.");
            descripcionFinal = "Contiene: " + basketIngredients.map(i => `${i.qty}x ${i.nombre}`).join(', ');
        } else {
            descripcionFinal = document.getElementById('prod-desc').value;
        }

        if(!confirm(`¿Crear ${isBasket ? 'Canasta' : 'Producto'} "${nombre}"?`)) return;

        const btn = productForm.querySelector('button[type="submit"]');
        const btnText = btn.innerText;
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

        try {
            // 1. Imagen
            const fileInput = document.getElementById('prod-img');
            let imageUrl = null;
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('productos').upload(fileName, file);
                if (uploadError) throw uploadError;
                const { data } = supabase.storage.from('productos').getPublicUrl(fileName);
                imageUrl = data.publicUrl;
            }

            // 2. Insertar
            const { data: prodData, error: prodError } = await supabase.from('productos').insert([{
                nombre: nombre,
                descripcion: descripcionFinal,
                categoria_id: document.getElementById('prod-cat').value,
                imagen_url: imageUrl,
                activo: true,
                es_canasta: isBasket // Guardamos el flag
            }]).select().single();

            if (prodError) throw prodError;

            // 3. Insertar Variantes
            const variantes = [];
            document.querySelectorAll('#variantes-container > div').forEach(div => {
                variantes.push({
                    producto_id: prodData.id,
                    unidad: div.querySelector('.var-nombre').value,
                    precio: parseFloat(div.querySelector('.var-precio').value),
                    stock_disponible: true
                });
            });

            const { error: varError } = await supabase.from('variantes').insert(variantes);
            if (varError) throw varError;

            alert("✅ Guardado exitosamente");
            productForm.reset();
            document.getElementById('variantes-container').innerHTML = '';
            addVariantRow(); // Reset variantes
            
            // Reset Basket Builder
            basketIngredients = [];
            renderBasketList();
            if(isBasket) document.getElementById('is-basket-check').click();

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        } finally {
            btn.disabled = false;
            btn.innerText = btnText;
        }
    });
}

// --- 6. INVENTARIO ---
async function loadInventario() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '<div class="col-span-full text-center py-10 text-green-600"><i class="fa-solid fa-spinner fa-spin text-3xl"></i></div>';
    
    const { data, error } = await supabase.from('productos').select('*, variantes(*)').order('created_at', { ascending: false });
    
    if (error || !data) {
        grid.innerHTML = '<p class="col-span-full text-gray-400 text-center py-10">Inventario vacío.</p>';
        return;
    }

    grid.innerHTML = data.map(p => `
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full relative group">
            <div class="flex items-start gap-3 mb-3">
                <img src="${p.imagen_url || 'https://via.placeholder.com/100?text=Sin+Foto'}" class="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-200">
                <div>
                    <h4 class="font-bold text-gray-800 text-sm leading-tight mb-1">
                        ${p.es_canasta ? '<span class="text-orange-500 mr-1"><i class="fa-solid fa-basket-shopping"></i></span>' : ''}
                        ${p.nombre}
                    </h4>
                    <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        ${p.activo ? 'Visible' : 'Oculto'}
                    </span>
                </div>
            </div>
            <div class="flex-1 bg-gray-50 rounded-lg p-2 mb-3 text-xs space-y-1 overflow-hidden">
                ${p.descripcion ? `<p class="italic text-gray-500 mb-2 border-b pb-1 truncate" title="${p.descripcion}">${p.descripcion}</p>` : ''}
                ${p.variantes.map(v => `
                    <div class="flex justify-between text-gray-600"><span>${v.unidad}</span><span class="font-mono font-bold">${formatMoney(v.precio)}</span></div>
                `).join('')}
            </div>
            <div class="grid grid-cols-2 gap-2 mt-auto">
                <button onclick="toggleProduct(${p.id}, ${!p.activo})" class="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition ${p.activo ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}">
                    <i class="fa-solid ${p.activo ? 'fa-eye-slash' : 'fa-eye'}"></i> ${p.activo ? 'Ocultar' : 'Mostrar'}
                </button>
                <button onclick="deleteProduct(${p.id})" class="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

window.toggleProduct = async (id, nuevoEstado) => {
    const { error } = await supabase.from('productos').update({ activo: nuevoEstado }).eq('id', id);
    if (!error) loadInventario();
};

window.deleteProduct = async (id) => {
    if (!confirm("⚠️ ¿Eliminar este producto/canasta?\nEsta acción no se puede deshacer.")) return;
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (!error) loadInventario();
    else alert("Error: " + error.message);
};