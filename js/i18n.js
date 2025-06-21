// Internationalization management system
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.storageKey = 'language';
        this.supportedLanguages = ['en', 'th'];
        this.translations = window.translations || {};
        
        this.init();
    }
    
    init() {
        this.loadLanguage();
        this.updateLanguageToggle();
        this.detectBrowserLanguage();
    }
    
    loadLanguage() {
        // Check localStorage first
        const savedLanguage = localStorage.getItem(this.storageKey);
        
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        } else {
            // Fallback to browser language or default
            this.currentLanguage = this.getBrowserLanguage();
        }
        
        this.updatePage();
    }
    
    getBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        return this.supportedLanguages.includes(langCode) ? langCode : 'en';
    }
    
    detectBrowserLanguage() {
        // Only use browser language if no preference is saved
        if (!localStorage.getItem(this.storageKey)) {
            const browserLang = this.getBrowserLanguage();
            if (browserLang !== this.currentLanguage) {
                this.currentLanguage = browserLang;
                this.updatePage();
            }
        }
    }
    
    toggle() {
        const currentIndex = this.supportedLanguages.indexOf(this.currentLanguage);
        const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
        this.currentLanguage = this.supportedLanguages[nextIndex];
        
        this.save();
        this.updatePage();
        this.updateLanguageToggle();
        this.announceLanguageChange();
    }
    
    setLanguage(language) {
        if (this.supportedLanguages.includes(language)) {
            this.currentLanguage = language;
            this.save();
            this.updatePage();
            this.updateLanguageToggle();
            this.announceLanguageChange();
        }
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getLanguageDisplayName(langCode = this.currentLanguage) {
        const displayNames = {
            'en': 'English',
            'th': 'ไทย'
        };
        return displayNames[langCode] || langCode.toUpperCase();
    }
    
    save() {
        localStorage.setItem(this.storageKey, this.currentLanguage);
    }
    
    updatePage() {
        this.updateDocumentLanguage();
        this.updateTextContent();
        this.updatePlaceholders();
        this.updateAriaLabels();
        this.updatePageDirection();
        this.updateMetadata();
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
    }
    
    updateDocumentLanguage() {
        document.documentElement.lang = this.currentLanguage;
    }
    
    updateTextContent() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }
    
    updatePlaceholders() {
        const elements = document.querySelectorAll('[data-i18n-placeholder]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            
            if (translation) {
                element.placeholder = translation;
            }
        });
    }
    
    updateAriaLabels() {
        const elements = document.querySelectorAll('[data-i18n-aria-label]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n-aria-label');
            const translation = this.t(key);
            
            if (translation) {
                element.setAttribute('aria-label', translation);
            }
        });
    }
    
    updatePageDirection() {
        // Set text direction for RTL languages (none currently supported, but ready for future)
        const rtlLanguages = []; // Add RTL language codes here if needed
        const isRTL = rtlLanguages.includes(this.currentLanguage);
        
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.body.classList.toggle('rtl', isRTL);
    }
    
    updateMetadata() {
        // Update page title
        const titleElement = document.querySelector('title[data-i18n]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                document.title = translation;
            }
        }
        
        // Update meta description
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            const translation = this.t('meta.description');
            if (translation) {
                descriptionMeta.content = translation;
            }
        }
        
        // Update Open Graph data
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            const translation = this.t('meta.title');
            if (translation) {
                ogTitle.content = translation;
            }
        }
        
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            const translation = this.t('meta.description');
            if (translation) {
                ogDescription.content = translation;
            }
        }
    }
    
    updateLanguageToggle() {
        const langToggle = document.getElementById('langToggle');
        if (!langToggle) return;
        
        const langText = langToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = this.currentLanguage.toUpperCase();
        }
        
        // Update aria-label
        const nextLang = this.getNextLanguage();
        const nextLangName = this.getLanguageDisplayName(nextLang);
        langToggle.setAttribute('aria-label', `Switch to ${nextLangName}`);
    }
    
    getNextLanguage() {
        const currentIndex = this.supportedLanguages.indexOf(this.currentLanguage);
        const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
        return this.supportedLanguages[nextIndex];
    }
    
    // Translation function with fallback
    t(key, defaultValue = null, interpolations = {}) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        // Navigate through nested object
        for (const k of keys) {
            if (translation && typeof translation === 'object' && k in translation) {
                translation = translation[k];
            } else {
                translation = null;
                break;
            }
        }
        
        // Fallback to English if translation not found
        if (!translation && this.currentLanguage !== 'en') {
            let fallback = this.translations['en'];
            for (const k of keys) {
                if (fallback && typeof fallback === 'object' && k in fallback) {
                    fallback = fallback[k];
                } else {
                    fallback = null;
                    break;
                }
            }
            translation = fallback;
        }
        
        // Final fallback to default value or key
        if (!translation) {
            translation = defaultValue || key;
        }
        
        // Handle interpolations
        if (typeof translation === 'string' && Object.keys(interpolations).length > 0) {
            translation = this.interpolate(translation, interpolations);
        }
        
        return translation;
    }
    
    interpolate(text, interpolations) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return interpolations[key] !== undefined ? interpolations[key] : match;
        });
    }
    
    announceLanguageChange() {
        const message = `Language changed to ${this.getLanguageDisplayName()}`;
        
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
    
    // Pluralization support
    plural(count, key, interpolations = {}) {
        const pluralKey = count === 1 ? `${key}.one` : `${key}.other`;
        return this.t(pluralKey, this.t(key), { ...interpolations, count });
    }
    
    // Date and number formatting
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return new Intl.DateTimeFormat(this.currentLanguage, formatOptions).format(date);
        } catch (error) {
            // Fallback to English if formatting fails
            return new Intl.DateTimeFormat('en', formatOptions).format(date);
        }
    }
    
    formatNumber(number, options = {}) {
        try {
            return new Intl.NumberFormat(this.currentLanguage, options).format(number);
        } catch (error) {
            // Fallback to English if formatting fails
            return new Intl.NumberFormat('en', options).format(number);
        }
    }
    
    // Currency formatting
    formatCurrency(amount, currency = 'USD', options = {}) {
        const defaultOptions = {
            style: 'currency',
            currency: currency
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        
        try {
            return new Intl.NumberFormat(this.currentLanguage, formatOptions).format(amount);
        } catch (error) {
            return new Intl.NumberFormat('en', formatOptions).format(amount);
        }
    }
    
    // Get all available languages with display names
    getAvailableLanguages() {
        return this.supportedLanguages.map(lang => ({
            code: lang,
            name: this.getLanguageDisplayName(lang),
            isActive: lang === this.currentLanguage
        }));
    }
    
    // Add new language support (for future expansion)
    addLanguage(langCode, translations) {
        if (!this.supportedLanguages.includes(langCode)) {
            this.supportedLanguages.push(langCode);
            this.translations[langCode] = translations;
        }
    }
    
    // Export translations for debugging or backup
    exportTranslations() {
        return JSON.stringify(this.translations, null, 2);
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
