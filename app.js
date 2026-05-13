// =====================================================
// SPORTSTOCK - SISTEMA DE INVENTARIO Y TICKETS
// =====================================================
// Archivo principal de JavaScript que maneja toda la
// lógica del frontend, incluyendo autenticación,
// gestión de inventario, tickets, navegación y UI.
// =====================================================

// ============ CONFIGURACIÓN API ============
const API_URL = 'http://localhost:8080/api';

// ============ MAPA DE IMAGENES ============
const ITEM_IMAGE_MAP = {
    'balon de voleibol': 'img/OIP.webp',
    'balon de basketball': 'img/OIP (1).webp',
    'pelota de tenis': 'img/OIP (2).webp',
    'raqueta de tenis': 'img/OIP (3).webp',
    'guantes de boxeo': 'img/R.jfif',
    'balon de futbol': 'img/8f64f6935082bcd022c1f7f36570e6a1.jpg'
};

function eliminarTildes(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeKey(value) {
    return eliminarTildes(String(value || '').trim().toLowerCase());
}

function getItemImage(name, imageUrl) {
    if (imageUrl) {
        return imageUrl;
    }
    const normalizedName = normalizeKey(name);
    const inventoryMatch = inventory.find(item => normalizeKey(item.name) === normalizedName && item.imageUrl);
    if (inventoryMatch && inventoryMatch.imageUrl) {
        return inventoryMatch.imageUrl;
    }
    return ITEM_IMAGE_MAP[normalizedName] || 'img/Logo deportivo.png';
}

function getItemNamesFromTicket(description) {
    if (!description) return [];
    return description
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => {
            const match = line.match(/x\s(.+?)\s=/i);
            return match ? match[1].trim() : null;
        })
        .filter(Boolean);
}

function parseTicketDate(ticket) {
    if (!ticket) return null;
    const raw = ticket.date || ticket.createdAt || ticket.updatedAt;
    if (!raw) return null;
    const rawText = String(raw);
    const isoText = rawText.includes('T') ? rawText : `${rawText}T00:00:00`;
    const parsed = new Date(isoText);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
}

function isLoanTicket(ticket) {
    const title = normalizeKey(ticket && ticket.title ? ticket.title : '');
    const description = normalizeKey(ticket && ticket.description ? ticket.description : '');
    return title.includes('prestamo') || description.startsWith('prestamo de implementos');
}

