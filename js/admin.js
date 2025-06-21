// Admin panel functionality
class AdminManager {
    constructor() {
        this.theme = new ThemeManager();
        this.i18n = new I18nManager();
        this.grid = new GridManager();
        this.currentEditId = null;
        
        this.init();
    }
    
    init() {
        this.checkAuthAndRedirect();
        this.setupEventListeners();
        this.loadAdminData();
        this.setupAccessibility();
    }
    
    checkAuthAndRedirect() {
        // Check if user is logged in as admin
        if (!sessionStorage.getItem('adminLoggedIn')) {
            window.location.href = 'index.html';
            return;
        }
    }
    
    setupEventListeners() {
        // Theme and language toggles
        this.setupThemeAndLanguage();
        
        // Navigation
        this.setupNavigation();
        
        // Template management
        this.setupTemplateManagement();
        
        // Settings
        this.setupSettings();
        
        // Logout
        this.setupLogout();
        
        // Global events
        this.setupGlobalEvents();
    }
    
    setupThemeAndLanguage() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.theme.toggle();
            });
        }
        
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.i18n.toggle();
            });
        }
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.admin-nav .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href').substring(1);
                this.showSection(target);
                this.updateActiveNavLink(e.target);
            });
        });
    }
    
    setupTemplateManagement() {
        // Add template button
        const addTemplateBtn = document.getElementById('addTemplateBtn');
        if (addTemplateBtn) {
            addTemplateBtn.addEventListener('click', () => {
                this.showTemplateForm();
            });
        }
        
        // Template form
        const templateForm = document.getElementById('templateForm');
        if (templateForm) {
            templateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTemplate();
            });
        }
        
        // Cancel template form
        const cancelTemplateBtn = document.getElementById('cancelTemplateBtn');
        if (cancelTemplateBtn) {
            cancelTemplateBtn.addEventListener('click', () => {
                this.hideTemplateForm();
            });
        }
        
        // Delete confirmation modal
        this.setupDeleteModal();
    }
    
    setupDeleteModal() {
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const deleteModal = document.getElementById('deleteModal');
        
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }
        
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }
        
        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === deleteModal) {
                    this.hideDeleteModal();
                }
            });
        }
    }
    
    setupSettings() {
        // Change password
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.changeAdminPassword();
            });
        }
        
        // Export data
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportTemplates();
            });
        }
        
        // Clear data
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.clearAllTemplates();
            });
        }
    }
    
    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }
    
    setupGlobalEvents() {
        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal[style*="display: block"], .modal.show');
                if (modal) {
                    this.hideDeleteModal();
                }
            }
        });
        
        // Handle storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'photoTemplates') {
                this.loadTemplates();
            }
        });
    }
    
    loadAdminData() {
        this.loadTemplates();
        this.i18n.updatePage();
        this.theme.apply();
    }
    
    showSection(sectionId) {
        // Hide all sections
        const sections = document.querySelectorAll('.admin-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(`${sectionId}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
        }
    }
    
    updateActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.admin-nav .nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        activeLink.classList.add('active');
    }
    
    loadTemplates() {
        const templates = this.grid.getTemplates();
        const container = document.getElementById('adminTemplatesGrid');
        const emptyState = document.getElementById('adminEmptyState');
        
        if (!container || !emptyState) return;
        
        if (templates.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            container.style.display = 'grid';
            emptyState.style.display = 'none';
            container.innerHTML = '';
            
            templates.forEach(template => {
                const templateCard = this.createAdminTemplateCard(template);
                container.appendChild(templateCard);
            });
        }
    }
    
    createAdminTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'admin-template-card';
        card.innerHTML = `
            <div class="admin-template-image">
                ${template.imageUrl ? 
                    `<img src="${template.imageUrl}" alt="${template.name}" loading="lazy">` :
                    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>'
                }
            </div>
            <div class="admin-template-content">
                <h4 class="admin-template-title">${template.name}</h4>
                <p class="template-description">${template.description || ''}</p>
                <div class="template-meta">
                    <span class="template-category">${template.category}</span>
                    <span class="template-date">${this.i18n.formatDate(new Date(template.createdAt))}</span>
                </div>
                <div class="admin-template-actions">
                    <button class="btn-secondary edit-btn" data-id="${template.id}">
                        ${this.i18n.t('common.edit')}
                    </button>
                    <button class="btn-danger delete-btn" data-id="${template.id}">
                        ${this.i18n.t('common.delete')}
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editTemplate(template.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.showDeleteModal(template.id);
            });
        }
        
        return card;
    }
    
    showTemplateForm(template = null) {
        const container = document.getElementById('templateFormContainer');
        const form = document.getElementById('templateForm');
        const formTitle = document.getElementById('formTitle');
        
        if (!container || !form) return;
        
        // Reset form
        form.reset();
        this.currentEditId = null;
        
        if (template) {
            // Edit mode
            this.currentEditId = template.id;
            formTitle.textContent = this.i18n.t('admin.templates.form.edit');
            
            // Populate form
            document.getElementById('templateName').value = template.name;
            document.getElementById('templateDescription').value = template.description || '';
            document.getElementById('templateCategory').value = template.category;
            document.getElementById('templateImageUrl').value = template.imageUrl || '';
            document.getElementById('templateGrid').value = template.gridConfig || '';
        } else {
            // Add mode
            formTitle.textContent = this.i18n.t('admin.templates.form.add');
        }
        
        container.style.display = 'block';
        document.getElementById('templateName').focus();
    }
    
    hideTemplateForm() {
        const container = document.getElementById('templateFormContainer');
        if (container) {
            container.style.display = 'none';
        }
        this.currentEditId = null;
    }
    
    saveTemplate() {
        const name = document.getElementById('templateName').value.trim();
        const description = document.getElementById('templateDescription').value.trim();
        const category = document.getElementById('templateCategory').value;
        const imageUrl = document.getElementById('templateImageUrl').value.trim();
        const gridConfig = document.getElementById('templateGrid').value.trim();
        
        if (!name) {
            this.showToast('Template name is required', 'error');
            return;
        }
        
        const templateData = {
            name,
            description,
            category,
            imageUrl,
            gridConfig
        };
        
        let success = false;
        
        if (this.currentEditId) {
            // Update existing template
            success = this.grid.updateTemplate(this.currentEditId, templateData);
        } else {
            // Add new template
            success = this.grid.addTemplate(templateData);
        }
        
        if (success) {
            this.hideTemplateForm();
            this.loadTemplates();
            const message = this.currentEditId ? 
                this.i18n.t('admin.messages.templateUpdated') : 
                this.i18n.t('admin.messages.templateAdded');
            this.showToast(message, 'success');
        } else {
            this.showToast(this.i18n.t('admin.messages.templateError'), 'error');
        }
    }
    
    editTemplate(templateId) {
        const template = this.grid.getTemplate(templateId);
        if (template) {
            this.showTemplateForm(template);
        }
    }
    
    showDeleteModal(templateId) {
        this.deleteTemplateId = templateId;
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.deleteTemplateId = null;
    }
    
    confirmDelete() {
        if (this.deleteTemplateId) {
            const success = this.grid.deleteTemplate(this.deleteTemplateId);
            if (success) {
                this.loadTemplates();
                this.showToast(this.i18n.t('admin.messages.templateDeleted'), 'success');
            } else {
                this.showToast(this.i18n.t('admin.messages.deleteError'), 'error');
            }
        }
        this.hideDeleteModal();
    }
    
    changeAdminPassword() {
        const newPassword = document.getElementById('adminPasswordChange').value.trim();
        
        if (!newPassword) {
            this.showToast('Please enter a new password', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            this.showToast('Password must be at least 6 characters long', 'error');
            return;
        }
        
        localStorage.setItem('adminPassword', newPassword);
        document.getElementById('adminPasswordChange').value = '';
        this.showToast('Admin password changed successfully', 'success');
    }
    
    exportTemplates() {
        const templates = this.grid.getTemplates();
        const dataStr = JSON.stringify(templates, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `photo-templates-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('Templates exported successfully', 'success');
    }
    
    clearAllTemplates() {
        if (confirm(this.i18n.t('admin.settings.confirmClear'))) {
            this.grid.clearAllTemplates();
            this.loadTemplates();
            this.showToast('All templates cleared', 'success');
        }
    }
    
    logout() {
        sessionStorage.removeItem('adminLoggedIn');
        window.location.href = 'index.html';
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    setupAccessibility() {
        // Add keyboard navigation for template cards
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('admin-template-card')) {
                const editBtn = e.target.querySelector('.edit-btn');
                if (editBtn) editBtn.click();
            }
        });
        
        // Add focus management for forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                // Focus first error field if validation fails
                setTimeout(() => {
                    const errorField = form.querySelector('.error, :invalid');
                    if (errorField) {
                        errorField.focus();
                    }
                }, 100);
            });
        });
    }
}

// Initialize admin panel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminManager = new AdminManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminManager;
}
