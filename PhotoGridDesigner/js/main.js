// Main application initialization and global functionality
class PhotoGridApp {
    constructor() {
        this.theme = new ThemeManager();
        this.i18n = new I18nManager();
        this.grid = new GridManager();
        this.adminPassword = 'admin123'; // Default admin password
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialData();
        this.setupAccessibility();
    }
    
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.theme.toggle();
            });
        }
        
        // Language toggle
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.i18n.toggle();
            });
        }
        
        // Admin button
        const adminBtn = document.getElementById('adminBtn');
        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                this.showAdminModal();
            });
        }
        
        // Admin modal
        this.setupAdminModal();
        
        // Window events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Storage events for cross-tab synchronization
        window.addEventListener('storage', (e) => {
            this.handleStorageChange(e);
        });
    }
    
    setupAdminModal() {
        const modal = document.getElementById('adminModal');
        const closeModal = document.getElementById('closeModal');
        const cancelLogin = document.getElementById('cancelLogin');
        const loginForm = document.getElementById('adminLoginForm');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideAdminModal();
            });
        }
        
        if (cancelLogin) {
            cancelLogin.addEventListener('click', () => {
                this.hideAdminModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAdminModal();
                }
            });
        }
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAdminLogin();
            });
        }
    }
    
    showAdminModal() {
        const modal = document.getElementById('adminModal');
        const passwordInput = document.getElementById('adminPassword');
        const errorDiv = document.getElementById('loginError');
        
        if (modal) {
            modal.classList.add('show');
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }
    }
    
    hideAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
    
    handleAdminLogin() {
        const passwordInput = document.getElementById('adminPassword');
        const errorDiv = document.getElementById('loginError');
        const password = passwordInput ? passwordInput.value : '';
        
        // Get stored admin password or use default
        const storedPassword = localStorage.getItem('adminPassword') || this.adminPassword;
        
        if (password === storedPassword) {
            // Store admin session
            sessionStorage.setItem('adminLoggedIn', 'true');
            this.hideAdminModal();
            
            // Redirect to admin page
            window.location.href = 'admin.html';
        } else {
            if (errorDiv) {
                errorDiv.textContent = this.i18n.t('admin.login.error');
                errorDiv.style.display = 'block';
            }
            if (passwordInput) {
                passwordInput.focus();
                passwordInput.select();
            }
        }
    }
    
    loadInitialData() {
        // Load and display templates
        this.grid.loadTemplates();
        
        // Update page language
        this.i18n.updatePage();
        
        // Apply saved theme
        this.theme.apply();
    }
    
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.grid.handleResize();
        }, 250);
    }
    
    handleStorageChange(e) {
        switch (e.key) {
            case 'theme':
                this.theme.apply();
                break;
            case 'language':
                this.i18n.updatePage();
                break;
            case 'photoTemplates':
                this.grid.loadTemplates();
                break;
        }
    }
    
    setupAccessibility() {
        // Add keyboard navigation support
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal.show');
                if (modal) {
                    this.hideAdminModal();
                }
            }
            
            // Enter key activates buttons
            if (e.key === 'Enter' && e.target.classList.contains('template-card')) {
                e.target.click();
            }
        });
        
        // Add focus indicators
        document.addEventListener('focusin', (e) => {
            if (e.target.classList.contains('template-card')) {
                e.target.setAttribute('tabindex', '0');
            }
        });
        
        // Screen reader announcements
        this.announceToScreenReader = (message) => {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.style.position = 'absolute';
            announcement.style.left = '-10000px';
            announcement.style.width = '1px';
            announcement.style.height = '1px';
            announcement.style.overflow = 'hidden';
            announcement.textContent = message;
            
            document.body.appendChild(announcement);
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        };
    }
    
    // Utility methods
    showLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'block';
        }
    }
    
    hideLoading() {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
    }
    
    showError(message) {
        console.error('PhotoGrid Error:', message);
        this.announceToScreenReader(`Error: ${message}`);
    }
    
    // SEO and metadata updates
    updatePageMeta() {
        const currentLang = this.i18n.getCurrentLanguage();
        document.documentElement.lang = currentLang;
        
        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = this.i18n.t('meta.description');
        }
        
        // Update title
        document.title = this.i18n.t('meta.title');
    }
    
    // Performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Lazy loading for images
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.photoGridApp = new PhotoGridApp();
});

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment if you want to add service worker support
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhotoGridApp;
}