function getTopRequestedItems(loanTickets, limit = 3) {
    const totals = new Map();
    const names = new Map();

    loanTickets.forEach(ticket => {
        if (!ticket || !ticket.description) return;
        ticket.description.split('\n').forEach(line => {
            const match = line.match(/-\s*(\d+)\s*x\s*(.+?)\s*=/i);
            if (!match) return;
            const qty = Number(match[1]) || 0;
            const name = match[2].trim();
            if (!name || qty <= 0) return;
            const key = normalizeKey(name);
            totals.set(key, (totals.get(key) || 0) + qty);
            if (!names.has(key)) {
                names.set(key, name);
            }
        });
    });

    const sorted = Array.from(totals.entries())
        .map(([key, qty]) => ({
            key,
            qty,
            name: names.get(key) || key
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, limit);

    return sorted;
}

function formatShortMonth(date) {
    const raw = date.toLocaleString('es-CO', { month: 'short' });
    return raw.replace('.', '').toUpperCase();
}

let selectedImageData = '';

function setImageInputs(imageUrl) {
    const fileInput = document.getElementById('item-image-file');
    const urlInput = document.getElementById('item-image-url');
    selectedImageData = '';
    if (fileInput) {
        fileInput.value = '';
    }
    if (!urlInput) return;
    if (imageUrl && imageUrl.startsWith('data:')) {
        selectedImageData = imageUrl;
        urlInput.value = '';
        return;
    }
    urlInput.value = imageUrl || '';
}

const imageFileInput = document.getElementById('item-image-file');
const imageUrlInput = document.getElementById('item-image-url');

if (imageFileInput) {
    imageFileInput.addEventListener('change', () => {
        const file = imageFileInput.files && imageFileInput.files[0];
        if (!file) {
            selectedImageData = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            selectedImageData = String(reader.result || '');
            if (imageUrlInput) {
                imageUrlInput.value = '';
            }
        };
        reader.readAsDataURL(file);
    });
}

if (imageUrlInput) {
    imageUrlInput.addEventListener('input', () => {
        if (imageUrlInput.value.trim()) {
            selectedImageData = '';
            if (imageFileInput) {
                imageFileInput.value = '';
            }
        }
    });
}

async function fetchJson(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        let message = 'Error de servidor';
        try {
            const data = await response.json();
            message = data.message || JSON.stringify(data);
        } catch (err) {
            message = await response.text();
        }
        throw new Error(message || response.statusText);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// ============ VERIFICAR SESIÓN ============
// Función que verifica si hay un usuario logueado
function checkSession() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html'; // Redirigir si no hay sesión
        return null;
    }
    return JSON.parse(user); // Retornar usuario parseado
}

// ============ CARGAR USUARIO ============
// Determinar si estamos en el dashboard
const isDashboard = window.location.pathname.endsWith('dashboard.html');

let currentUser = null; // Usuario actual (global)
if (isDashboard) {
    currentUser = checkSession(); // Verificar sesión
    if (currentUser) {
        // Mostrar nombre del usuario si existe el elemento
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
        // Mostrar badge de rol si el usuario tiene rol definido
        if (currentUser.role) {
            const roleDisplay = document.getElementById('user-role');
            if (roleDisplay) {
                const isAdminRole = currentUser.role === 'admin';
                roleDisplay.textContent = '👤'; // Icono base
                roleDisplay.title = isAdminRole ? 'Administrador' : 'Usuario'; // Tooltip
                roleDisplay.setAttribute('aria-label', isAdminRole ? 'Administrador' : 'Usuario');
                roleDisplay.style.display = 'inline-flex'; // Mostrar el badge
                roleDisplay.classList.toggle('role-admin', isAdminRole); // Clase especial para admin
            }
        }
    }
}

// ============ FUNCIONES DE NAVEGACIÓN EN INDEX ============
// Mostrar formulario de login
function showLogin() {
    // Ocultar secciones principales
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    // Mostrar login
    document.getElementById('login').style.display = 'flex';
    // Ocultar otros formularios
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'none';
}

// Mostrar formulario de registro
function showRegister() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'flex';
    document.getElementById('recovery').style.display = 'none';
}

// Mostrar formulario de recuperación de contraseña
function showRecovery() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'flex';
}

// Ocultar todos los formularios de autenticación
function hideLogin() {
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.features').style.display = 'grid';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'none';
}

// Mostrar sección de características y hacer scroll
function showFeatures(event) {
    if (event) event.preventDefault();
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.features').style.display = 'grid';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'none';
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// ============ MANEJO DE FORMULARIOS DE AUTENTICACIÓN ============
// Event listener para el formulario de login
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevenir envío por defecto
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('password-error');
        errorDiv.classList.remove('show');

        try {
            const user = await fetchJson(`${API_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error("Error en login:", error);
            const rawMessage = String(error.message || '');
            const isForbidden = rawMessage.includes('403') || rawMessage.includes('Forbidden');
            errorDiv.textContent = isForbidden
                ? 'Usuario o contrasena incorrectos.'
                : 'Error: ' + error.message;
            errorDiv.classList.add('show');
        }
    });
}

// Event listener para el formulario de registro
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;

        // Limpiar errores previos
        document.getElementById('reg-username-error').classList.remove('show');
        document.getElementById('reg-password-error').classList.remove('show');
        document.getElementById('reg-confirm-error').classList.remove('show');

        // Validaciones
        if (username.length < 4) {
            document.getElementById('reg-username-error').textContent = 'El usuario debe tener al menos 4 caracteres';
            document.getElementById('reg-username-error').classList.add('show');
            return;
        }
        if (password.length < 6) {
            document.getElementById('reg-password-error').textContent = 'La contraseña debe tener al menos 6 caracteres';
            document.getElementById('reg-password-error').classList.add('show');
            return;
        }
        if (password !== confirmPassword) {
            document.getElementById('reg-confirm-error').textContent = 'Las contraseñas no coinciden';
            document.getElementById('reg-confirm-error').classList.add('show');
            return;
        }
        try {
            await fetchJson(`${API_URL}/auth/register`, {
                method: 'POST',
                body: JSON.stringify({ username, password, name, email })
            });
            const user = await fetchJson(`${API_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
            localStorage.setItem('currentUser', JSON.stringify(user));
            const displayName = user.name || user.username || username;
            alert(`¡Bienvenido, ${displayName}!\n\nTu cuenta fue creada correctamente.`);
            window.location.href = 'dashboard.html';
        } catch (error) {
            document.getElementById('reg-username-error').textContent = 'No se pudo registrar el usuario';
            document.getElementById('reg-username-error').classList.add('show');
        }
    });
}

