// =====================================================
// SPORTSTOCK - SISTEMA DE INVENTARIO Y TICKETS
// =====================================================

// ============ VERIFICAR SESIÓN ============
function checkSession() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return JSON.parse(user);
}

// ============ CARGAR USUARIO ============
const isDashboard = window.location.pathname.endsWith('dashboard.html');

let currentUser = null;
if (isDashboard) {
    currentUser = checkSession();
    if (currentUser) {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
        if (currentUser.role) {
            const roleDisplay = document.getElementById('user-role');
            if (roleDisplay) {
                const isAdminRole = currentUser.role === 'admin';
                roleDisplay.textContent = '👤';
                roleDisplay.title = isAdminRole ? 'Administrador' : 'Usuario';
                roleDisplay.setAttribute('aria-label', isAdminRole ? 'Administrador' : 'Usuario');
                roleDisplay.style.display = 'inline-flex';
                roleDisplay.classList.toggle('role-admin', isAdminRole);
            }
        }
    }
}

// ============ USUARIOS Y AUTENTICACIÓN EN INDEX ============
const USERS = [
    { username: 'admin', password: 'admin123', name: 'Administrador', role: 'admin' },
    { username: 'usuario', password: '123456', name: 'Usuario', role: 'usuario' }
];

function showLogin() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.getElementById('login').style.display = 'flex';
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'none';
}

function showRegister() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'flex';
    document.getElementById('recovery').style.display = 'none';
}

function showRecovery() {
    document.querySelector('.hero').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'flex';
}

function hideLogin() {
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.features').style.display = 'grid';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'none';
}

function showFeatures(event) {
    if (event) event.preventDefault();
    document.querySelector('.hero').style.display = 'block';
    document.querySelector('.features').style.display = 'grid';
    document.getElementById('login').style.display = 'none';
    document.getElementById('register').style.display = 'none';
    document.getElementById('recovery').style.display = 'none';
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const user = USERS.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            const errorDiv = document.getElementById('password-error');
            errorDiv.textContent = 'Usuario o contraseña incorrectos';
            errorDiv.classList.add('show');
        }
    });
}

if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        document.getElementById('reg-username-error').classList.remove('show');
        document.getElementById('reg-password-error').classList.remove('show');
        document.getElementById('reg-confirm-error').classList.remove('show');
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
        const existingUser = USERS.find(u => u.username === username);
        if (existingUser) {
            document.getElementById('reg-username-error').textContent = 'Este usuario ya existe';
            document.getElementById('reg-username-error').classList.add('show');
            return;
        }
        USERS.push({ username, password, name, email, role: 'usuario' });
        alert('¡Cuenta creada exitosamente!\n\nUsuario: ' + username + '\n\nYa puedes iniciar sesión.');
        showLogin();
        this.reset();
    });
}

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
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// ============ VERIFICAR PERMISOS ============
function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

function isUsuario() {
    return currentUser && currentUser.role === 'usuario';
}

// ============ APLICAR RESTRICCIONES POR ROL ============
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

// ============ BASE DE DATOS SIMULADA ============
// Inventario
let inventory = JSON.parse(localStorage.getItem('inventory')) || [
    { id: 1, code: 'BF-001', name: 'Balón de Fútbol', category: 'Fútbol', quantity: 15, description: 'Balón profesional Nike' },
    { id: 2, code: 'BB-012', name: 'Balón de Basketball', category: 'Basketball', quantity: 20, description: 'Balón Spalding' },
    { id: 3, code: 'RT-003', name: 'Raqueta de Tenis', category: 'Tenis', quantity: 8, description: 'Raqueta Wilson' }
];

// Tickets
let tickets = JSON.parse(localStorage.getItem('tickets')) || [
    { id: 1, title: 'Solicitud de balones', requester: 'Juan Pérez', status: 'Abierto', description: 'Necesito 3 balones de fútbol', date: '2026-04-01' },
    { id: 2, title: 'Reparación de red', requester: 'María González', status: 'En Proceso', description: 'La red de voleibol está rota', date: '2026-04-02' }
];

