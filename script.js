/* ============================================
   INTERSECTION OBSERVER FOR SCROLL ANIMATIONS
   ============================================ */

// Initialize Intersection Observer for fade-in animations on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observerCallback = (entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // Stop observing once animated
            observer.unobserve(entry.target);
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

// Observe all category cards on page load
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.category-card');
    cards.forEach((card) => {
        observer.observe(card);
    });

    // Initialize filter functionality
    initializeFilters();
    initializeListingModal();
    initializeSupportChat();
    initializeMarketplaceStats();
    initializeThemeToggle();

    // Add smooth scroll behavior for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.scrollBehavior = 'auto';
    }
});

/* ============================================
   DARK THEME TOGGLE (shared across all pages)
   ============================================ */

function initializeThemeToggle() {
    const root = document.documentElement;

    function store(value) {
        try { localStorage.setItem('kidan-theme', value); } catch (e) {}
    }

    // Works for any element marked as a theme toggle on any page
    document.querySelectorAll('#theme-toggle, [data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const isDark = root.getAttribute('data-theme') === 'dark';
            if (isDark) {
                root.removeAttribute('data-theme');
                store('light');
            } else {
                root.setAttribute('data-theme', 'dark');
                store('dark');
            }
        });
    });
}

/* ============================================
   FILTER FUNCTIONALITY
   ============================================ */

function initializeFilters() {
    // Old filter button system (if exists)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allCards = document.querySelectorAll('.category-card');

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            // Update active button state
            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            // Get filter value
            const filterValue = btn.getAttribute('data-filter');

            // Animate filter transition
            allCards.forEach((card) => {
                const cardFilters = card.getAttribute('data-filter').split(' ');

                if (filterValue === 'all' || cardFilters.includes(filterValue)) {
                    card.style.opacity = '1';
                    card.style.pointerEvents = 'auto';
                    card.style.visibility = 'visible';
                } else {
                    card.style.opacity = '0.3';
                    card.style.pointerEvents = 'none';
                    card.style.visibility = 'hidden';
                }
            });
        });
    });

    // Set initial filter (show all)
    const allFilter = document.querySelector('[data-filter="all"]');
    if (allFilter) {
        allFilter.classList.add('active');
    }

    // New quality button system
    const qbtns = document.querySelectorAll('.qbtn');
    const qPages = {
        all: './index.html',
        new: './new.html',
        used: './used.html',
        sale: './sale.html'
    };

    qbtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            qbtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const qValue = btn.getAttribute('data-q');
            if (qPages[qValue]) {
                window.location.href = qPages[qValue];
            }
        });
    });
}

/* ============================================
   CARD INTERACTION FEEDBACK
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.category-card');

    cards.forEach((card) => {
        // Touch feedback for mobile
        card.addEventListener('touchstart', () => {
            card.style.opacity = '0.8';
        });

        card.addEventListener('touchend', () => {
            card.style.opacity = '1';
        });

        // Optional: Add click feedback
        card.addEventListener('click', (e) => {
            // Placeholder - no routing needed as per requirements
            console.log('Category clicked:', card.querySelector('.brand-name').textContent);
        });
    });
});

/* ============================================
   FILTER BUTTON KEYBOARD NAVIGATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach((btn, index) => {
        btn.addEventListener('keydown', (e) => {
            let targetBtn = null;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                targetBtn = filterBtns[index - 1] || filterBtns[filterBtns.length - 1];
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                targetBtn = filterBtns[index + 1] || filterBtns[0];
            }

            if (targetBtn) {
                targetBtn.focus();
                targetBtn.click();
            }
        });
    });
});

/* ============================================
   SMOOTH SCROLL BEHAVIOR
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    // Respect changes to motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        if (e.matches) {
            document.documentElement.style.scrollBehavior = 'auto';
        } else {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    });
});

/* ============================================
   CATEGORY CARD LOADING ANIMATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.category-card');

    // Stagger card animations on initial load
    cards.forEach((card, index) => {
        const delay = index * 50;
        card.style.animationDelay = delay + 'ms';
    });
});

/* ============================================
   CTA LINK INTERACTIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const ctaLink = document.querySelector('.cta-link');

    if (ctaLink) {
        ctaLink.addEventListener('mouseenter', () => {
            const arrow = ctaLink.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = 'translateX(6px)';
            }
        });

        ctaLink.addEventListener('mouseleave', () => {
            const arrow = ctaLink.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = 'translateX(0)';
            }
        });

        // Touch support
        ctaLink.addEventListener('touchstart', () => {
            ctaLink.style.opacity = '0.9';
        });

        ctaLink.addEventListener('touchend', () => {
            ctaLink.style.opacity = '1';
        });
    }
});

/* ============================================
   STICKY NAVIGATION SHADOW ON SCROLL
   ============================================ */

window.addEventListener('scroll', () => {
    const nav = document.querySelector('.filter-bar');
    if (nav) {
        if (window.scrollY > 10) {
            nav.style.boxShadow = '0 4px 24px rgba(139, 92, 246, 0.1)';
        } else {
            nav.style.boxShadow = 'none';
        }
    }
});

/* ============================================
   PRICE RANGE SLIDER FUNCTIONALITY
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const minSlider = document.getElementById('price-min');
    const maxSlider = document.getElementById('price-max');
    const minLabel = document.getElementById('price-min-label');
    const maxLabel = document.getElementById('price-max-label');
    const rangeFill = document.getElementById('range-fill');

    function updateRange() {
        let minVal = parseInt(minSlider.value);
        let maxVal = parseInt(maxSlider.value);

        // Constraint: max must be at least 500 more than min
        if (minVal > maxVal - 500) {
            minSlider.value = maxVal - 500;
            minVal = maxVal - 500;
        }

        if (maxVal < minVal + 500) {
            maxSlider.value = minVal + 500;
            maxVal = minVal + 500;
        }

        // Update labels with USD formatting
        minLabel.textContent = '$' + minVal.toLocaleString('en-US');
        maxLabel.textContent = '$' + maxVal.toLocaleString('en-US');

        // Update range fill visual
        const minPercent = (minVal / 15000) * 100;
        const maxPercent = (maxVal / 15000) * 100;
        rangeFill.style.left = minPercent + '%';
        rangeFill.style.right = (100 - maxPercent) + '%';
    }

    if (minSlider && maxSlider) {
        minSlider.addEventListener('input', updateRange);
        maxSlider.addEventListener('input', updateRange);

        // Set initial range fill
        updateRange();
    }
});

/* ============================================
   SORT BUTTON FUNCTIONALITY
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const sortBtns = document.querySelectorAll('.sort-btn');

    sortBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            sortBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            const sortType = btn.id;
            console.log('Sort type:', sortType);
        });
    });
});

/* ============================================
   PERFORMANCE OPTIMIZATIONS
   ============================================ */

// Debounce function for resize events
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

// Handle window resize with debounce
window.addEventListener('resize', debounce(() => {
    // Add resize handling if needed
}, 250));

/* ============================================
   ACCESSIBILITY ENHANCEMENTS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Ensure all interactive elements are accessible
    const interactiveElements = document.querySelectorAll('.filter-btn, .category-card, .cta-link');

    interactiveElements.forEach((el) => {
        // Add tabindex if not already present
        if (!el.hasAttribute('tabindex')) {
            el.setAttribute('tabindex', '0');
        }

        // Handle Enter key for elements that aren't native buttons
        if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    el.click();
                }
            });
        }
    });
});

/* ============================================
   PAGE ANALYTICS (Optional)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Track category interactions (no external analytics)
    const cards = document.querySelectorAll('.category-card');

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            const brandName = card.querySelector('.brand-name')?.textContent;
            const itemCount = card.querySelector('.item-badge')?.textContent;

            // Log interaction for debugging
            if (window.location.hostname === 'localhost') {
                console.log({
                    event: 'category_clicked',
                    brand: brandName,
                    items: itemCount,
                    timestamp: new Date().toISOString()
                });
            }
        });
    });
});

/* ============================================
   FILTER BAR STICKY BEHAVIOR
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const filterBar = document.querySelector('.filter-bar');

    if (filterBar) {
        // Add shadow when scrolled
        window.addEventListener('scroll', debounce(() => {
            if (window.scrollY > 0) {
                filterBar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            } else {
                filterBar.style.boxShadow = 'none';
            }
        }, 50));
    }
});

/* ============================================
   LISTING MODAL
   ============================================ */