// Event listener para el formulario de recuperación
if (document.getElementById('recovery-form')) {
    document.getElementById('recovery-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('recovery-email').value;
        alert('Se ha enviado un enlace de recuperación a:\n' + email + '\n\n(Funcionalidad de demostración)');
        showLogin();
        this.reset();
    });
}

// ============ CERRAR SESIÓN ============
// Función para cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('currentUser'); // Eliminar del localStorage
        window.location.href = 'index.html'; // Redirigir a index
    }
}

// ============ VERIFICAR PERMISOS ============
// Función para verificar si el usuario es administrador
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

// Función para verificar si el usuario es regular
function isUsuario() {
    return currentUser && currentUser.role === 'usuario';
}

// ============ APLICAR RESTRICCIONES POR ROL ============
// Función que aplica restricciones según el rol del usuario
function applyRoleRestrictions() {
    if (!currentUser) return;

    // Si es usuario (no admin), ocultar botones de editar/eliminar
    if (isUsuario()) {
        // Ocultar botones de nuevo artículo en tabla
        const addItemsBtn = document.querySelectorAll('button[onclick="openInventoryModal()"]');
        addItemsBtn.forEach(btn => btn.style.display = 'none');

        // Los botones de editar/eliminar se ocultarán en renderInventory()
    }
}

// ============ DATOS DESDE BACKEND ============
let inventory = [];
let tickets = [];

async function loadInventory() {
    inventory = await fetchJson(`${API_URL}/inventory`);
    inventory = inventory.map(item => ({
        ...item,
        price: Number(item.price) || 0
    }));
    syncCartImages();
    renderInventory();
}

async function loadTickets() {
    tickets = await fetchJson(`${API_URL}/tickets`);
    renderTickets();
}

function syncCartImages() {
    if (!cart || cart.length === 0) return;
    cart = cart.map(item => {
        const invItem = inventory.find(i => i.id === item.id);
        const imageUrl = invItem ? invItem.imageUrl : item.image;
        return {
            ...item,
            image: getItemImage(item.name, imageUrl)
        };
    });
    saveCart();
}

async function refreshAllData() {
    try {
        await Promise.all([loadInventory(), loadTickets()]);
        updateStats();
    } catch (error) {
        alert('No se pudo conectar con el servidor.');
    }
}

// Formatear valores monetarios (COP)
function formatPrice(value) {
    const numericValue = Number(value) || 0;
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numericValue);
}

// ============ NAVEGACIÓN ============
// Función para cambiar entre vistas del dashboard
function showView(viewName, event) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });

    // Mostrar vista seleccionada
    document.getElementById(viewName + '-view').classList.add('active');

    // Manejos específicos por vista
    if(viewName === 'cart') {
        renderCart();
    }
    if (viewName === 'reports') {
        updateReportStats();
    }

    // Actualizar pestañas activas (si existieran)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// ============ ACTUALIZAR ESTADÍSTICAS ============