// ============ GUARDAR EN LOCALSTORAGE ============
function saveData() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('tickets', JSON.stringify(tickets));
    updateStats();
}

// ============ NAVEGACIÓN ============
function showView(viewName) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Mostrar vista seleccionada
    document.getElementById(viewName + '-view').classList.add('active');
    
    // Actualizar pestañas activas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ============ ACTUALIZAR ESTADÍSTICAS ============
function updateStats() {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const availableItems = inventory.filter(item => item.quantity > 0).length;
    const openTickets = tickets.filter(t => t.status === 'Abierto').length;
    const totalTickets = tickets.length;
    
    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('available-items').textContent = availableItems;
    document.getElementById('open-tickets').textContent = openTickets;
    document.getElementById('total-tickets').textContent = totalTickets;
}

// =====================================================
// GESTIÓN DE INVENTARIO - CRUD
// =====================================================

// ============ RENDERIZAR INVENTARIO ============
function renderInventory() {
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = '';
    
    inventory.forEach(item => {
        const statusClass = item.quantity > 0 ? 'status-disponible' : 'status-prestado';
        const statusText = item.quantity > 0 ? 'Disponible' : 'Agotado';
        
        // Construir botones según rol
        let actionsHTML = '';
        if (isAdmin()) {
            // Admin ve todos los botones
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="editItem(${item.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteItem(${item.id})">Eliminar</button>
            `;
        } else {
            // Usuario solo ve un botón de ver detalles
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="viewItem(${item.id})">Ver Detalles</button>
            `;
        }
        
        const row = `
            <tr>
                <td>${item.code}</td>
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td class="actions">
                    ${actionsHTML}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ============ ABRIR MODAL INVENTARIO ============
function openInventoryModal(itemId = null) {
    // Solo admin puede abrir modal de crear/editar
    if (!isAdmin()) {
        alert('Solo los administradores pueden agregar o modificar artículos.');
        return;
    }
    
    const modal = document.getElementById('inventory-modal');
    const form = document.getElementById('inventory-form');
    const title = document.getElementById('inventory-modal-title');
    
    form.reset();
    
    if (itemId) {
        // MODO EDICIÓN
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            title.textContent = 'Editar Artículo';
            document.getElementById('item-id').value = item.id;
            document.getElementById('item-code').value = item.code;
            document.getElementById('item-name').value = item.name;
            document.getElementById('item-category').value = item.category;
            document.getElementById('item-quantity').value = item.quantity;
            document.getElementById('item-description').value = item.description || '';
        }
    } else {
        // MODO CREACIÓN
        title.textContent = 'Nuevo Artículo';
        document.getElementById('item-id').value = '';
    }
    
    modal.classList.add('show');
}

// ============ CERRAR MODAL INVENTARIO ============
function closeInventoryModal() {
    document.getElementById('inventory-modal').classList.remove('show');
}

// ============ GUARDAR ARTÍCULO ============
document.getElementById('inventory-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('item-id').value;
    const itemData = {
        code: document.getElementById('item-code').value,
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        quantity: parseInt(document.getElementById('item-quantity').value),
        description: document.getElementById('item-description').value
    };
    
    if (id) {
        // ACTUALIZAR
        const index = inventory.findIndex(i => i.id === parseInt(id));
        if (index !== -1) {
            inventory[index] = { ...inventory[index], ...itemData };
        }
    } else {
        // CREAR
        const newId = inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1;
        inventory.push({ id: newId, ...itemData });
    }
    
    saveData();
    renderInventory();
    closeInventoryModal();
});

// ============ EDITAR ARTÍCULO ============
function editItem(id) {
    openInventoryModal(id);
}

// ============ ELIMINAR ARTÍCULO ============
function deleteItem(id) {
    // Solo admin puede eliminar
    if (!isAdmin()) {
        alert('Solo los administradores pueden eliminar artículos.');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este artículo?')) {
        inventory = inventory.filter(item => item.id !== id);
        saveData();
        renderInventory();
    }
}

// =====================================================
// GESTIÓN DE TICKETS - CRUD
// =====================================================

// ============ RENDERIZAR TICKETS ============
function renderTickets() {
    const tbody = document.getElementById('tickets-tbody');
    tbody.innerHTML = '';
    
    tickets.forEach(ticket => {
        let statusClass = 'status-abierto';
        if (ticket.status === 'Cerrado') statusClass = 'status-cerrado';
        if (ticket.status === 'En Proceso') statusClass = 'status-en-proceso';
        
        // Construir botones según rol
        let actionsHTML = '';
        if (isAdmin()) {
            // Admin puede editar y eliminar
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="editTicket(${ticket.id})">Editar</button>
                <button class="btn btn-danger btn-small" onclick="deleteTicket(${ticket.id})">Eliminar</button>
            `;
        } else {
            // Usuario solo puede ver detalles o cambiar estado su propio ticket
            actionsHTML = `
                <button class="btn btn-secondary btn-small" onclick="viewTicket(${ticket.id})">Ver Detalles</button>
            `;
        }
        
        const row = `
            <tr>
                <td>#${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${ticket.requester}</td>
                <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
                <td>${ticket.date}</td>
                <td class="actions">
                    ${actionsHTML}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// ============ ABRIR MODAL TICKET ============
function openTicketModal(ticketId = null) {
    // Solo admin puede abrir modal de crear/editar
    if (!isAdmin()) {
        alert('Solo los administradores pueden gestionar tickets. Los usuarios pueden crear nuevas solicitudes en la sección de Tickets.');
        return;
    }
    
    const modal = document.getElementById('ticket-modal');
    const form = document.getElementById('ticket-form');
    const title = document.getElementById('ticket-modal-title');
    
    form.reset();
    
    if (ticketId) {
        // MODO EDICIÓN
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
    
    modal.classList.add('show');
}

// ============ CERRAR MODAL TICKET ============
function closeTicketModal() {
    document.getElementById('ticket-modal').classList.remove('show');
}

// ============ GUARDAR TICKET ============
document.getElementById('ticket-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('ticket-id').value;
    const ticketData = {
        title: document.getElementById('ticket-title').value,
        requester: document.getElementById('ticket-requester').value,
        status: document.getElementById('ticket-status').value,
        description: document.getElementById('ticket-description').value,
        date: new Date().toISOString().split('T')[0]
    };
    
    if (id) {
        // ACTUALIZAR
        const index = tickets.findIndex(t => t.id === parseInt(id));
        if (index !== -1) {
            tickets[index] = { ...tickets[index], ...ticketData };
        }
    } else {
        // CREAR
        const newId = tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1;
        tickets.push({ id: newId, ...ticketData });
    }
    
    saveData();
    renderTickets();
    closeTicketModal();
});

// ============ EDITAR TICKET ============
function editTicket(id) {
    openTicketModal(id);
}

// ============ ELIMINAR TICKET ============
function deleteTicket(id) {
    // Solo admin puede eliminar
    if (!isAdmin()) {
        alert('Solo los administradores pueden eliminar tickets.');
        return;
    }
    
    if (confirm('¿Estás seguro de eliminar este ticket?')) {
        tickets = tickets.filter(ticket => ticket.id !== id);
        saveData();
        renderTickets();
    }
}

// ============ INICIALIZACIÓN ============
document.addEventListener('DOMContentLoaded', function() {
    if (isDashboard) {
        applyRoleRestrictions();
        renderInventory();
        renderTickets();
        updateStats();
    }
});

// ============ VER DETALLES ARTÍCULO (para usuarios) ============
function viewItem(id) {
    const item = inventory.find(i => i.id === id);
    if (item) {
        alert(`📦 ARTÍCULO: ${item.name}\n\nCódigo: ${item.code}\nCategoría: ${item.category}\nCantidad disponible: ${item.quantity}\nDescripción: ${item.description || 'Sin descripción'}`);
    }
}

// ============ VER DETALLES TICKET (para usuarios) ============
function viewTicket(id) {
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
        alert(`🎫 TICKET #${ticket.id}\n\nTítulo: ${ticket.title}\nSolicitante: ${ticket.requester}\nEstado: ${ticket.status}\nDescripción: ${ticket.description}\nFecha: ${ticket.date}`);
    }
}

