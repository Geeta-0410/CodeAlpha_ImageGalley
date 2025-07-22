// Gallery functionality
class ImageGallery {
    constructor() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImg = document.getElementById('lightbox-img');
        this.lightboxTitle = document.getElementById('lightbox-title');
        this.lightboxDescription = document.getElementById('lightbox-description');
        this.closeBtn = document.querySelector('.close');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        this.currentImageIndex = 0;
        this.visibleImages = Array.from(this.galleryItems);
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
    }
    
    setupEventListeners() {
        // Filter functionality
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterImages(e.target.dataset.filter));
        });
        
        // Gallery item clicks
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => this.openLightbox(index));
        });
        
        // Lightbox navigation
        this.closeBtn.addEventListener('click', () => this.closeLightbox());
        this.prevBtn.addEventListener('click', () => this.previousImage());
        this.nextBtn.addEventListener('click', () => this.nextImage());
        
        // Click outside lightbox to close
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Touch/swipe support for mobile
        this.setupTouchNavigation();
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.style.display === 'block') {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
    }
    
    setupTouchNavigation() {
        let startX = 0;
        let endX = 0;
        
        this.lightboxImg.addEventListener('touchstart', (e) => {
            startX = e.changedTouches[0].screenX;
        });
        
        this.lightboxImg.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].screenX;
            this.handleSwipe(startX, endX);
        });
    }
    
    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.nextImage(); // Swipe left - next image
            } else {
                this.previousImage(); // Swipe right - previous image
            }
        }
    }
    
    filterImages(category) {
        // Update active filter button
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${category}"]`).classList.add('active');
        
        // Filter images with animation
        this.galleryItems.forEach((item, index) => {
            const itemCategory = item.dataset.category;
            
            if (category === 'all' || itemCategory === category) {
                // Show image
                setTimeout(() => {
                    item.classList.remove('hidden', 'fade-out');
                    item.classList.add('fade-in');
                }, index * 100);
            } else {
                // Hide image
                item.classList.add('fade-out');
                setTimeout(() => {
                    item.classList.add('hidden');
                    item.classList.remove('fade-in');
                }, 300);
            }
        });
        
        // Update visible images array
        setTimeout(() => {
            this.visibleImages = Array.from(this.galleryItems).filter(item => 
                !item.classList.contains('hidden')
            );
        }, 500);
    }
    
    openLightbox(index) {
        // Find the actual index in visible images
        const clickedItem = this.galleryItems[index];
        this.currentImageIndex = this.visibleImages.indexOf(clickedItem);
        
        if (this.currentImageIndex === -1) {
            this.currentImageIndex = 0;
        }
        
        this.showImage(this.currentImageIndex);
        this.lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Add entrance animation
        this.lightbox.style.opacity = '0';
        requestAnimationFrame(() => {
            this.lightbox.style.opacity = '1';
        });
    }
    
    closeLightbox() {
        this.lightbox.style.opacity = '0';
        setTimeout(() => {
            this.lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }, 300);
    }
    
    showImage(index) {
        if (index < 0 || index >= this.visibleImages.length) return;
        
        const currentItem = this.visibleImages[index];
        const img = currentItem.querySelector('img');
        const overlay = currentItem.querySelector('.overlay');
        
        // Add loading state
        this.lightboxImg.style.opacity = '0';
        
        // Load image
        this.lightboxImg.onload = () => {
            this.lightboxImg.style.opacity = '1';
        };
        
        this.lightboxImg.src = img.src;
        this.lightboxImg.alt = img.alt;
        this.lightboxTitle.textContent = overlay.querySelector('h3').textContent;
        this.lightboxDescription.textContent = overlay.querySelector('p').textContent;
        
        this.currentImageIndex = index;
        
        // Update navigation button states
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        this.prevBtn.style.opacity = this.currentImageIndex === 0 ? '0.5' : '1';
        this.nextBtn.style.opacity = this.currentImageIndex === this.visibleImages.length - 1 ? '0.5' : '1';
    }
    
    previousImage() {
        if (this.currentImageIndex > 0) {
            this.showImage(this.currentImageIndex - 1);
        }
    }
    
    nextImage() {
        if (this.currentImageIndex < this.visibleImages.length - 1) {
            this.showImage(this.currentImageIndex + 1);
        }
    }
}

// Smooth scrolling for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Lazy loading enhancement
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger load
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Performance optimization for animations
function setupAnimationOptimization() {
    // Reduce animations on devices with limited processing power
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new ImageGallery();
    setupLazyLoading();
    setupAnimationOptimization();
    
    // Add stagger animation to gallery items on load
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
        item.style.animationDelay = `${index * 0.1}s`;
    });
});

// Handle window resize for responsive adjustments
window.addEventListener('resize', debounce(() => {
    // Recalculate any layout-dependent functionality
    const gallery = document.querySelector('.gallery');
    if (gallery) {
        // Force reflow for better responsive behavior
        gallery.style.display = 'none';
        gallery.offsetHeight; // Trigger reflow
        gallery.style.display = 'grid';
    }
}, 250));

// Utility function for debouncing
function debounce(func, wait) {
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

// Add preloader for better UX
window.addEventListener('load', () => {
    // Remove any loading states
    document.body.classList.add('loaded');
    
    // Preload next images for better performance
    const images = document.querySelectorAll('.gallery-item img');
    images.forEach((img, index) => {
        if (index < 3) { // Preload first 3 images
            const preloadImg = new Image();
            preloadImg.src = img.src;
        }
    });
});