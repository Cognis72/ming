// Grid and template management system
class GridManager {
    constructor() {
        this.templates = [];
        this.storageKey = 'photoTemplates';
        this.defaultGridConfig = 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;';
        
        this.init();
    }
    
    init() {
        this.loadFromStorage();
        this.addSampleTemplatesIfEmpty();
        this.setupImageLazyLoading();
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.templates = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading templates from storage:', error);
            this.templates = [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.templates));
            return true;
        } catch (error) {
            console.error('Error saving templates to storage:', error);
            return false;
        }
    }
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    addTemplate(templateData) {
        try {
            const template = {
                id: this.generateId(),
                name: templateData.name,
                description: templateData.description || '',
                category: templateData.category || 'portrait',
                imageUrl: templateData.imageUrl || '',
                gridConfig: templateData.gridConfig || this.defaultGridConfig,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            this.templates.push(template);
            const success = this.saveToStorage();
            
            if (success) {
                this.triggerUpdate();
                return template;
            }
            return false;
        } catch (error) {
            console.error('Error adding template:', error);
            return false;
        }
    }
    
    updateTemplate(templateId, templateData) {
        try {
            const index = this.templates.findIndex(t => t.id === templateId);
            if (index === -1) return false;
            
            this.templates[index] = {
                ...this.templates[index],
                name: templateData.name,
                description: templateData.description || '',
                category: templateData.category || 'portrait',
                imageUrl: templateData.imageUrl || '',
                gridConfig: templateData.gridConfig || this.defaultGridConfig,
                updatedAt: new Date().toISOString()
            };
            
            const success = this.saveToStorage();
            if (success) {
                this.triggerUpdate();
            }
            return success;
        } catch (error) {
            console.error('Error updating template:', error);
            return false;
        }
    }
    
    deleteTemplate(templateId) {
        try {
            const index = this.templates.findIndex(t => t.id === templateId);
            if (index === -1) return false;
            
            this.templates.splice(index, 1);
            const success = this.saveToStorage();
            
            if (success) {
                this.triggerUpdate();
            }
            return success;
        } catch (error) {
            console.error('Error deleting template:', error);
            return false;
        }
    }
    
    getTemplate(templateId) {
        return this.templates.find(t => t.id === templateId) || null;
    }
    
    getTemplates(category = null) {
        if (category) {
            return this.templates.filter(t => t.category === category);
        }
        return [...this.templates];
    }
    
    getTemplatesByCategory() {
        const categorized = {};
        this.templates.forEach(template => {
            if (!categorized[template.category]) {
                categorized[template.category] = [];
            }
            categorized[template.category].push(template);
        });
        return categorized;
    }
    
    addSampleTemplatesIfEmpty() {
        // Only add sample templates if storage is empty
        if (this.templates.length === 0) {
            const sampleTemplates = [
                {
                    name: "Portrait Grid Collection",
                    description: "Professional portrait photography layout with elegant spacing",
                    category: "portrait",
                    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face",
                    gridConfig: "grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;"
                },
                {
                    name: "Landscape Nature Series",
                    description: "Stunning landscape photography showcasing natural beauty",
                    category: "landscape",
                    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
                    gridConfig: "grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;"
                },
                {
                    name: "Square Photo Mosaic",
                    description: "Clean square format perfect for Instagram-style galleries",
                    category: "square",
                    imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
                    gridConfig: "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; aspect-ratio: 1;"
                },
                {
                    name: "Wedding Collage Template",
                    description: "Romantic wedding photography collage with multiple photo slots",
                    category: "collage",
                    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=400&fit=crop",
                    gridConfig: "display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 0.5rem;"
                },
                {
                    name: "Fashion Portfolio Grid",
                    description: "High-fashion portrait layout for model portfolios",
                    category: "portrait",
                    imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
                    gridConfig: "grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem;"
                },
                {
                    name: "Urban Architecture",
                    description: "Modern cityscape and architectural photography display",
                    category: "landscape",
                    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=400&fit=crop",
                    gridConfig: "grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.8rem;"
                },
                {
                    name: "Minimalist Square Grid",
                    description: "Clean, minimal square layout with generous whitespace",
                    category: "square",
                    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop",
                    gridConfig: "grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2.5rem;"
                },
                {
                    name: "Travel Memory Collage",
                    description: "Adventure and travel photography collection layout",
                    category: "collage",
                    imageUrl: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=400&fit=crop",
                    gridConfig: "display: grid; grid-template-columns: 1fr 1fr 1fr; grid-template-rows: auto auto; gap: 1rem;"
                }
            ];

            sampleTemplates.forEach(templateData => {
                this.addTemplate(templateData);
            });
        }
    }

    clearAllTemplates() {
        this.templates = [];
        const success = this.saveToStorage();
        if (success) {
            this.triggerUpdate();
        }
        return success;
    }
    
    loadTemplates() {
        const container = document.getElementById('templateGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        // Show loading
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        container.style.display = 'none';
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            this.renderTemplates();
        }, 500);
    }
    
    renderTemplates() {
        const container = document.getElementById('templateGrid');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        // Hide loading
        if (loadingState) loadingState.style.display = 'none';
        
        if (this.templates.length === 0) {
            container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
        } else {
            if (emptyState) emptyState.style.display = 'none';
            container.style.display = 'grid';
            container.innerHTML = '';
            
            this.templates.forEach(template => {
                const templateCard = this.createTemplateCard(template);
                container.appendChild(templateCard);
            });
            
            // Setup lazy loading for new images
            this.setupImageLazyLoading();
        }
    }
    
    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${template.name} template`);
        
        // Create image element with lazy loading
        const imageElement = template.imageUrl ? 
            `<img class="template-image" data-src="${template.imageUrl}" alt="${template.name}" loading="lazy">` :
            `<div class="template-image">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                </svg>
            </div>`;
        
        card.innerHTML = `
            ${imageElement}
            <div class="template-content">
                <h3 class="template-title">${this.escapeHtml(template.name)}</h3>
                <p class="template-description">${this.escapeHtml(template.description)}</p>
                <div class="template-meta">
                    <span class="template-category">${this.escapeHtml(template.category)}</span>
                    <span class="template-date">${this.formatDate(template.createdAt)}</span>
                </div>
            </div>
        `;
        
        // Add click event
        card.addEventListener('click', () => {
            this.openTemplatePreview(template);
        });
        
        // Add keyboard event
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.openTemplatePreview(template);
            }
        });
        
        return card;
    }
    
    openTemplatePreview(template) {
        // Create modal for template preview
        const modal = this.createPreviewModal(template);
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Focus management
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) closeBtn.focus();
    }
    
    createPreviewModal(template) {
        const modal = document.createElement('div');
        modal.className = 'modal template-preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.escapeHtml(template.name)}</h3>
                    <button class="btn-close" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="template-preview">
                        ${template.imageUrl ? 
                            `<img src="${template.imageUrl}" alt="${template.name}" style="width: 100%; height: auto; border-radius: 0.5rem;">` :
                            '<div class="no-image">No preview image available</div>'
                        }
                        <div class="template-details">
                            <p><strong>Category:</strong> ${this.escapeHtml(template.category)}</p>
                            <p><strong>Description:</strong> ${this.escapeHtml(template.description)}</p>
                            <p><strong>Created:</strong> ${this.formatDate(template.createdAt)}</p>
                            ${template.gridConfig ? 
                                `<div class="grid-config">
                                    <strong>Grid Configuration:</strong>
                                    <pre><code>${this.escapeHtml(template.gridConfig)}</code></pre>
                                </div>` : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const closeBtn = modal.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closePreviewModal(modal);
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePreviewModal(modal);
            }
        });
        
        // Escape key handler
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closePreviewModal(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        return modal;
    }
    
    closePreviewModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 300);
    }
    
    setupImageLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
    
    handleResize() {
        // Recalculate grid layouts if needed
        const container = document.getElementById('templateGrid');
        if (container) {
            // Trigger reflow for responsive adjustments
            container.style.display = 'none';
            container.offsetHeight; // Trigger reflow
            container.style.display = 'grid';
        }
    }
    
    triggerUpdate() {
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('templatesUpdated', {
            detail: { templates: this.templates }
        }));
        
        // Update display if we're on the main page
        if (document.getElementById('templateGrid')) {
            this.renderTemplates();
        }
    }
    
    // Search functionality
    searchTemplates(query) {
        const searchTerm = query.toLowerCase().trim();
        if (!searchTerm) return this.templates;
        
        return this.templates.filter(template => 
            template.name.toLowerCase().includes(searchTerm) ||
            template.description.toLowerCase().includes(searchTerm) ||
            template.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter functionality
    filterTemplates(filters) {
        let filtered = [...this.templates];
        
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === filters.category);
        }
        
        if (filters.dateFrom) {
            filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(filters.dateFrom));
        }
        
        if (filters.dateTo) {
            filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(filters.dateTo));
        }
        
        return filtered;
    }
    
    // Sort functionality
    sortTemplates(sortBy = 'createdAt', order = 'desc') {
        const sorted = [...this.templates];
        
        sorted.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            // Handle dates
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            // Handle strings
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (order === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
        
        return sorted;
    }
    
    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Export/Import functionality
    exportTemplates() {
        return JSON.stringify(this.templates, null, 2);
    }
    
    importTemplates(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            if (Array.isArray(imported)) {
                imported.forEach(template => {
                    // Validate required fields
                    if (template.name) {
                        this.addTemplate(template);
                    }
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing templates:', error);
            return false;
        }
    }
    
    // Statistics
    getStatistics() {
        const stats = {
            total: this.templates.length,
            categories: {},
            recentlyAdded: 0
        };
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        this.templates.forEach(template => {
            // Count by category
            if (!stats.categories[template.category]) {
                stats.categories[template.category] = 0;
            }
            stats.categories[template.category]++;
            
            // Count recently added
            if (new Date(template.createdAt) > weekAgo) {
                stats.recentlyAdded++;
            }
        });
        
        return stats;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GridManager;
}