// Función que calcula y actualiza las estadísticas mostradas
function updateStats() {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0); // Suma total de artículos
    const availableItems = inventory.filter(item => item.quantity > 0).length; // Artículos disponibles
    const openTickets = tickets.filter(t => t.status === 'Abierto').length; // Tickets abiertos
    const totalTickets = tickets.length; // Total de tickets

    // Actualizar elementos en el DOM
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('available-items').textContent = availableItems;
    document.getElementById('open-tickets').textContent = openTickets;
    document.getElementById('total-tickets').textContent = totalTickets;

    updateReportStats();
}

function updateReportStats() {
    const reportView = document.getElementById('reports-view');
    if (!reportView) return;

    const loanTickets = tickets.filter(isLoanTicket);
    const now = new Date();
    const loansThisMonth = loanTickets.filter(ticket => {
        const date = parseTicketDate(ticket);
        if (!date) return false;
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    let openCount = 0;
    let inProgressCount = 0;
    let closedCount = 0;
    tickets.forEach(ticket => {
        const status = normalizeKey(ticket.status);
        if (status === 'abierto') openCount += 1;
        else if (status === 'en proceso' || status === 'enproceso') inProgressCount += 1;
        else if (status === 'cerrado') closedCount += 1;
    });

    const totalTickets = tickets.length;
    const resolutionRate = totalTickets > 0
        ? Math.round((closedCount / totalTickets) * 100)
        : 0;

    const topItems = getTopRequestedItems(loanTickets, 3);
    const topItemName = topItems.length > 0 ? topItems[0].name : 'Sin datos';

    const loansEl = document.getElementById('reports-loans-month');
    const resolvedEl = document.getElementById('reports-tickets-resolved');
    const topItemEl = document.getElementById('reports-top-item');
    const resolutionEl = document.getElementById('reports-resolution-rate');
    const resolutionDetailEl = document.getElementById('reports-resolution-rate-detail');

    if (loansEl) loansEl.textContent = loansThisMonth;
    if (resolvedEl) resolvedEl.textContent = closedCount;
    if (topItemEl) topItemEl.textContent = topItemName;
    if (resolutionEl) resolutionEl.textContent = `${resolutionRate}%`;
    if (resolutionDetailEl) resolutionDetailEl.textContent = `${resolutionRate}%`;

    const loanMonthChart = document.getElementById('loan-month-chart');
    if (loanMonthChart) {
        const monthsToShow = 6;
        const monthMap = new Map();
        for (let i = 0; i < monthsToShow; i += 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            monthMap.set(key, { date, count: 0 });
        }

        loanTickets.forEach(ticket => {
            const date = parseTicketDate(ticket);
            if (!date) return;
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const entry = monthMap.get(key);
            if (entry) {
                entry.count += 1;
            }
        });

        const monthData = Array.from(monthMap.values()).sort((a, b) => a.date - b.date);
        const maxCount = monthData.reduce((max, entry) => Math.max(max, entry.count), 0);
        if (monthData.length === 0) {
            loanMonthChart.innerHTML = '<p class="report-empty">Sin datos disponibles.</p>';
        } else {
            loanMonthChart.innerHTML = monthData.map(entry => {
                const width = maxCount > 0
                    ? Math.max(6, Math.round((entry.count / maxCount) * 100))
                    : 0;
                const label = formatShortMonth(entry.date);
                return `
                    <div class="bar-row">
                        <span class="bar-label">${label}</span>
                        <div class="bar-track">
                            <span class="bar-fill" style="width: ${width}%;"></span>
                        </div>
                        <span class="bar-value">${entry.count}</span>
                    </div>
                `;
            }).join('');
        }
    }

    const ticketStatusChart = document.getElementById('ticket-status-chart');
    if (ticketStatusChart) {
        const statusTotal = openCount + inProgressCount + closedCount;
        const statusRows = [
            { label: 'Abiertos', count: openCount, variant: 'bar-fill-info' },
            { label: 'En Proceso', count: inProgressCount, variant: 'bar-fill-warning' },
            { label: 'Cerrados', count: closedCount, variant: 'bar-fill-success' }
        ];
        ticketStatusChart.innerHTML = statusRows.map(row => {
            const width = statusTotal > 0
                ? Math.max(6, Math.round((row.count / statusTotal) * 100))
                : 0;
            return `
                <div class="bar-row">
                    <span class="bar-label">${row.label}</span>
                    <div class="bar-track">
                        <span class="bar-fill ${row.variant}" style="width: ${width}%;"></span>
                    </div>
                    <span class="bar-value">${row.count}</span>
                </div>
            `;
        }).join('');
    }

    const topItemsChart = document.getElementById('top-items-chart');
    if (topItemsChart) {
        if (topItems.length === 0) {
            topItemsChart.innerHTML = '<p class="report-empty">Sin datos disponibles.</p>';
        } else {
            const maxQty = topItems.reduce((max, item) => Math.max(max, item.qty), 0);
            topItemsChart.innerHTML = topItems.map(item => {
                const width = maxQty > 0
                    ? Math.max(6, Math.round((item.qty / maxQty) * 100))
                    : 0;
                return `
                    <div class="bar-row">
                        <span class="bar-label">${item.name}</span>
                        <div class="bar-track">
                            <span class="bar-fill" style="width: ${width}%;"></span>
                        </div>
                        <span class="bar-value">${item.qty} uds</span>
                    </div>
                `;
            }).join('');
        }
    }
}


// =====================================================
// GESTIÓN DE INVENTARIO - CRUD
// =====================================================

// ============ RENDERIZAR INVENTARIO ============
// Función que genera dinámicamente la tabla de inventario
function renderInventory() {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = ''; // Limpiar contenido anterior

    inventory.forEach(item => {
        // Determinar clase CSS según disponibilidad
        const statusClass = item.quantity > 0 ? 'status-disponible' : 'status-prestado';
        const statusText = item.quantity > 0 ? 'Disponible' : 'Agotado';

        // Construir botones según permisos del usuario
        let actionsHTML = '';
        let cartBtnHTML = ``;
        if(item.quantity > 0) {
            cartBtnHTML = `<button class="btn btn-cart" onclick="addToCart(${item.id})" title="Añadir al carrito"><i class='bx bx-cart-add'></i> Agregar</button>`;
        }

        if (isAdmin()) {
            // Admin ve todos los botones de acción
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="editItem(${item.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteItem(${item.id})">Eliminar</button>
                ${cartBtnHTML}
            `;
        } else {
            // Usuario solo ve botón de ver detalles y agregar a carrito
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="viewItem(${item.id})">Ver Detalles</button>
                ${cartBtnHTML}
            `;
        }

        // Crear fila de la tabla
        const row = `
            <tr>
                <td class="item-image-cell"><img class="item-image" src="${getItemImage(item.name, item.imageUrl)}" alt="${item.name}"></td>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${item.quantity}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="actions">
                        ${actionsHTML}
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row; // Agregar fila al tbody
    });
}

// ============ ABRIR MODAL INVENTARIO ============
// Función para abrir el modal de crear/editar artículo
function openInventoryModal(itemId = null) {
    // Solo admin puede abrir modal de crear/editar
    if (!isAdmin()) {
        alert('Solo los administradores pueden agregar o modificar artículos.');
        return;
    }

    const modal = document.getElementById('inventory-modal');
    const form = document.getElementById('inventory-form');
    const title = document.getElementById('inventory-modal-title');

    form.reset(); // Limpiar formulario
    setImageInputs('');

    if (itemId) {
        // MODO EDICIÓN: cargar datos del artículo
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            title.textContent = 'Editar Artículo';
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-code').value = item.code;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-price').value = item.price ?? 0;
            document.getElementById('item-quantity').value = item.quantity;
            document.getElementById('item-description').value = item.description || '';
            setImageInputs(item.imageUrl || '');
        }
    } else {
        // MODO CREACIÓN
        title.textContent = 'Nuevo Artículo';
        document.getElementById('item-id').value = '';
        setImageInputs('');
    }

    modal.classList.add('show'); // Mostrar modal
}

// ============ CERRAR MODAL INVENTARIO ============
function closeInventoryModal() {
    document.getElementById('inventory-modal').classList.remove('show');
}

// ============ GUARDAR ARTÍCULO ============
// Event listener para el formulario de inventario
document.getElementById('inventory-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir envío por defecto

    // Obtener valores del formulario
    const id = document.getElementById('item-id').value;
    const imageUrlValue = selectedImageData || (imageUrlInput ? imageUrlInput.value.trim() : '');
    const itemData = {
        code: document.getElementById('item-code').value,
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        price: parseFloat(document.getElementById('item-price').value),
        quantity: parseInt(document.getElementById('item-quantity').value),
        description: document.getElementById('item-description').value,
        imageUrl: imageUrlValue || null
    };

    try {
        if (id) {
            await fetchJson(`${API_URL}/inventory/${id}`, {
                method: 'PUT',
                body: JSON.stringify(itemData)
            });
        } else {
            await fetchJson(`${API_URL}/inventory`, {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
        }
        await loadInventory();
        updateStats();
        closeInventoryModal();
    } catch (error) {
        alert('No se pudo guardar el artículo.');
    }
});

// ============ EDITAR ARTÍCULO ============
function editItem(id) {
    openInventoryModal(id); // Abrir modal en modo edición
}

// ============ ELIMINAR ARTÍCULO ============
async function deleteItem(id) {
    // Solo admin puede eliminar
    if (!isAdmin()) {
        alert('Solo los administradores pueden eliminar artículos.');
        return;
    }

    if (confirm('¿Estás seguro de eliminar este artículo?')) {
        try {
            await fetchJson(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
            await loadInventory();
            updateStats();
        } catch (error) {
            alert('No se pudo eliminar el artículo.');
        }
    }
}

// =====================================================
// GESTIÓN DE TICKETS - CRUD
// =====================================================

// ============ RENDERIZAR TICKETS ============
// Función que genera dinámicamente la tabla de tickets
function renderTickets() {
    const tbody = document.getElementById('tickets-tbody');
    tbody.innerHTML = ''; // Limpiar contenido

    tickets.forEach(ticket => {
        // Determinar clase CSS según estado del ticket
        let statusClass = 'status-abierto';
        if (ticket.status === 'Cerrado') statusClass = 'status-cerrado';
        if (ticket.status === 'En Proceso') statusClass = 'status-en-proceso';

        // Construir botones según permisos
        let actionsHTML = '';
        if (isAdmin()) {
            // Admin puede editar y eliminar
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="editTicket(${ticket.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteTicket(${ticket.id})">Eliminar</button>
            `;
        } else {
            // Usuario solo puede ver detalles
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="viewTicket(${ticket.id})">Ver Detalles</button>
            `;
        }

        const itemNames = getItemNamesFromTicket(ticket.description);
        const imageHtml = itemNames.length
            ? itemNames
                .map(name => `<img class="ticket-item-image" src="${getItemImage(name)}" alt="${name}">`)
                .join('')
            : '<span class="text-muted">Sin items</span>';

        // Crear fila de la tabla
        const row = `
            <tr>
                <td>#${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${ticket.requester}</td>
                <td><div class="ticket-images">${imageHtml}</div></td>
                <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
                <td>${ticket.date}</td>
                <td>
                    <div class="actions">
                        ${actionsHTML}
                    </div>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ============ ABRIR MODAL TICKET ============
// Función para abrir el modal de crear/editar ticket
function openTicketModal(ticketId = null) {
    // Solo admin puede gestionar tickets
    if (!isAdmin()) {
        alert('Solo los administradores pueden gestionar tickets. Los usuarios pueden crear nuevas solicitudes en la sección de Tickets.');
        return;
    }

    const modal = document.getElementById('ticket-modal');
    const form = document.getElementById('ticket-form');
    const title = document.getElementById('ticket-modal-title');

    form.reset(); // Limpiar formulario

    if (ticketId) {
        // MODO EDICIÓN: cargar datos del ticket
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
            title.textContent = 'Editar Ticket';
            document.getElementById('ticket-id').value = ticket.id;
            document.getElementById('ticket-title').value = ticket.title;
            document.getElementById('ticket-requester').value = ticket.requester;
            document.getElementById('ticket-status').value = ticket.status;
            document.getElementById('ticket-description').value = ticket.description;
        }
    } else {
        // MODO CREACIÓN
        title.textContent = 'Nuevo Ticket';
        document.getElementById('ticket-id').value = '';
    }

    modal.classList.add('show'); // Mostrar modal
}

// ============ CERRAR MODAL TICKET ============
function closeTicketModal() {
    document.getElementById('ticket-modal').classList.remove('show');
}

// ============ GUARDAR TICKET ============
// Event listener para el formulario de tickets
document.getElementById('ticket-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevenir envío

    // Obtener valores del formulario
    const id = document.getElementById('ticket-id').value;
    const ticketData = {
        title: document.getElementById('ticket-title').value,
        requester: document.getElementById('ticket-requester').value,
        status: document.getElementById('ticket-status').value,
        description: document.getElementById('ticket-description').value,
        date: new Date().toISOString().split('T')[0] // Fecha actual
    };

    try {
        if (id) {
            await fetchJson(`${API_URL}/tickets/${id}`, {
                method: 'PUT',
                body: JSON.stringify(ticketData)
            });
        } else {
            await fetchJson(`${API_URL}/tickets`, {
                method: 'POST',
                body: JSON.stringify(ticketData)
            });
        }
        await loadTickets();
        updateStats();
        closeTicketModal();
    } catch (error) {
        alert('No se pudo guardar el ticket.');
    }
});

// ============ EDITAR TICKET ============
function editTicket(id) {
    openTicketModal(id); // Abrir modal en modo edición
}

// ============ ELIMINAR TICKET ============
async function deleteTicket(id) {
    // Solo admin puede eliminar
    if (!isAdmin()) {
        alert('Solo los administradores pueden eliminar tickets.');
        return;
    }

    if (confirm('¿Estás seguro de eliminar este ticket?')) {
        try {
            await fetchJson(`${API_URL}/tickets/${id}`, { method: 'DELETE' });
            await loadTickets();
            updateStats();
        } catch (error) {
            alert('No se pudo eliminar el ticket.');
        }
    }
}

// ============ INICIALIZACIÓN ============
// Código que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', async function() {
    if (isDashboard) {
        applyRoleRestrictions(); // Aplicar restricciones por rol
        await refreshAllData();
        updateCartCount(); // Actualizar mini badge del carrito
    }
});

// ============ VER DETALLES ARTÍCULO (para usuarios) ============
// Función para mostrar detalles de un artículo (solo lectura)
function viewItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        alert(`📦 ARTÍCULO: ${item.name}\n\nCódigo: ${item.code}\nCategoría: ${item.category}\nPrecio: ${formatPrice(item.price)}\nCantidad disponible: ${item.quantity}\nDescripción: ${item.description || 'Sin descripción'}`);
    }
}