function initializeListingModal() {
    const modal = document.getElementById('listingModal');
    if (!modal) return;

    const form = document.getElementById('listingForm');
    const photoInput = form?.querySelector('input[name="photos"]');
    const photoPreview = modal.querySelector('[data-photo-preview]');
    const photoCount = modal.querySelector('[data-photo-count]');
    const openers = document.querySelectorAll('[data-open-listing]');
    const closers = document.querySelectorAll('[data-close-listing]');

    function openModal(event) {
        if (event) event.preventDefault();
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        modal.querySelector('input, select, textarea')?.focus();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    openers.forEach((opener) => opener.addEventListener('click', openModal));
    closers.forEach((closer) => closer.addEventListener('click', closeModal));

    photoInput?.addEventListener('change', () => {
        renderPhotoPreviews(photoInput.files, photoPreview);
        updatePhotoCount(photoInput.files, photoCount);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const title = formData.get('title') || 'Your item';
        const photoFiles = Array.from(photoInput?.files || []).slice(0, 6);
        const photos = await readFilesAsDataUrls(photoFiles);
        const product = saveListingToProduct(formData, photos, photoFiles);
        saveListingToStats({
            title: String(title),
            brand: String(formData.get('brand') || '').trim()
        });
        form.reset();
        renderPhotoPreviews([], photoPreview);
        updatePhotoCount([], photoCount);
        closeModal();
        showGlobalToast(`Listing "${product.title}" was created.`);
    });
}

function updatePhotoCount(files, countRoot) {
    if (!countRoot) return;

    const count = Array.from(files || []).length;
    countRoot.textContent = count === 1 ? '1 photo selected' : `${count} photos selected`;
    if (count === 0) countRoot.textContent = 'No photos selected';
}

function renderPhotoPreviews(files, previewRoot) {
    if (!previewRoot) return;

    previewRoot.innerHTML = '';
    const selectedFiles = Array.from(files || []);

    if (!selectedFiles.length) {
        const empty = document.createElement('div');
        empty.className = 'photo-preview-empty';
        empty.textContent = 'Selected photos will appear here';
        previewRoot.appendChild(empty);
        return;
    }

    selectedFiles.forEach((file) => {
        const card = document.createElement('div');
        card.className = 'photo-preview-card';

        const image = document.createElement('img');
        image.alt = file.name || 'Listing photo preview';
        image.src = URL.createObjectURL(file);
        image.addEventListener('load', () => URL.revokeObjectURL(image.src), { once: true });

        card.appendChild(image);
        previewRoot.appendChild(card);
    });
}

function getMarketplaceStats() {
    const fallback = { items: 0, sales: 0, brands: 0, brandNames: [] };

    try {
        return { ...fallback, ...JSON.parse(localStorage.getItem('kidanMarketplaceStats') || '{}') };
    } catch (error) {
        return fallback;
    }
}

function setMarketplaceStats(stats) {
    localStorage.setItem('kidanMarketplaceStats', JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('kidan:stats-updated', { detail: stats }));
}

function initializeMarketplaceStats() {
    updateMarketplaceStatsUI(getMarketplaceStats());

    window.addEventListener('kidan:stats-updated', (event) => {
        updateMarketplaceStatsUI(event.detail || getMarketplaceStats());
    });

    window.addEventListener('storage', (event) => {
        if (event.key === 'kidanMarketplaceStats') {
            updateMarketplaceStatsUI(getMarketplaceStats());
        }
    });
}

function updateMarketplaceStatsUI(stats) {
    const products = getAllProducts();
    const brands = new Set(products.map((product) => canonicalBrandName(product.brand)));
    document.querySelectorAll('[data-stat="items"]').forEach((el) => {
        el.textContent = String(products.length);
    });
    document.querySelectorAll('[data-stat="sales"]').forEach((el) => {
        el.textContent = String(stats.sales || 0);
    });
    document.querySelectorAll('[data-stat="brands"]').forEach((el) => {
        el.textContent = String(brands.size);
    });
}

function readFilesAsDataUrls(files) {
    return Promise.all(Array.from(files || []).slice(0, 6).map((file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    })).then((items) => items.filter(Boolean));
}

function saveListingToStats(listing) {
    const stats = getMarketplaceStats();
    const brandNames = Array.isArray(stats.brandNames) ? stats.brandNames : [];
    const normalizedBrand = listing.brand.toLowerCase();

    if (normalizedBrand && !brandNames.includes(normalizedBrand)) {
        brandNames.push(normalizedBrand);
    }

    setMarketplaceStats({
        items: (Number(stats.items) || 0) + 1,
        sales: Number(stats.sales) || 0,
        brands: brandNames.length,
        brandNames
    });
}

function showGlobalToast(message) {
    const profileToast = document.getElementById('toast');
    const profileMsg = document.getElementById('toast-msg');

    if (profileToast && profileMsg) {
        profileMsg.textContent = message;
        profileToast.classList.add('show');
        setTimeout(() => profileToast.classList.remove('show'), 2800);
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'global-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 250);
    }, 2800);
}

/* ============================================
   SUPPORT CHAT
   ============================================ */

function initializeSupportChat() {
    const widget = document.getElementById('supportWidget');
    if (!widget) return;

    const panel = widget.querySelector('.support-panel');
    const openers = document.querySelectorAll('[data-open-support]');
    const closeBtn = widget.querySelector('[data-close-support]');
    const form = document.getElementById('supportForm');
    const input = document.getElementById('supportInput');
    const messages = document.getElementById('supportMessages');
    let refreshTimer = null;

    function scrollSupportToBottom() {
        if (messages) messages.scrollTop = messages.scrollHeight;
    }

    function renderSupportMessages(items) {
        if (!messages) return;

        const renderedItems = items.length ? items : [{
            sender: 'agent',
            body: 'Hi! How can we help with buying or selling today?',
            created_at: new Date().toISOString()
        }];

        messages.innerHTML = renderedItems.map((message) => {
            const isUser = message.sender === 'user';
            const className = isUser ? 'support-user' : 'support-agent';
            return `<p class="support-message ${className}">${escapeHtml(message.body)}</p>`;
        }).join('');
        scrollSupportToBottom();
    }

    async function refreshSupportMessages() {
        const remoteMessages = await fetchSupportMessages();
        renderSupportMessages(remoteMessages.length ? remoteMessages : getLocalSupportMessages());
    }

    function openChat(event) {
        if (event) event.preventDefault();
        widget.classList.add('is-open');
        panel?.setAttribute('aria-hidden', 'false');
        input?.focus();
        refreshSupportMessages();
        clearInterval(refreshTimer);
        refreshTimer = setInterval(refreshSupportMessages, 5000);
    }

    function closeChat() {
        widget.classList.remove('is-open');
        panel?.setAttribute('aria-hidden', 'true');
        clearInterval(refreshTimer);
        refreshTimer = null;
    }

    openers.forEach((opener) => opener.addEventListener('click', openChat));
    closeBtn?.addEventListener('click', closeChat);

    renderSupportMessages(getLocalSupportMessages());

    form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        const localMessages = [...getLocalSupportMessages(), {
            sender: 'user',
            body: text,
            created_at: new Date().toISOString()
        }];
        setLocalSupportMessages(localMessages);
        renderSupportMessages(localMessages);
        await sendSupportMessage(text);
        await refreshSupportMessages();
    });
}

function getLocalSupportMessages() {
    try {
        return JSON.parse(localStorage.getItem('kidanSupportMessages') || '[]');
    } catch (error) {
        return [];
    }
}

function setLocalSupportMessages(messages) {
    localStorage.setItem('kidanSupportMessages', JSON.stringify(messages));
}

async function getOrCreateSupportThread() {
    const client = await getSupabaseClient();
    if (!client) return null;

    const sessionId = getKidanSessionId();

    try {
        const existing = await client
            .from('support_threads')
            .select('id,session_id,status,customer_label,created_at,updated_at')
            .eq('session_id', sessionId)
            .maybeSingle();

        if (existing.data?.id) return existing.data;

        const created = await client
            .from('support_threads')
            .insert({
                session_id: sessionId,
                customer_label: `Visitor ${sessionId.slice(0, 8)}`
            })
            .select('id,session_id,status,customer_label,created_at,updated_at')
            .single();

        return created.data || null;
    } catch (error) {
        return null;
    }
}

async function fetchSupportMessages() {
    const client = await getSupabaseClient();
    if (!client) return [];

    const thread = await getOrCreateSupportThread();
    if (!thread?.id) return [];

    try {
        const { data, error } = await client
            .from('support_messages')
            .select('id,sender,body,created_at')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: true });

        if (error) return [];
        if (data?.length) setLocalSupportMessages(data);
        return data || [];
    } catch (error) {
        return [];
    }
}

async function sendSupportMessage(text) {
    const client = await getSupabaseClient();
    if (!client || !text.trim()) return false;

    const thread = await getOrCreateSupportThread();
    if (!thread?.id) return false;

    try {
        const createdAt = new Date().toISOString();
        const { error } = await client
            .from('support_messages')
            .insert({
                thread_id: thread.id,
                sender: 'user',
                body: text.trim(),
                created_at: createdAt
            });

        if (error) return false;

        await client
            .from('support_threads')
            .update({ status: 'open', updated_at: createdAt })
            .eq('id', thread.id);

        return true;
    } catch (error) {
        return false;
    }
}

/* ============================================
   BRAND PAGES
   ============================================ */

const kidanBrandPages = {
    'Nike': 'brand-nike.html',
    'Adidas': 'brand-adidas.html',
    'Supreme': 'brand-supreme.html',
    'Stone Island': 'brand-stone-island.html',
    'The North Face': 'brand-the-north-face.html',
    'Stüssy': 'brand-stussy.html',
    'Stussy': 'brand-stussy.html',
    'Carhartt': 'brand-carhartt.html',
    'Puma': 'brand-puma.html',
    'New Balance': 'brand-new-balance.html',
    'Reebok': 'brand-reebok.html',
    'Vans': 'brand-vans.html',
    'Converse': 'brand-converse.html',
    "Levi's": 'brand-levis.html',
    'Champion': 'brand-champion.html',
    'Tommy Hilfiger': 'brand-tommy-hilfiger.html',
    'Vintage Finds': 'brand-vintage-finds.html',
    'Thrifted Fashion': 'brand-thrifted-fashion.html',
    'Designer Reps': 'brand-designer-reps.html',
    'Handmade Items': 'brand-handmade-items.html',
    'Unbranded Basics': 'brand-unbranded-basics.html',
    'Local Brands': 'brand-local-brands.html'
};

