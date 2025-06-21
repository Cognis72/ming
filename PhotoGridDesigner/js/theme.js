// Theme management system
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.storageKey = 'theme';
        this.themes = ['light', 'dark'];
        
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.updateToggleButton();
        this.detectSystemPreference();
    }
    
    loadTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem(this.storageKey);
        
        if (savedTheme && this.themes.includes(savedTheme)) {
            this.currentTheme = savedTheme;
        } else {
            // Fallback to system preference
            this.currentTheme = this.getSystemPreference();
        }
        
        this.apply();
    }
    
    getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    detectSystemPreference() {
        // Listen for system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // Only update if user hasn't manually set a preference
                if (!localStorage.getItem(this.storageKey)) {
                    this.currentTheme = e.matches ? 'dark' : 'light';
                    this.apply();
                    this.updateToggleButton();
                }
            });
        }
    }
    
    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.save();
        this.apply();
        this.updateToggleButton();
        this.announceThemeChange();
    }
    
    setTheme(theme) {
        if (this.themes.includes(theme)) {
            this.currentTheme = theme;
            this.save();
            this.apply();
            this.updateToggleButton();
            this.announceThemeChange();
        }
    }
    
    apply() {
        // Remove all theme classes
        this.themes.forEach(theme => {
            document.body.classList.remove(`${theme}-theme`);
        });
        
        // Add current theme class
        document.body.classList.add(`${this.currentTheme}-theme`);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor();
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme }
        }));
    }
    
    save() {
        localStorage.setItem(this.storageKey, this.currentTheme);
    }
    
    updateToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;
        
        const sunIcon = themeToggle.querySelector('.icon-sun');
        const moonIcon = themeToggle.querySelector('.icon-moon');
        
        if (this.currentTheme === 'dark') {
            if (sunIcon) sunIcon.style.opacity = '1';
            if (moonIcon) moonIcon.style.opacity = '0';
            themeToggle.setAttribute('aria-label', 'Switch to light mode');
        } else {
            if (sunIcon) sunIcon.style.opacity = '0';
            if (moonIcon) moonIcon.style.opacity = '1';
            themeToggle.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
    
    updateMetaThemeColor() {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        const colors = {
            light: '#ffffff',
            dark: '#0f172a'
        };
        
        metaThemeColor.content = colors[this.currentTheme];
    }
    
    announceThemeChange() {
        // Announce theme change to screen readers
        const message = `Theme changed to ${this.currentTheme} mode`;
        
        // Create temporary announcement element
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
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    isDark() {
        return this.currentTheme === 'dark';
    }
    
    isLight() {
        return this.currentTheme === 'light';
    }
    
    // Get computed CSS custom properties for the current theme
    getThemeColors() {
        const styles = getComputedStyle(document.body);
        
        return {
            primary: styles.getPropertyValue('--primary-color').trim(),
            primaryHover: styles.getPropertyValue('--primary-hover').trim(),
            primaryLight: styles.getPropertyValue('--primary-light').trim(),
            textColor: styles.getPropertyValue('--text-color').trim(),
            textSecondary: styles.getPropertyValue('--text-secondary').trim(),
            bgColor: styles.getPropertyValue('--bg-color').trim(),
            secondaryBg: styles.getPropertyValue('--secondary-bg').trim(),
            cardBg: styles.getPropertyValue('--card-bg').trim(),
            borderColor: styles.getPropertyValue('--border-color').trim()
        };
    }
    
    // Advanced theme features
    createCustomTheme(name, colors) {
        // Allow for custom theme creation in the future
        const customTheme = {
            name,
            colors,
            createdAt: new Date().toISOString()
        };
        
        const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
        customThemes.push(customTheme);
        localStorage.setItem('customThemes', JSON.stringify(customThemes));
        
        return customTheme;
    }
    
    getCustomThemes() {
        return JSON.parse(localStorage.getItem('customThemes') || '[]');
    }
    
    // Theme animation utilities
    smoothTransition(duration = 300) {
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: background-color ${duration}ms ease,
                           color ${duration}ms ease,
                           border-color ${duration}ms ease,
                           box-shadow ${duration}ms ease !important;
            }
        `;
        
        document.head.appendChild(style);
        
        setTimeout(() => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, duration + 100);
    }
    
    // Auto theme switching based on time
    enableAutoTheme(lightHour = 6, darkHour = 18) {
        const checkTime = () => {
            const hour = new Date().getHours();
            const shouldBeDark = hour < lightHour || hour >= darkHour;
            const newTheme = shouldBeDark ? 'dark' : 'light';
            
            if (newTheme !== this.currentTheme) {
                this.setTheme(newTheme);
            }
        };
        
        // Check immediately
        checkTime();
        
        // Check every hour
        setInterval(checkTime, 60 * 60 * 1000);
        
        // Store auto theme preference
        localStorage.setItem('autoTheme', 'true');
        localStorage.setItem('autoThemeLightHour', lightHour.toString());
        localStorage.setItem('autoThemeDarkHour', darkHour.toString());
    }
    
    disableAutoTheme() {
        localStorage.removeItem('autoTheme');
        localStorage.removeItem('autoThemeLightHour');
        localStorage.removeItem('autoThemeDarkHour');
    }
    
    isAutoThemeEnabled() {
        return localStorage.getItem('autoTheme') === 'true';
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