// ============ VER DETALLES TICKET (para usuarios) ============
// Función para mostrar detalles de un ticket (solo lectura)
function viewTicket(id) {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
        alert(`🎫 TICKET #${ticket.id}\n\nTítulo: ${ticket.title}\nSolicitante: ${ticket.requester}\nEstado: ${ticket.status}\nDescripción: ${ticket.description}\nFecha: ${ticket.date}`);
    }
}

// ============ LÓGICA DE CARRITO ============
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Normalizar precios del carrito en caso de datos antiguos
cart = cart.map(item => {
    const invItem = inventory.find(i => i.id === item.id);
    return {
        ...item,
        price: Number(item.price) || (invItem ? invItem.price : 0),
        image: getItemImage(item.name, item.image)
    };
});

// Guardar carrito y actualizar contador
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Actualizar indicador visual del carrito
function updateCartCount() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        const total = cart.reduce((acc, item) => acc + item.qty, 0);
        countSpan.textContent = total;
    }
}

// Agregar un artículo al carrito
function addToCart(itemId) {
    const invItem = inventory.find(i => i.id === itemId);
    if(!invItem || invItem.quantity <= 0) return;
    
    const cartItem = cart.find(c => c.id === itemId);
    if(cartItem) {
        if(cartItem.qty < invItem.quantity) {
            cartItem.qty++;
            alert(invItem.name + ' sumado al carrito.');
        } else {
            alert('No hay más unidades disponibles de ' + invItem.name);
        }
    } else {
        cart.push({
            id: invItem.id,
            code: invItem.code,
            name: invItem.name,
            image: getItemImage(invItem.name, invItem.imageUrl),
            price: invItem.price,
            qty: 1,
            maxQty: invItem.quantity
        });
        alert(invItem.name + ' agregado al carrito.');
    }
    saveCart();
    // Re renderizar si está activa la vista
    if(document.getElementById('cart-view').classList.contains('active')){
        renderCart();
    }
}