const kidanSeedProducts = [
    { id: 'nike-air-max-90', title: 'Air Max 90 White/Red', brand: 'Nike', type: 'Sneakers', color: 'White', condition: 'Used', price: 52, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80', tag: 'used', seller: 'Kidan Seller', description: 'Clean pair with normal signs of wear. Ships from Prague within two business days.' },
    { id: 'supreme-box-logo-hoodie', title: 'Box Logo Hoodie Red', brand: 'Supreme', type: 'Hoodies', color: 'Red', condition: 'New', price: 195, image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&q=80', tag: 'new', seller: 'Street Vault', description: 'New hoodie, heavyweight cotton feel, no flaws. Stored folded and ready to ship.' },
    { id: 'tnf-nuptse-black', title: 'Nuptse Jacket Black', brand: 'The North Face', type: 'Jackets', color: 'Black', condition: 'New', price: 169, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80', tag: 'new', seller: 'Outerwear Hub', description: 'Warm puffer jacket with clean finish. Great winter layer and easy everyday fit.' },
    { id: 'vans-old-skool', title: 'Old Skool Black/White', brand: 'Vans', type: 'Sneakers', color: 'Black', condition: 'Used', price: 39, image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=700&q=80', tag: 'used', seller: 'Skate Corner', description: 'Classic pair, worn but solid. Sole and upper are intact.' },
    { id: 'carhartt-detroit-jacket', title: 'Detroit Jacket Brown', brand: 'Carhartt', type: 'Jackets', color: 'Brown', condition: 'Used', price: 95, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&q=80', tag: 'sale', seller: 'Workwear Finds', description: 'Vintage workwear jacket with structured fit and visible character.' },
    { id: 'adidas-ultraboost', title: 'Ultraboost 22 Black', brand: 'Adidas', type: 'Sneakers', color: 'Black', condition: 'Used', price: 121, image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=700&q=80', tag: 'used', seller: 'Runner Market', description: 'Comfortable running shoes, light usage, freshly cleaned.' },
    { id: 'stussy-graphic-tee', title: 'Graphic T-Shirt Cream', brand: 'Stussy', type: 'T-Shirts', color: 'Beige', condition: 'New', price: 44, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80', tag: 'new', seller: 'Logo Room', description: 'Soft tee with relaxed fit. New without visible flaws.' },
    { id: 'puma-suede-blue', title: 'Suede Classic Blue', brand: 'Puma', type: 'Sneakers', color: 'Blue', condition: 'Sale', price: 61, image: 'https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=700&q=80', tag: 'sale', seller: 'Sneaker Desk', description: 'Discounted pair in good shape, suede upper with classic silhouette.' },
    { id: 'stone-island-overshirt', title: 'Nylon Overshirt Navy', brand: 'Stone Island', type: 'Shirts', color: 'Navy', condition: 'Used', price: 148, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&q=80', tag: 'used', seller: 'Archive Studio', description: 'Light overshirt, clean hardware, comfortable layering piece.' },
    { id: 'new-balance-550', title: '550 Green/White', brand: 'New Balance', type: 'Sneakers', color: 'Green', condition: 'New', price: 88, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700&q=80', tag: 'new', seller: 'Court Supply', description: 'Fresh court-inspired sneakers with crisp color blocking.' },
    { id: 'levis-501', title: '501 Straight Denim', brand: "Levi's", type: 'Jeans', color: 'Blue', condition: 'Used', price: 57, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&q=80', tag: 'used', seller: 'Denim Table', description: 'Straight denim with classic fit. Washed and ready to wear.' },
    { id: 'champion-sweater', title: 'Reverse Weave Sweater', brand: 'Champion', type: 'Sweaters', color: 'Gray', condition: 'Sale', price: 49, image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=700&q=80', tag: 'sale', seller: 'Cozy Rack', description: 'Heavyweight sweater with a comfortable boxy fit.' }
];

const KIDAN_SUPABASE_URL = 'https://bissogumzvqklxttaqne.supabase.co';
const KIDAN_SUPABASE_KEY = 'sb_publishable_WnWEryXFZUjKy45NjK6TBA_Vvc07rKT';
const KIDAN_SUPABASE_SCRIPT = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
let kidanSupabaseClient = null;
let kidanSupabasePromise = null;
let kidanCurrentBrandName = '';
let kidanCurrentCollectionState = null;
let kidanCurrentProductId = '';

document.addEventListener('DOMContentLoaded', () => {
    wireBrandCardLinks();
    renderHomeProducts();
    initializeHeaderSearch();
    initializeWishlistLinks();
    updateWishlistBadge();
    updateProductStatsUI();
    renderBrandPage();
    renderCollectionPage();
    renderWishlistPage();
    renderProductDetailPage();
    renderChatsPage();
    renderAdminSupportPage();
    initializeQualityNavigation();
    initializeSupabaseBackend();
});

function getBrandEntries() {
    const seen = new Set();
    return Object.entries(kidanBrandPages)
        .filter(([name]) => {
            const normalized = normalizeText(name);
            if (seen.has(normalized)) return false;
            seen.add(normalized);
            return true;
        })
        .map(([name, page]) => ({ name, page }));
}

function getUserProducts() {
    try {
        return JSON.parse(localStorage.getItem('kidanProducts') || '[]');
    } catch (error) {
        return [];
    }
}

function setUserProducts(products) {
    localStorage.setItem('kidanProducts', JSON.stringify(products));
}

function getRemoteProducts() {
    try {
        return JSON.parse(localStorage.getItem('kidanRemoteProducts') || '[]');
    } catch (error) {
        return [];
    }
}

function setRemoteProducts(products) {
    localStorage.setItem('kidanRemoteProducts', JSON.stringify(products));
}

function getAllProducts() {
    const products = [...kidanSeedProducts, ...getRemoteProducts(), ...getUserProducts()];
    const seen = new Set();
    return products.filter((product) => {
        if (!product?.id || seen.has(product.id)) return false;
        seen.add(product.id);
        return true;
    });
}

function getProductById(id) {
    return getAllProducts().find((product) => product.id === id);
}

function getKidanSessionId() {
    let id = localStorage.getItem('kidanSessionId');
    if (!id) {
        id = window.crypto?.randomUUID
            ? window.crypto.randomUUID()
            : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        localStorage.setItem('kidanSessionId', id);
    }
    return id;
}

function isSupabaseUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function loadExternalScript(src) {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
        return existing.dataset.loaded === 'true'
            ? Promise.resolve()
            : new Promise((resolve, reject) => {
                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
            });
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.addEventListener('load', () => {
            script.dataset.loaded = 'true';
            resolve();
        }, { once: true });
        script.addEventListener('error', reject, { once: true });
        document.head.appendChild(script);
    });
}

async function getSupabaseClient() {
    if (kidanSupabaseClient) return kidanSupabaseClient;
    if (!kidanSupabasePromise) {
        kidanSupabasePromise = loadExternalScript(KIDAN_SUPABASE_SCRIPT)
            .then(() => {
                if (!window.supabase?.createClient) return null;
                kidanSupabaseClient = window.supabase.createClient(KIDAN_SUPABASE_URL, KIDAN_SUPABASE_KEY);
                return kidanSupabaseClient;
            })
            .catch(() => null);
    }
    return kidanSupabasePromise;
}

function normalizeRemoteListing(row) {
    const sortedPhotos = [...(row.listing_photos || [])]
        .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
        .map((photo) => photo.image_url)
        .filter(Boolean);
    const image = sortedPhotos[0] || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80';

    return {
        id: row.id,
        title: row.title || 'Marketplace listing',
        brand: canonicalBrandName(row.brand || 'Local Brands'),
        type: row.category || 'Accessories',
        color: row.color || 'Black',
        condition: row.condition || 'Used',
        price: Number(row.price || 0),
        image,
        photos: sortedPhotos.length ? sortedPhotos : [image],
        tag: row.tag || normalizeText(row.condition || 'used') || 'used',
        seller: row.seller_name || 'Seller',
        description: row.description || 'Seller did not add a description yet.',
        remote: true,
        createdAt: row.created_at
    };
}

async function fetchRemoteProducts() {
    const client = await getSupabaseClient();
    if (!client) return [];

    let response;
    try {
        response = await client
            .from('listings')
            .select('id,title,brand,category,color,condition,price,description,seller_name,status,tag,created_at,listing_photos(image_url,sort_order)')
            .eq('status', 'active')
            .order('created_at', { ascending: false });
    } catch (error) {
        return [];
    }

    const { data, error } = response;
    if (error) return [];

    const products = (data || []).map(normalizeRemoteListing);
    setRemoteProducts(products);
    return products;
}

async function uploadListingPhotoFiles(client, listingId, files = []) {
    const uploadedUrls = [];
    const safeFiles = Array.from(files || []).slice(0, 6);

    for (const [index, file] of safeFiles.entries()) {
        if (!file?.type?.startsWith('image/')) continue;
        const extension = (file.name || 'photo.jpg').split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${listingId}/${Date.now()}-${index}.${extension}`;
        const { error } = await client.storage
            .from('listing-photos')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (error) continue;

        const { data } = client.storage
            .from('listing-photos')
            .getPublicUrl(path);

        if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
}

async function createRemoteListing(product, photoFiles = []) {
    const client = await getSupabaseClient();
    if (!client) return null;

    let response;
    try {
        response = await client
            .from('listings')
            .insert({
                title: product.title,
                brand: product.brand,
                category: product.type,
                color: product.color,
                condition: product.condition,
                price: product.price,
                description: product.description,
                seller_name: product.seller || 'Seller',
                tag: product.tag || normalizeText(product.condition || 'used')
            })
            .select('id,title,brand,category,color,condition,price,description,seller_name,status,tag,created_at')
            .single();
    } catch (error) {
        return null;
    }

    const { data, error } = response;
    if (error || !data) return null;

    const storagePhotos = await uploadListingPhotoFiles(client, data.id, photoFiles);
    const fallbackPhotos = (Array.isArray(product.photos) && product.photos.length ? product.photos : [product.image]).filter(Boolean);
    const photos = storagePhotos.length ? storagePhotos : fallbackPhotos;
    if (photos.length) {
        try {
            await client.from('listing_photos').insert(photos.slice(0, 6).map((imageUrl, index) => ({
                listing_id: data.id,
                image_url: imageUrl,
                sort_order: index
            })));
        } catch (error) {}
    }

    return normalizeRemoteListing({ ...data, listing_photos: photos.map((image_url, sort_order) => ({ image_url, sort_order })) });
}

function removeLocalProduct(productId) {
    setUserProducts(getUserProducts().filter((product) => product.id !== productId));
}

function refreshDynamicProductViews() {
    renderHomeProducts();
    if (kidanCurrentBrandName && document.getElementById('brand-products')) {
        renderProductGrid(
            document.getElementById('brand-products'),
            filterProducts({ brand: kidanCurrentBrandName }),
            `No ${kidanCurrentBrandName} items match these filters yet.`
        );
    }
    if (kidanCurrentCollectionState && document.getElementById('collection-products')) {
        const { active, query } = kidanCurrentCollectionState;
        renderProductGrid(
            document.getElementById('collection-products'),
            filterProducts({ tab: active === 'all' ? null : active, query }),
            'No products in this section yet.'
        );
    }
    if (window.location.pathname.endsWith('/wishlist.html') && !document.getElementById('wishlist-products') && getWishlistItems().length) {
        renderWishlistPage();
    } else if (document.getElementById('wishlist-products')) {
        renderProductGrid(document.getElementById('wishlist-products'), getWishlistItems(), 'Your wishlist is empty.');
    }
    if (kidanCurrentProductId && getProductById(kidanCurrentProductId) && !document.querySelector('.product-detail')) {
        renderProductDetailPage();
    }
    updateProductStatsUI();
    updateMarketplaceStatsUI(getMarketplaceStats());
    updateWishlistBadge();
}

async function initializeSupabaseBackend() {
    getKidanSessionId();
    const products = await fetchRemoteProducts();
    await fetchRemoteWishlist();
    await fetchRemoteChats();
    if (products.length || getRemoteChats().length) refreshDynamicProductViews();
    if (window.location.pathname.endsWith('/chats.html')) renderChatsPage();
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function canonicalBrandName(brand) {
    const lower = normalizeText(brand);
    const found = Object.keys(kidanBrandPages).find((name) => normalizeText(name) === lower);
    return found || brand;
}

function formatPrice(value) {
    return '$' + Number(value || 0).toLocaleString('en-US');
}

function productMatchesTab(product, tab) {
    if (!tab || tab === 'all') return true;
    return normalizeText(product.tag) === tab || normalizeText(product.condition) === tab;
}

function filterProducts(options = {}) {
    return getAllProducts().filter((product) => {
        if (options.brand && normalizeText(canonicalBrandName(product.brand)) !== normalizeText(options.brand)) return false;
        if (options.tab && !productMatchesTab(product, options.tab)) return false;
        if (options.query) {
            const haystack = `${product.title} ${product.brand} ${product.type} ${product.color} ${product.condition}`.toLowerCase();
            if (!haystack.includes(normalizeText(options.query))) return false;
        }
        if (options.type && options.type !== 'All' && product.type !== options.type) return false;
        if (options.color && options.color !== 'Any' && product.color !== options.color) return false;
        if (options.condition && options.condition !== 'Any' && product.condition !== options.condition) return false;
        if (options.min !== undefined && Number(product.price) < Number(options.min)) return false;
        if (options.max !== undefined && Number(product.price) > Number(options.max)) return false;
        return true;
    });
}

function renderProductCard(product) {
    const wishlistIds = getWishlistIds();
    const isLiked = wishlistIds.includes(product.id);
    const brandPage = kidanBrandPages[canonicalBrandName(product.brand)] || 'view-all.html';
    const productUrl = './product.html?id=' + encodeURIComponent(product.id);

    return `
      <article class="product-card" data-product-id="${escapeHtml(product.id)}">
        <a class="product-image-link" href="${productUrl}" aria-label="${escapeHtml(product.title)}">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy">
          <span class="product-condition">${escapeHtml(product.condition)}</span>
        </a>
        <div class="product-info">
          <a class="product-brand" href="./${brandPage}">${escapeHtml(canonicalBrandName(product.brand))}</a>
          <h3><a href="${productUrl}">${escapeHtml(product.title)}</a></h3>
          <div class="product-meta">
            <span>${escapeHtml(product.type)}</span>
            <span>${escapeHtml(product.color)}</span>
          </div>
          <div class="product-bottom">
            <strong>${formatPrice(product.price)}</strong>
            <button type="button" class="item-like${isLiked ? ' liked' : ''}" data-product-id="${escapeHtml(product.id)}" aria-label="Add to wishlist">${isLiked ? '♥' : '♡'}</button>
          </div>
        </div>
      </article>
    `;
}

function renderProductGrid(root, products, emptyMessage = 'No items match these filters yet.') {
    if (!root) return;

    if (!products.length) {
        root.innerHTML = `
          <div class="empty-state">
            <h2>No items found</h2>
            <p>${escapeHtml(emptyMessage)}</p>
            <a class="view-all-btn" href="./index.html">Back to shop</a>
          </div>
        `;
        return;
    }

    root.innerHTML = products.map(renderProductCard).join('');
    initializeWishlistLinks(root);
}

function renderHomeProducts() {
    const grid = document.querySelector('.featured-grid');
    if (!grid) return;
    renderProductGrid(grid, getAllProducts().slice(0, 6), 'Create a listing or browse another section.');
}

function updateProductStatsUI() {
    const products = getAllProducts();
    const brands = new Set(products.map((product) => canonicalBrandName(product.brand)));
    document.querySelectorAll('[data-stat="items"]').forEach((el) => { el.textContent = String(products.length); });
    document.querySelectorAll('[data-stat="brands"]').forEach((el) => { el.textContent = String(brands.size); });

    document.querySelectorAll('.brand-card-link').forEach((link) => {
        const brand = link.querySelector('.brand-name')?.textContent?.trim();
        const badge = link.querySelector('.item-badge');
        if (!brand || !badge) return;
        const count = products.filter((product) => normalizeText(canonicalBrandName(product.brand)) === normalizeText(brand)).length;
        badge.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    });
}

function wireBrandCardLinks() {
    document.querySelectorAll('.brand-card-link').forEach((link) => {
        const brandName = link.querySelector('.brand-name')?.textContent?.trim();
        if (brandName && kidanBrandPages[brandName]) {
            link.href = './' + kidanBrandPages[brandName];
        }
    });
}

function initializeHeaderSearch() {
    const input = document.querySelector('.search-input');
    const submit = document.querySelector('.search-submit-btn');
    const suggestions = document.getElementById('search-suggestions');
    if (!input || !suggestions) return;

    const brands = getBrandEntries();

    function findExact(value) {
        const normalized = value.trim().toLowerCase();
        return brands.find((brand) => brand.name.toLowerCase() === normalized);
    }

    function goToBrand(brand) {
        if (!brand) return;
        window.location.href = './' + brand.page;
    }

    function goToSearch() {
        const query = input.value.trim();
        if (!query) return;
        const exact = findExact(query);
        if (exact) goToBrand(exact);
        else window.location.href = './view-all.html?q=' + encodeURIComponent(query);
    }

    function renderSuggestions(value) {
        const query = value.trim().toLowerCase();
        suggestions.innerHTML = '';
        suggestions.classList.remove('is-open');
        if (!query) return;

        const brandMatches = brands
            .filter((brand) => brand.name.toLowerCase().includes(query))
            .slice(0, 4)
            .map((brand) => ({ label: brand.name, meta: 'Brand', action: () => goToBrand(brand) }));

        const productMatches = getAllProducts()
            .filter((product) => `${product.title} ${product.brand} ${product.type}`.toLowerCase().includes(query))
            .slice(0, 4)
            .map((product) => ({
                label: product.title,
                meta: `${canonicalBrandName(product.brand)} · ${formatPrice(product.price)}`,
                action: () => { window.location.href = './view-all.html?q=' + encodeURIComponent(product.title); }
            }));

        const matches = [...brandMatches, ...productMatches].slice(0, 6);
        if (!matches.length) return;

        matches.forEach((match) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'search-suggestion';
            button.setAttribute('role', 'option');
            button.innerHTML = `${escapeHtml(match.label)} <span>${escapeHtml(match.meta)}</span>`;
            button.addEventListener('click', match.action);
            suggestions.appendChild(button);
        });

        suggestions.classList.add('is-open');
    }

    let exactTimer = null;
    input.addEventListener('input', () => {
        clearTimeout(exactTimer);
        renderSuggestions(input.value);

        const exact = findExact(input.value);
        if (exact) {
            exactTimer = setTimeout(() => goToBrand(exact), 450);
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            goToSearch();
        }

        if (event.key === 'Escape') {
            suggestions.classList.remove('is-open');
        }
    });

    submit?.addEventListener('click', () => {
        goToSearch();
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search-wrap')) {
            suggestions.classList.remove('is-open');
        }
    });
}

function initializeQualityNavigation() {
    const qPages = {
        all: './index.html',
        new: './new.html',
        used: './used.html',
        sale: './sale.html'
    };

    document.querySelectorAll('.qbtn').forEach((button) => {
        button.addEventListener('click', () => {
            const target = qPages[button.getAttribute('data-q')];
            if (target) window.location.href = target;
        });
    });
}

function initializeWishlistLinks(root = document) {
    root.querySelectorAll('.nav-icon-btn[aria-label="Wishlist"]').forEach((el) => {
        if (el.tagName === 'A') return;
        el.addEventListener('click', () => {
            window.location.href = './wishlist.html';
        });
    });

    root.querySelectorAll('.item-like').forEach((button, index) => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-product-id') || `item-${index + 1}`;
            toggleWishlistItem(productId);
            button.classList.toggle('liked', getWishlistIds().includes(productId));
            button.textContent = getWishlistIds().includes(productId) ? '♥' : '♡';
            updateWishlistBadge();
        });
    });
}

function getWishlistIds() {
    try {
        return JSON.parse(localStorage.getItem('kidanWishlist') || '[]');
    } catch (error) {
        return [];
    }
}

function setWishlistIds(ids) {
    localStorage.setItem('kidanWishlist', JSON.stringify([...new Set(ids)]));
}

async function fetchRemoteWishlist() {
    const client = await getSupabaseClient();
    if (!client) return [];

    let response;
    try {
        response = await client
            .from('wishlist_items')
            .select('listing_id')
            .eq('session_id', getKidanSessionId());
    } catch (error) {
        return [];
    }

    if (response.error) return [];
    const ids = (response.data || []).map((item) => item.listing_id).filter(Boolean);
    setWishlistIds([...getWishlistIds(), ...ids]);
    return ids;
}

async function saveRemoteWishlistItem(id, liked) {
    if (!isSupabaseUuid(id)) return;

    const client = await getSupabaseClient();
    if (!client) return;

    try {
        if (liked) {
            await client
                .from('wishlist_items')
                .upsert({ session_id: getKidanSessionId(), listing_id: id }, { onConflict: 'session_id,listing_id' });
        } else {
            await client
                .from('wishlist_items')
                .delete()
                .eq('session_id', getKidanSessionId())
                .eq('listing_id', id);
        }
    } catch (error) {}
}

function toggleWishlistItem(id) {
    const items = getWishlistIds();
    const next = items.includes(id) ? items.filter((itemId) => itemId !== id) : [...items, id];
    setWishlistIds(next);
    saveRemoteWishlistItem(id, next.includes(id));
}

function getWishlistItems() {
    return getWishlistIds()
        .map(getProductById)
        .filter(Boolean);
}

function saveProductFromListing(listing) {
    const products = getUserProducts();
    const image = Array.isArray(listing.photos) && listing.photos.length
        ? listing.photos[0]
        : 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=700&q=80';
    const product = {
        id: `user-${Date.now()}`,
        title: listing.title,
        brand: canonicalBrandName(listing.brand || 'Local Brands'),
        type: listing.category || 'Accessories',
        color: listing.color || 'Black',
        condition: String(listing.condition || 'Used').includes('New') ? 'New' : 'Used',
        price: Number(listing.price || 1),
        image,
        photos: Array.isArray(listing.photos) && listing.photos.length ? listing.photos : [image],
        tag: String(listing.condition || '').includes('New') ? 'new' : 'used',
        seller: 'You',
        description: listing.description || 'Seller did not add a description yet.'
    };

    products.push(product);
    setUserProducts(products);
    updateProductStatsUI();
    renderHomeProducts();

    createRemoteListing(product, listing.photoFiles || []).then((remoteProduct) => {
        if (!remoteProduct) return;
        removeLocalProduct(product.id);
        const remoteProducts = getRemoteProducts().filter((item) => item.id !== remoteProduct.id);
        setRemoteProducts([remoteProduct, ...remoteProducts]);
        refreshDynamicProductViews();
    }).catch(() => {});

    return product;
}

function renderWishlistBadgeOnly(count) {
    document.querySelectorAll('.nav-badge').forEach((badge) => {
        badge.textContent = String(count);
        badge.classList.toggle('has-items', count > 0);
    });
}

function syncWishlistButtons() {
    const ids = getWishlistIds();
    document.querySelectorAll('.item-like[data-product-id]').forEach((button) => {
        const active = ids.includes(button.getAttribute('data-product-id'));
        button.classList.toggle('liked', active);
        button.textContent = active ? '♥' : '♡';
    });
}

function refreshProductViews() {
    updateWishlistBadge();
    syncWishlistButtons();
    updateProductStatsUI();
    renderHomeProducts();
}

function saveListingToProduct(formData, photos = [], photoFiles = []) {
    const title = String(formData.get('title') || 'New listing').trim();
    const product = saveProductFromListing({
        title,
        brand: String(formData.get('brand') || 'Local Brands').trim(),
        category: String(formData.get('category') || 'Accessories').trim(),
        condition: String(formData.get('condition') || 'Used').trim(),
        price: Number(formData.get('price') || 1),
        description: String(formData.get('description') || '').trim(),
        photos,
        photoFiles
    });

    return product;
}

function seedWishlistIfEmpty() {
    if (!localStorage.getItem('kidanWishlist')) {
        localStorage.setItem('kidanWishlist', JSON.stringify([]));
    }
}

function updateWishlistBadge() {
    seedWishlistIfEmpty();
    renderWishlistBadgeOnly(getWishlistItems().length);
    syncWishlistButtons();
}

function renderBrandPage() {
    const page = document.querySelector('[data-brand-page]');
    if (!page) return;

    const brandName = page.getAttribute('data-brand-name') || 'Brand';
    kidanCurrentBrandName = brandName;
    const safeBrandName = escapeHtml(brandName);
    const initial = escapeHtml(brandName.charAt(0).toUpperCase());

    document.body.innerHTML = `
      <nav class="filter-bar" aria-label="Brand navigation" style="position:sticky;top:0;z-index:9999;">
        <div class="nav-top">
          <a href="./index.html" class="nav-brand"><span class="brand-kidan">Kidan</span><span class="brand-shop"> Shop</span></a>
          <div class="nav-icons">
            <a href="./coming-soon.html" class="sell-btn">+ Sell Item</a>
            <button type="button" class="nav-icon-btn theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
              <svg class="icon-sun" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <svg class="icon-moon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <a href="./wishlist.html" class="nav-icon-btn" aria-label="Wishlist" title="Wishlist" style="position:relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span class="nav-badge">0</span>
            </a>
            <a href="./chats.html" class="nav-icon-btn" aria-label="Chats" title="Chats">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
            </a>
            <a href="./profile.html" class="nav-icon-btn" aria-label="Profile" title="My Profile">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
          </div>
        </div>
      </nav>

      <div id="bg-patterns" aria-hidden="true">
        <div class="bp r1"></div><div class="bp r2"></div><div class="bp r3"></div><div class="bp r4"></div>
        <div class="bp b1"></div><div class="bp b2"></div><div class="bp b3"></div><div class="bp dg1"></div><div class="bp dg2"></div>
        <div class="bp ln1"></div><div class="bp ln2"></div><div class="bp ln3"></div><div class="bp cross1"></div><div class="bp cross2"></div>
      </div>

      <main class="brand-page-main">
        <section class="brand-hero">
          <div class="brand-hero-inner">
            <div>
              <a class="brand-back-link" href="./index.html">Back to brands</a>
              <span class="header-eyebrow">Brand page</span>
              <h1>${safeBrandName}</h1>
              <p>Browse only ${safeBrandName} listings. Use the configurator to choose max price, item type, and color before new listings are added.</p>
            </div>
            <div class="brand-mark" aria-hidden="true"><span>${initial}</span></div>
          </div>
        </section>

        <section class="brand-config-section brand-config-section-full">
          <section class="brand-results-panel">
            <div class="brand-results-head">
              <div>
                <h2>${safeBrandName} Listings</h2>
                <p class="result-summary" id="brand-filter-summary">All items, any color, $0-$500. No listings yet.</p>
              </div>
              <button type="button" class="config-open-btn" id="config-open">Open filters</button>
            </div>
            <div class="collection-grid collection-grid-inline" id="brand-products" aria-label="${safeBrandName} listings"></div>
          </section>
        </section>

        <div class="config-drawer" id="config-drawer" aria-hidden="true">
          <div class="config-drawer-backdrop" data-config-close></div>
          <aside class="config-drawer-panel" aria-label="Listing configurator">
            <div class="config-drawer-head">
              <div>
                <p class="modal-eyebrow">Filters</p>
                <h2>Configurator</h2>
              </div>
              <button type="button" class="modal-close" aria-label="Close filters" data-config-close>×</button>
            </div>
            <div class="config-group">
              <div class="config-label"><span>Min price</span><strong id="brand-price-min-value">$0</strong></div>
              <input class="config-range" id="brand-price-min" type="range" min="0" max="1000" step="25" value="0">
            </div>
            <div class="config-group">
              <div class="config-label"><span>Max price</span><strong id="brand-price-max-value">$500</strong></div>
              <input class="config-range" id="brand-price-max" type="range" min="25" max="2000" step="25" value="500">
            </div>
            <div class="config-group">
              <div class="config-label"><span>Clothing type</span></div>
              <div class="type-options">
                <button type="button" class="type-chip active" data-config-type="All">All</button>
                <button type="button" class="type-chip" data-config-type="Sneakers">Sneakers</button>
                <button type="button" class="type-chip" data-config-type="Hoodies">Hoodies</button>
                <button type="button" class="type-chip" data-config-type="Jackets">Jackets</button>
                <button type="button" class="type-chip" data-config-type="T-Shirts">T-Shirts</button>
                <button type="button" class="type-chip" data-config-type="Pants">Pants</button>
                <button type="button" class="type-chip" data-config-type="Jeans">Jeans</button>
                <button type="button" class="type-chip" data-config-type="Shorts">Shorts</button>
                <button type="button" class="type-chip" data-config-type="Shirts">Shirts</button>
                <button type="button" class="type-chip" data-config-type="Sweaters">Sweaters</button>
                <button type="button" class="type-chip" data-config-type="Tracksuits">Tracksuits</button>
                <button type="button" class="type-chip" data-config-type="Accessories">Accessories</button>
                <button type="button" class="type-chip" data-config-type="Bags">Bags</button>
                <button type="button" class="type-chip" data-config-type="Hats">Hats</button>
              </div>
            </div>
            <div class="config-group">
              <div class="config-label"><span>Color</span></div>
              <div class="color-options color-options-expanded">
                <button type="button" class="color-chip active" data-config-color="Any" aria-label="Any" style="background:linear-gradient(135deg,#111,#fff)"></button>
                <button type="button" class="color-chip" data-config-color="Black" aria-label="Black" style="background:#111"></button>
                <button type="button" class="color-chip" data-config-color="White" aria-label="White" style="background:#fff"></button>
                <button type="button" class="color-chip" data-config-color="Gray" aria-label="Gray" style="background:#9ca3af"></button>
                <button type="button" class="color-chip" data-config-color="Red" aria-label="Red" style="background:#ef4444"></button>
                <button type="button" class="color-chip" data-config-color="Orange" aria-label="Orange" style="background:#f97316"></button>
                <button type="button" class="color-chip" data-config-color="Yellow" aria-label="Yellow" style="background:#facc15"></button>
                <button type="button" class="color-chip" data-config-color="Green" aria-label="Green" style="background:#16a34a"></button>
                <button type="button" class="color-chip" data-config-color="Blue" aria-label="Blue" style="background:#2563eb"></button>
                <button type="button" class="color-chip" data-config-color="Purple" aria-label="Purple" style="background:#7c3aed"></button>
                <button type="button" class="color-chip" data-config-color="Pink" aria-label="Pink" style="background:#ec4899"></button>
                <button type="button" class="color-chip" data-config-color="Brown" aria-label="Brown" style="background:#92400e"></button>
                <button type="button" class="color-chip" data-config-color="Beige" aria-label="Beige" style="background:#d6c7aa"></button>
                <button type="button" class="color-chip" data-config-color="Navy" aria-label="Navy" style="background:#172554"></button>
              </div>
            </div>
            <div class="config-group">
              <div class="config-label"><span>Condition</span></div>
              <div class="type-options">
                <button type="button" class="type-chip active" data-config-condition="Any">Any</button>
                <button type="button" class="type-chip" data-config-condition="New">New</button>
                <button type="button" class="type-chip" data-config-condition="Used">Used</button>
                <button type="button" class="type-chip" data-config-condition="Sale">Sale</button>
              </div>
            </div>
            <div class="brand-config-actions">
              <button type="button" class="config-apply" id="brand-apply">Apply filters</button>
              <button type="button" class="config-reset" id="brand-reset">Reset</button>
            </div>
          </aside>
        </div>
      </main>
    `;

    initializeBrandThemeToggle();
    initializeBrandConfigurator(brandName);
    renderProductGrid(
        document.getElementById('brand-products'),
        filterProducts({ brand: brandName }),
        `No ${brandName} items match these filters yet.`
    );
    updateWishlistBadge();
    initializeQualityNavigation();
}

function renderCollectionPage() {
    const page = document.querySelector('[data-collection-page]');
    if (!page) return;

    const title = page.getAttribute('data-page-title') || 'All Listings';
    const subtitle = page.getAttribute('data-page-subtitle') || 'Browse marketplace listings in one place.';
    const active = page.getAttribute('data-active-tab') || 'all';
    const query = new URLSearchParams(window.location.search).get('q') || '';
    kidanCurrentCollectionState = { active, query };
    const safeTitle = escapeHtml(title);
    const safeSubtitle = escapeHtml(query ? `Search results for "${query}".` : subtitle);

    document.body.innerHTML = renderSimplePageShell(`
      <main class="brand-page-main">
        <section class="brand-hero">
          <div class="brand-hero-inner">
            <div>
              <a class="brand-back-link" href="./index.html">Back to home</a>
              <span class="header-eyebrow">Marketplace</span>
              <h1>${safeTitle}</h1>
              <p>${safeSubtitle}</p>
            </div>
            <div class="brand-mark" aria-hidden="true"><span>${escapeHtml(title.charAt(0).toUpperCase())}</span></div>
          </div>
        </section>
        ${renderCollectionTabs(active)}
        <section class="collection-grid" id="collection-products" aria-label="${safeTitle}"></section>
      </main>
    `);

    document.querySelectorAll('.qbtn').forEach((button) => {
        button.classList.toggle('active', button.getAttribute('data-q') === active);
    });
    initializeBrandThemeToggle();
    renderProductGrid(
        document.getElementById('collection-products'),
        filterProducts({ tab: active === 'all' ? null : active, query }),
        'No products in this section yet.'
    );
    updateWishlistBadge();
    initializeQualityNavigation();
}

function renderWishlistPage() {
    const page = document.querySelector('[data-wishlist-page]');
    if (!page) return;

    const items = getWishlistItems();
    const cards = items.length
        ? '<section class="collection-grid" id="wishlist-products" aria-label="Wishlist"></section>'
        : `<section class="wishlist-empty">
             <h2>Your wishlist is empty</h2>
             <p>Tap a like button on an item and it will appear here.</p>
             <a href="./index.html" class="view-all-btn">Back to shop</a>
           </section>`;

    document.body.innerHTML = renderSimplePageShell(`
      <main class="brand-page-main">
        <section class="brand-hero">
          <div class="brand-hero-inner">
            <div>
              <a class="brand-back-link" href="./index.html">Back to home</a>
              <span class="header-eyebrow">Saved items</span>
              <h1>Wishlist</h1>
              <p>Items you like are collected here so you can return to them later.</p>
            </div>
            <div class="brand-mark" aria-hidden="true"><span>W</span></div>
          </div>
        </section>
        ${cards}
      </main>
    `);

    initializeBrandThemeToggle();
    renderProductGrid(document.getElementById('wishlist-products'), items, 'Your wishlist is empty.');
    updateWishlistBadge();
    initializeQualityNavigation();
}

function getChats() {
    const remoteChats = getRemoteChats();
    const remoteProductIds = new Set(remoteChats.map((chat) => chat.productId));
    const localChats = getLocalChats().filter((chat) => !remoteProductIds.has(chat.productId));
    return [...remoteChats, ...localChats].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

function getLocalChats() {
    try {
        return JSON.parse(localStorage.getItem('kidanChats') || '[]');
    } catch (error) {
        return [];
    }
}

function setChats(chats) {
    localStorage.setItem('kidanChats', JSON.stringify(chats));
}

function getRemoteChats() {
    try {
        return JSON.parse(localStorage.getItem('kidanRemoteChats') || '[]');
    } catch (error) {
        return [];
    }
}

function setRemoteChats(chats) {
    localStorage.setItem('kidanRemoteChats', JSON.stringify(chats));
}

function normalizeRemoteChat(row) {
    const product = getProductById(row.listing_id);
    const messages = [...(row.messages || [])]
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
        .map((message) => ({
            from: message.sender,
            text: message.body,
            at: message.created_at
        }));

    return {
        id: row.id,
        remote: true,
        productId: row.listing_id,
        seller: row.seller_name || product?.seller || 'Seller',
        productTitle: product?.title || 'Marketplace listing',
        updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
        messages
    };
}

async function fetchRemoteChats() {
    const client = await getSupabaseClient();
    if (!client) return [];

    let response;
    try {
        response = await client
            .from('chats')
            .select('id,session_id,listing_id,seller_name,created_at,updated_at,messages(id,sender,body,created_at)')
            .eq('session_id', getKidanSessionId())
            .order('updated_at', { ascending: false });
    } catch (error) {
        return [];
    }

    if (response.error) return [];
    const chats = (response.data || []).map(normalizeRemoteChat);
    setRemoteChats(chats);
    return chats;
}

async function createRemoteChat(productId) {
    if (!isSupabaseUuid(productId)) return null;

    const product = getProductById(productId);
    const client = await getSupabaseClient();
    if (!client || !product) return null;

    let response;
    try {
        response = await client
            .from('chats')
            .upsert({
                session_id: getKidanSessionId(),
                listing_id: productId,
                seller_name: product.seller || 'Seller',
                updated_at: new Date().toISOString()
            }, { onConflict: 'session_id,listing_id' })
            .select('id,session_id,listing_id,seller_name,created_at,updated_at,messages(id,sender,body,created_at)')
            .single();
    } catch (error) {
        return null;
    }

    if (response.error || !response.data) return null;

    let remoteChat = normalizeRemoteChat(response.data);
    if (!remoteChat.messages.length) {
        await addRemoteMessage(remoteChat.id, `Hi, this is ${product.seller || 'the seller'}. Ask me anything about "${product.title}".`, 'seller');
        await fetchRemoteChats();
        remoteChat = getRemoteChats().find((chat) => chat.id === remoteChat.id) || remoteChat;
    } else {
        const remoteChats = getRemoteChats().filter((chat) => chat.id !== remoteChat.id);
        setRemoteChats([remoteChat, ...remoteChats]);
    }

    setChats(getLocalChats().filter((chat) => chat.productId !== productId));
    return remoteChat;
}

async function addRemoteMessage(chatId, text, from = 'buyer') {
    if (!isSupabaseUuid(chatId) || !text.trim()) return false;

    const client = await getSupabaseClient();
    if (!client) return false;

    try {
        const createdAt = new Date().toISOString();
        const { error } = await client
            .from('messages')
            .insert({ chat_id: chatId, sender: from, body: text.trim(), created_at: createdAt });

        if (error) return false;

        await client
            .from('chats')
            .update({ updated_at: createdAt })
            .eq('id', chatId);

        return true;
    } catch (error) {
        return false;
    }
}

function getOrCreateChat(productId) {
    const product = getProductById(productId);
    if (!product) return null;

    const remoteChat = getRemoteChats().find((item) => item.productId === productId);
    if (remoteChat) return remoteChat;

    const chats = getLocalChats();
    let chat = chats.find((item) => item.productId === productId);
    if (!chat) {
        chat = {
            id: `chat-${productId}`,
            productId,
            seller: product.seller || 'Seller',
            productTitle: product.title,
            updatedAt: new Date().toISOString(),
            messages: [
                {
                    from: 'seller',
                    text: `Hi, this is ${product.seller || 'the seller'}. Ask me anything about "${product.title}".`,
                    at: new Date().toISOString()
                }
            ]
        };
        chats.unshift(chat);
        setChats(chats);
    }

    createRemoteChat(productId).then((createdChat) => {
        if (!createdChat) return;
        if (window.location.pathname.endsWith('/chats.html')) {
            const currentChatId = new URLSearchParams(window.location.search).get('chat');
            if (currentChatId === chat.id) {
                window.history.replaceState({}, '', './chats.html?chat=' + encodeURIComponent(createdChat.id));
                renderChatsPage();
            }
        }
    }).catch(() => {});

    return chat;
}

function addChatMessage(chatId, text, from = 'buyer') {
    const remoteChat = getRemoteChats().find((item) => item.id === chatId);
    if (remoteChat && text.trim()) {
        remoteChat.messages.push({ from, text: text.trim(), at: new Date().toISOString() });
        remoteChat.updatedAt = new Date().toISOString();
        setRemoteChats([remoteChat, ...getRemoteChats().filter((chat) => chat.id !== chatId)]);
        addRemoteMessage(chatId, text, from).then((saved) => {
            if (saved) fetchRemoteChats().then(() => {
                if (window.location.pathname.endsWith('/chats.html')) renderChatsPage();
            });
        }).catch(() => {});
        return;
    }

    const chats = getLocalChats();
    const chat = chats.find((item) => item.id === chatId);
    if (!chat || !text.trim()) return;

    chat.messages.push({ from, text: text.trim(), at: new Date().toISOString() });
    chat.updatedAt = new Date().toISOString();
    setChats(chats);
}

function renderProductDetailPage() {
    const page = document.querySelector('[data-product-page]');
    if (!page && !window.location.pathname.endsWith('/product.html')) return;

    const productId = new URLSearchParams(window.location.search).get('id');
    kidanCurrentProductId = productId || '';
    const product = getProductById(productId);

    if (!product) {
        document.body.innerHTML = renderSimplePageShell(`
          <main class="brand-page-main">
            <section class="wishlist-empty product-not-found">
              <h2>Listing not found</h2>
              <p>This listing may have been removed or the link is incomplete.</p>
              <a href="./view-all.html" class="view-all-btn">Browse listings</a>
            </section>
          </main>
        `);
        initializeBrandThemeToggle();
        initializeQualityNavigation();
        updateWishlistBadge();
        return;
    }

    const photos = (Array.isArray(product.photos) && product.photos.length ? product.photos : [product.image]).filter(Boolean);
    const brandPage = kidanBrandPages[canonicalBrandName(product.brand)] || 'view-all.html';

    document.body.innerHTML = renderSimplePageShell(`
      <main class="product-detail-main">
        <a class="brand-back-link product-back" href="./view-all.html">Back to listings</a>
        <section class="product-detail">
          <div class="product-gallery">
            <img class="product-main-photo" id="product-main-photo" src="${escapeHtml(photos[0])}" alt="${escapeHtml(product.title)}">
            <div class="product-thumbs">
              ${photos.map((photo, index) => `<button type="button" class="product-thumb${index === 0 ? ' active' : ''}" data-photo="${escapeHtml(photo)}"><img src="${escapeHtml(photo)}" alt="${escapeHtml(product.title)} photo ${index + 1}"></button>`).join('')}
            </div>
          </div>
          <aside class="product-detail-panel">
            <a class="product-brand" href="./${brandPage}">${escapeHtml(canonicalBrandName(product.brand))}</a>
            <h1>${escapeHtml(product.title)}</h1>
            <strong class="product-detail-price">${formatPrice(product.price)}</strong>
            <div class="product-meta product-detail-meta">
              <span>${escapeHtml(product.type)}</span>
              <span>${escapeHtml(product.color)}</span>
              <span>${escapeHtml(product.condition)}</span>
            </div>
            <section class="product-description">
              <h2>Description</h2>
              <p>${escapeHtml(product.description || 'Seller did not add a description yet.')}</p>
            </section>
            <section class="seller-panel">
              <span>Seller</span>
              <strong>${escapeHtml(product.seller || 'Seller')}</strong>
            </section>
            <div class="product-actions">
              <button type="button" class="config-apply" id="contact-seller" data-product-id="${escapeHtml(product.id)}">Contact seller</button>
              <button type="button" class="item-like${getWishlistIds().includes(product.id) ? ' liked' : ''}" data-product-id="${escapeHtml(product.id)}" aria-label="Add to wishlist">${getWishlistIds().includes(product.id) ? '♥' : '♡'}</button>
            </div>
          </aside>
        </section>
      </main>
    `);

    document.querySelectorAll('.product-thumb').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.product-thumb').forEach((item) => item.classList.remove('active'));
            button.classList.add('active');
            const photo = button.getAttribute('data-photo');
            const main = document.getElementById('product-main-photo');
            if (main && photo) main.src = photo;
        });
    });

    document.getElementById('contact-seller')?.addEventListener('click', async () => {
        let chat = isSupabaseUuid(product.id) ? await createRemoteChat(product.id) : null;
        if (!chat) chat = getOrCreateChat(product.id);
        if (chat) window.location.href = './chats.html?chat=' + encodeURIComponent(chat.id);
    });

    initializeBrandThemeToggle();
    initializeWishlistLinks();
    updateWishlistBadge();
    initializeQualityNavigation();
}

function renderChatsPage() {
    const page = document.querySelector('[data-chats-page]');
    if (!page) return;

    const chatId = new URLSearchParams(window.location.search).get('chat');
    const chats = getChats();
    const activeChat = chats.find((chat) => chat.id === chatId) || chats[0] || null;

    document.body.innerHTML = renderSimplePageShell(`
      <main class="chats-main">
        <section class="brand-hero chats-hero">
          <div class="brand-hero-inner">
            <div>
              <a class="brand-back-link" href="./index.html">Back to home</a>
              <span class="header-eyebrow">Messages</span>
              <h1>Chats</h1>
              <p>Talk with sellers about listings, photos, condition, pickup, and shipping.</p>
            </div>
            <div class="brand-mark" aria-hidden="true"><span>C</span></div>
          </div>
        </section>
        <section class="chat-layout">
          <aside class="chat-list">
            ${chats.length ? chats.map((chat) => renderChatListItem(chat, activeChat?.id)).join('') : '<div class="chat-empty-small">No chats yet. Open a listing and contact a seller.</div>'}
          </aside>
          <section class="chat-thread">
            ${activeChat ? renderChatThread(activeChat) : '<div class="wishlist-empty"><h2>No conversation selected</h2><p>Start from any listing by pressing Contact seller.</p><a class="view-all-btn" href="./view-all.html">Browse listings</a></div>'}
          </section>
        </section>
      </main>
    `);

    const form = document.getElementById('chat-form');
    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = document.getElementById('chat-input');
        addChatMessage(activeChat.id, input.value);
        input.value = '';
        renderChatsPage();
    });

    initializeBrandThemeToggle();
    updateWishlistBadge();
    initializeQualityNavigation();
}

function renderChatListItem(chat, activeId) {
    const product = getProductById(chat.productId);
    const last = chat.messages[chat.messages.length - 1];
    return `
      <a class="chat-list-item${chat.id === activeId ? ' active' : ''}" href="./chats.html?chat=${encodeURIComponent(chat.id)}">
        <img src="${escapeHtml(product?.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&q=80')}" alt="">
        <div>
          <strong>${escapeHtml(chat.productTitle)}</strong>
          <span>${escapeHtml(last?.text || 'No messages yet')}</span>
        </div>
      </a>
    `;
}

function renderChatThread(chat) {
    const product = getProductById(chat.productId);
    return `
      <div class="chat-thread-head">
        <div>
          <span>${escapeHtml(chat.seller)}</span>
          <h2>${escapeHtml(chat.productTitle)}</h2>
        </div>
        <a href="./product.html?id=${encodeURIComponent(chat.productId)}" class="view-all-btn">View listing</a>
      </div>
      <div class="chat-messages">
        ${chat.messages.map((message) => `<p class="chat-message ${message.from === 'buyer' ? 'chat-buyer' : 'chat-seller'}">${escapeHtml(message.text)}</p>`).join('')}
      </div>
      <form class="chat-compose" id="chat-form">
        <input type="text" id="chat-input" placeholder="Write a message about ${escapeHtml(product?.title || 'this item')}..." autocomplete="off" required>
        <button type="submit">Send</button>
      </form>
    `;
}

function renderSimplePageShell(content) {
    return `
      <nav class="filter-bar" aria-label="Main navigation" style="position:sticky;top:0;z-index:9999;">
        <div class="nav-top">
          <a href="./index.html" class="nav-brand"><span class="brand-kidan">Kidan</span><span class="brand-shop"> Shop</span></a>
          <div class="nav-quality-bar">
            <button class="qbtn" data-q="all" type="button">All</button>
            <button class="qbtn" data-q="new" type="button">New</button>
            <button class="qbtn" data-q="used" type="button">Used</button>
            <button class="qbtn" data-q="sale" type="button">Sale</button>
          </div>
          <div class="nav-icons">
            <a href="./coming-soon.html" class="sell-btn">+ Sell Item</a>
            <button type="button" class="nav-icon-btn theme-toggle" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode">
              <svg class="icon-sun" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
              <svg class="icon-moon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <a href="./wishlist.html" class="nav-icon-btn" aria-label="Wishlist" title="Wishlist" style="position:relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span class="nav-badge">0</span>
            </a>
            <a href="./chats.html" class="nav-icon-btn" aria-label="Chats" title="Chats">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
            </a>
            <a href="./profile.html" class="nav-icon-btn" aria-label="Profile" title="My Profile">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </a>
          </div>
        </div>
      </nav>
      <div id="bg-patterns" aria-hidden="true">
        <div class="bp r1"></div><div class="bp r2"></div><div class="bp r3"></div><div class="bp r4"></div>
        <div class="bp b1"></div><div class="bp b2"></div><div class="bp b3"></div><div class="bp dg1"></div><div class="bp dg2"></div>
        <div class="bp ln1"></div><div class="bp ln2"></div><div class="bp ln3"></div><div class="bp cross1"></div><div class="bp cross2"></div>
      </div>
      ${content}
    `;
}

async function renderAdminSupportPage() {
    const page = document.querySelector('[data-admin-support-page]');
    if (!page) return;

    document.body.innerHTML = renderSimplePageShell(`
      <main class="admin-support-main">
        <section class="brand-hero admin-support-hero">
          <div class="brand-hero-inner">
            <div>
              <a class="brand-back-link" href="./index.html">Back to shop</a>
              <span class="header-eyebrow">Operator panel</span>
              <h1>Support Inbox</h1>
              <p>Sign in, choose a customer conversation, and answer directly from the browser.</p>
            </div>
            <div class="brand-mark" aria-hidden="true"><span>S</span></div>
          </div>
        </section>
        <section id="admin-support-root" class="admin-support-shell">
          <div class="admin-loading">Loading support panel...</div>
        </section>
      </main>
    `);

    initializeBrandThemeToggle();
    initializeQualityNavigation();
    await renderAdminSupportAuthState();
}

async function renderAdminSupportAuthState() {
    const root = document.getElementById('admin-support-root');
    if (!root) return;

    const client = await getSupabaseClient();
    if (!client) {
        root.innerHTML = `<section class="wishlist-empty"><h2>Supabase is unavailable</h2><p>Check your internet connection and try again.</p></section>`;
        return;
    }

    const { data } = await client.auth.getSession();
    const session = data?.session;

    if (!session) {
        renderAdminLogin(root);
        return;
    }

    renderAdminInbox(root, session);
}

function renderAdminLogin(root) {
    root.innerHTML = `
      <section class="admin-login-panel">
        <div>
          <span class="modal-eyebrow">Secure access</span>
          <h2>Sign in to answer support</h2>
          <p class="admin-muted">Use email OTP, phone OTP, or Google. Phone and Google must be enabled in Supabase Auth settings.</p>
        </div>

        <div class="admin-auth-grid">
          <form class="admin-auth-card" id="admin-email-form">
            <h3>Email</h3>
            <input type="email" id="admin-email" placeholder="you@example.com" autocomplete="email" required>
            <button type="submit">Send email code</button>
          </form>

          <form class="admin-auth-card" id="admin-phone-form">
            <h3>Phone</h3>
            <input type="tel" id="admin-phone" placeholder="+420..." autocomplete="tel" required>
            <button type="submit">Send SMS code</button>
          </form>

          <div class="admin-auth-card">
            <h3>Google</h3>
            <button type="button" id="admin-google">Continue with Google</button>
          </div>
        </div>

        <form class="admin-otp-panel" id="admin-otp-form">
          <div>
            <h3>Enter code</h3>
            <p class="admin-muted">After email/SMS arrives, enter the code here.</p>
          </div>
          <input type="text" id="admin-otp" placeholder="6 digit code" inputmode="numeric" autocomplete="one-time-code" required>
          <button type="submit">Verify code</button>
        </form>

        <p class="admin-status" id="admin-auth-status"></p>
      </section>
    `;

    wireAdminAuthForms();
}

function setAdminAuthStatus(message) {
    const status = document.getElementById('admin-auth-status');
    if (status) status.textContent = message;
}

function rememberAdminOtpTarget(type, value) {
    localStorage.setItem('kidanAdminOtpTarget', JSON.stringify({ type, value }));
}

function getAdminOtpTarget() {
    try {
        return JSON.parse(localStorage.getItem('kidanAdminOtpTarget') || '{}');
    } catch (error) {
        return {};
    }
}

async function wireAdminAuthForms() {
    const client = await getSupabaseClient();
    if (!client) return;

    document.getElementById('admin-email-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('admin-email')?.value.trim();
        if (!email) return;
        setAdminAuthStatus('Sending email code...');
        const { error } = await client.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.href }
        });
        if (error) setAdminAuthStatus(error.message);
        else {
            rememberAdminOtpTarget('email', email);
            setAdminAuthStatus('Email code sent. Paste it below.');
        }
    });

    document.getElementById('admin-phone-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const phone = document.getElementById('admin-phone')?.value.trim();
        if (!phone) return;
        setAdminAuthStatus('Sending SMS code...');
        const { error } = await client.auth.signInWithOtp({ phone });
        if (error) setAdminAuthStatus(error.message);
        else {
            rememberAdminOtpTarget('phone', phone);
            setAdminAuthStatus('SMS code sent. Paste it below.');
        }
    });

    document.getElementById('admin-google')?.addEventListener('click', async () => {
        setAdminAuthStatus('Opening Google sign in...');
        const { error } = await client.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.href }
        });
        if (error) setAdminAuthStatus(error.message);
    });

    document.getElementById('admin-otp-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const token = document.getElementById('admin-otp')?.value.trim();
        const target = getAdminOtpTarget();
        if (!token || !target.type || !target.value) {
            setAdminAuthStatus('Send a code first, then verify it.');
            return;
        }

        setAdminAuthStatus('Checking code...');
        const payload = target.type === 'phone'
            ? { phone: target.value, token, type: 'sms' }
            : { email: target.value, token, type: 'email' };
        const { error } = await client.auth.verifyOtp(payload);
        if (error) setAdminAuthStatus(error.message);
        else {
            localStorage.removeItem('kidanAdminOtpTarget');
            await renderAdminSupportAuthState();
        }
    });
}

async function fetchAdminSupportThreads() {
    const client = await getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
        .from('support_threads')
        .select('id,session_id,status,customer_label,created_at,updated_at,support_messages(id,sender,body,created_at)')
        .order('updated_at', { ascending: false });

    if (error) return [];
    return data || [];
}

function normalizeAdminThread(thread) {
    const messages = [...(thread.support_messages || [])]
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    const last = messages[messages.length - 1];
    return { ...thread, messages, last };
}

async function renderAdminInbox(root, session) {
    root.innerHTML = `
      <section class="admin-inbox-layout">
        <aside class="admin-thread-list">
          <div class="admin-panel-head">
            <div>
              <span class="modal-eyebrow">Signed in</span>
              <strong>${escapeHtml(session.user.email || session.user.phone || 'Operator')}</strong>
            </div>
            <button type="button" id="admin-sign-out">Sign out</button>
          </div>
          <div id="admin-thread-list" class="admin-thread-list-body">
            <div class="chat-empty-small">Loading conversations...</div>
          </div>
        </aside>
        <section class="admin-thread-panel" id="admin-thread-panel">
          <div class="wishlist-empty"><h2>Select a conversation</h2><p>Customer support messages will appear here.</p></div>
        </section>
      </section>
    `;

    document.getElementById('admin-sign-out')?.addEventListener('click', async () => {
        const client = await getSupabaseClient();
        await client?.auth.signOut();
        await renderAdminSupportAuthState();
    });

    await refreshAdminThreads();
    clearInterval(window.kidanAdminSupportTimer);
    window.kidanAdminSupportTimer = setInterval(refreshAdminThreads, 5000);
}

async function refreshAdminThreads() {
    const list = document.getElementById('admin-thread-list');
    if (!list) return;

    const threads = (await fetchAdminSupportThreads()).map(normalizeAdminThread);
    if (!threads.length) {
        list.innerHTML = '<div class="chat-empty-small">No support conversations yet.</div>';
        return;
    }

    const activeId = new URLSearchParams(window.location.search).get('support') || threads[0].id;
    list.innerHTML = threads.map((thread) => `
      <button type="button" class="admin-thread-item${thread.id === activeId ? ' active' : ''}" data-support-thread="${escapeHtml(thread.id)}">
        <strong>${escapeHtml(thread.customer_label || 'Website visitor')}</strong>
        <span>${escapeHtml(thread.last?.body || 'No messages yet')}</span>
      </button>
    `).join('');

    list.querySelectorAll('[data-support-thread]').forEach((button) => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-support-thread');
            window.history.replaceState({}, '', './admin-support.html?support=' + encodeURIComponent(id));
            renderAdminThread(threads.find((thread) => thread.id === id));
            refreshAdminThreads();
        });
    });

    renderAdminThread(threads.find((thread) => thread.id === activeId) || threads[0]);
}

function renderAdminThread(thread) {
    const panel = document.getElementById('admin-thread-panel');
    if (!panel || !thread) return;

    panel.innerHTML = `
      <div class="chat-thread-head">
        <div>
          <span>${escapeHtml(thread.status || 'open')}</span>
          <h2>${escapeHtml(thread.customer_label || 'Website visitor')}</h2>
        </div>
        <button type="button" class="view-all-btn" id="admin-mark-closed">Mark closed</button>
      </div>
      <div class="chat-messages admin-support-messages">
        ${thread.messages.length ? thread.messages.map((message) => `
          <p class="chat-message ${message.sender === 'agent' ? 'chat-seller' : 'chat-buyer'}">${escapeHtml(message.body)}</p>
        `).join('') : '<p class="chat-empty-small">No messages yet.</p>'}
      </div>
      <form class="chat-compose" id="admin-reply-form">
        <input type="text" id="admin-reply-input" placeholder="Write support reply..." autocomplete="off" required>
        <button type="submit">Send</button>
      </form>
    `;

    const messages = panel.querySelector('.admin-support-messages');
    if (messages) messages.scrollTop = messages.scrollHeight;

    document.getElementById('admin-reply-form')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const input = document.getElementById('admin-reply-input');
        const text = input?.value.trim();
        if (!text) return;
        input.value = '';
        await sendAdminSupportReply(thread.id, text);
        await refreshAdminThreads();
    });

    document.getElementById('admin-mark-closed')?.addEventListener('click', async () => {
        await updateSupportThreadStatus(thread.id, 'closed');
        await refreshAdminThreads();
    });
}

async function sendAdminSupportReply(threadId, text) {
    const client = await getSupabaseClient();
    if (!client || !text.trim()) return false;

    const createdAt = new Date().toISOString();
    const { error } = await client
        .from('support_messages')
        .insert({ thread_id: threadId, sender: 'agent', body: text.trim(), created_at: createdAt });

    if (error) return false;

    await client
        .from('support_threads')
        .update({ status: 'open', updated_at: createdAt })
        .eq('id', threadId);

    return true;
}

async function updateSupportThreadStatus(threadId, status) {
    const client = await getSupabaseClient();
    if (!client) return false;
    const { error } = await client
        .from('support_threads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', threadId);
    return !error;
}

function renderCollectionTabs(active) {
    const tabs = [
        ['all', 'All', './index.html'],
        ['new', 'New', './new.html'],
        ['used', 'Used', './used.html'],
        ['sale', 'Sale', './sale.html']
    ];

    return `<nav class="collection-toolbar" aria-label="Listing filters">
      ${tabs.map(([key, label, href]) => `<a class="collection-tab${key === active ? ' active' : ''}" href="${href}">${label}</a>`).join('')}
    </nav>`;
}

function initializeBrandThemeToggle() {
    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', () => {
        const isDark = root.getAttribute('data-theme') === 'dark';
        if (isDark) {
            root.removeAttribute('data-theme');
            try { localStorage.setItem('kidan-theme', 'light'); } catch (e) {}
        } else {
            root.setAttribute('data-theme', 'dark');
            try { localStorage.setItem('kidan-theme', 'dark'); } catch (e) {}
        }
    });
}

function initializeBrandConfigurator(brandName = '') {
    const drawer = document.getElementById('config-drawer');
    const openBtn = document.getElementById('config-open');
    const closeBtns = document.querySelectorAll('[data-config-close]');
    const minPrice = document.getElementById('brand-price-min');
    const maxPrice = document.getElementById('brand-price-max');
    const minPriceValue = document.getElementById('brand-price-min-value');
    const maxPriceValue = document.getElementById('brand-price-max-value');
    const summary = document.getElementById('brand-filter-summary');
    const applyBtn = document.getElementById('brand-apply');
    const resetBtn = document.getElementById('brand-reset');
    const typeButtons = Array.from(document.querySelectorAll('[data-config-type]'));
    const colorButtons = Array.from(document.querySelectorAll('[data-config-color]'));
    const conditionButtons = Array.from(document.querySelectorAll('[data-config-condition]'));
    const state = {
        type: 'All',
        color: 'Any',
        condition: 'Any',
        min: Number(minPrice?.value || 0),
        max: Number(maxPrice?.value || 500)
    };

    function openDrawer() {
        drawer?.classList.add('is-open');
        drawer?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeDrawer() {
        drawer?.classList.remove('is-open');
        drawer?.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    function setActive(buttons, attr, value) {
        buttons.forEach((button) => button.classList.toggle('active', button.getAttribute(attr) === value));
    }

    function renderSummary() {
        if (minPriceValue) minPriceValue.textContent = '$' + state.min.toLocaleString('en-US');
        if (maxPriceValue) maxPriceValue.textContent = '$' + state.max.toLocaleString('en-US');
        if (summary) {
            const conditionText = state.condition === 'Any' ? 'Any condition' : state.condition;
            const typeText = state.type === 'All' ? 'all clothing' : state.type.toLowerCase();
            const colorText = state.color === 'Any' ? 'any color' : state.color.toLowerCase();
            const products = filterProducts({
                brand: brandName,
                type: state.type,
                color: state.color,
                condition: state.condition,
                min: state.min,
                max: state.max
            });
            summary.textContent = `${products.length} ${products.length === 1 ? 'item' : 'items'}: ${conditionText}, ${typeText}, ${colorText}, $${state.min.toLocaleString('en-US')}-$${state.max.toLocaleString('en-US')}.`;
            renderProductGrid(
                document.getElementById('brand-products'),
                products,
                `No ${brandName || 'brand'} items match these filters yet.`
            );
        }
    }

    function syncPriceRange(changed) {
        state.min = Number(minPrice?.value || 0);
        state.max = Number(maxPrice?.value || 0);

        if (state.min > state.max - 25) {
            if (changed === 'min') {
                state.max = state.min + 25;
                if (maxPrice) maxPrice.value = String(state.max);
            } else {
                state.min = state.max - 25;
                if (minPrice) minPrice.value = String(state.min);
            }
        }

        renderSummary();
    }

    openBtn?.addEventListener('click', openDrawer);
    closeBtns.forEach((button) => button.addEventListener('click', closeDrawer));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && drawer?.classList.contains('is-open')) closeDrawer();
    });

    minPrice?.addEventListener('input', () => syncPriceRange('min'));
    maxPrice?.addEventListener('input', () => syncPriceRange('max'));

    typeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            state.type = button.getAttribute('data-config-type') || 'All';
            setActive(typeButtons, 'data-config-type', state.type);
            renderSummary();
        });
    });

    colorButtons.forEach((button) => {
        button.addEventListener('click', () => {
            state.color = button.getAttribute('data-config-color') || 'Any';
            setActive(colorButtons, 'data-config-color', state.color);
            renderSummary();
        });
    });

    conditionButtons.forEach((button) => {
        button.addEventListener('click', () => {
            state.condition = button.getAttribute('data-config-condition') || 'Any';
            setActive(conditionButtons, 'data-config-condition', state.condition);
            renderSummary();
        });
    });

    applyBtn?.addEventListener('click', () => {
        renderSummary();
        closeDrawer();
    });

    resetBtn?.addEventListener('click', () => {
        state.type = 'All';
        state.color = 'Any';
        state.condition = 'Any';
        state.min = 0;
        state.max = 500;
        if (minPrice) minPrice.value = '0';
        if (maxPrice) maxPrice.value = '500';
        setActive(typeButtons, 'data-config-type', state.type);
        setActive(colorButtons, 'data-config-color', state.color);
        setActive(conditionButtons, 'data-config-condition', state.condition);
        renderSummary();
    });

    renderSummary();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