// Modificar cantidad en carrito
function updateCartQty(itemId, change) {
    const cartItem = cart.find(c => c.id === itemId);
    if(!cartItem) return;
    const newQty = cartItem.qty + change;
    if(newQty > 0 && newQty <= cartItem.maxQty) {
        cartItem.qty = newQty;
    } else if (newQty > cartItem.maxQty) {
        alert('Stock máximo alcanzado.');
    } else if (newQty === 0) {
        removeCartItem(itemId);
        return;
    }
    saveCart();
    renderCart();
}

// Remover artículo del carrito
function removeCartItem(itemId) {
    cart = cart.filter(c => c.id !== itemId);
    saveCart();
    renderCart();
}

// Renderizar tabla del carrito
function renderCart() {
    const tbody = document.getElementById('cart-tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const emptyMsg = document.getElementById('empty-cart-msg');
    const checkoutBtn = document.getElementById('checkout-btn');
    const cartTotalEl = document.getElementById('cart-total');
    
    if(cart.length === 0) {
        emptyMsg.style.display = 'block';
        checkoutBtn.style.display = 'none';
        if (cartTotalEl) {
            cartTotalEl.textContent = formatPrice(0);
        }
        return;
    }
    emptyMsg.style.display = 'none';
    checkoutBtn.style.display = 'inline-block';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = (Number(item.price) || 0) * item.qty;
        total += subtotal;
        const row = `<tr>
            <td class="item-image-cell"><img class="cart-item-image" src="${getItemImage(item.name, item.image)}" alt="${item.name}"></td>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>
                <div class="cart-controls">
                    <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, -1)"><i class='bx bx-minus'></i></button>
                    <span style="font-weight: bold; width: 15px; display: inline-block; text-align: center;">${item.qty}</span>
                    <button class="cart-qty-btn" onclick="updateCartQty(${item.id}, 1)"><i class='bx bx-plus'></i></button>
                </div>
            </td>
            <td>${formatPrice(item.price)}</td>
            <td>${formatPrice(subtotal)}</td>
            <td>
                <button class="remove-cart-btn" title="Eliminar del carrito" onclick="removeCartItem(${item.id})"><i class='bx bx-trash'></i></button>
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });

    if (cartTotalEl) {
        cartTotalEl.textContent = formatPrice(total);
    }
}

// Confirmar carrito y generar ticket
async function checkoutCart() {
    if(cart.length === 0) { alert('El carrito está vacío'); return; }
    if(!confirm('¿Deseas confirmar el préstamo y generar un ticket para estos implementos?')) return;

    const requester = currentUser?.name || currentUser?.username || 'usuario';
    const payload = {
        requester,
        items: cart.map(item => ({ itemId: item.id, qty: item.qty }))
    };

    try {
        await fetchJson(`${API_URL}/cart/checkout`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        cart = [];
        saveCart();
        renderCart();
        await refreshAllData();
        alert('¡Préstamo confirmado! Se ha generado un ticket.');
        showView('tickets');
    } catch (error) {
        alert('No se pudo confirmar el préstamo.');
    }
}


