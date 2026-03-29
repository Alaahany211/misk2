    // بيانات المنتجات
    const menProducts = [
        { name: "بلاك افغانو", price: 20000, img: "img/1.png", badge: "%20 خصم", badge2: "اخر 5 قطع" },
        { name: "وود انتنس", price: 18500, img: "img/2.png", badge: "%10 خصم", badge2: "توصيل سريع" },
        { name: "وود انتنس", price: 18500, img: "img/2.png", badge: "%10 خصم", badge2: "توصيل سريع" },
        { name: "نايت ماجيك", price: 19500, img: "img/4.png", badge: "أفضل سعر", badge2: "محدود" }
    ];
    const womenProducts = [
        { name: "فلورال بوسي", price: 22000, img: "img/2.png", badge: "جديد", badge2: "تخفيض" },
        { name: "فلورال بوسي", price: 22000, img: "img/2.png", badge: "جديد", badge2: "تخفيض" },
        { name: "فلورال بوسي", price: 22000, img: "img/2.png", badge: "جديد", badge2: "تخفيض" },
        { name: "روز جولدن", price: 24000, img: "img/2.png", badge: "خصم 15%", badge2: "أقل كمية" }
    ];
    const unisexProducts = [
        { name: "سكاي وود", price: 21000, img: "img/2.png", badge: "رائحة مميزة", badge2: "الأكثر مبيعاً" },
        { name: "سكاي وود", price: 21000, img: "img/2.png", badge: "رائحة مميزة", badge2: "الأكثر مبيعاً" },
        { name: "سكاي وود", price: 21000, img: "img/2.png", badge: "رائحة مميزة", badge2: "الأكثر مبيعاً" },
        { name: "أمبر فانيلا", price: 22500, img: "img/3.png", badge: "جديد", badge2: "تخفيض" }
    ];

    // عوامل الزيادة
    const sizeAdd = { "30 مل": 0, "50 مل": 2500, "100 مل": 6000 };
    const shapeAdd = { "زجاجة كلاسيكية (مربعة)": 0, "زجاجة عصرية (دائرية)": 1500, "زجاجة أنيقة (بيضاوية)": 2500 };
    const concAdd = { "70% كحول / 30% عطر": 0, "50% كحول / 50% عطر": 2000, "40% كحول / 60% عطر": 4000 };

    let cart = [];
    let currentCustomProduct = null;
    let currentStep = 1;
    let selectedSize = null, selectedShape = null, selectedConc = null;
    let activeModal = null;

    // === دوال حفظ واسترجاع السلة من sessionStorage ===
    function saveCartToSession() {
        sessionStorage.setItem('misk_cart', JSON.stringify(cart));
    }

    function loadCartFromSession() {
        const saved = sessionStorage.getItem('misk_cart');
        if (saved) {
            try {
                cart = JSON.parse(saved);
                renderCart();
            } catch(e) { console.error("خطأ في تحميل السلة", e); }
        }
    }

    // === عرض المنتجات في الأقسام ===
    function renderProductGrid(containerId, products) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = products.map(p => `
            <div class="card" data-name="${p.name}" data-price="${p.price}" data-img="${p.img}">
                <span class="badge-left">${p.badge}</span>
                <span class="badge-right">${p.badge2}</span>
                <div class="img"><img src="${p.img}" alt="${p.name}" onerror="this.src='https://placehold.co/200x200?text=Misk'"></div>
                <div class="content"><div class="info">${p.name}</div><div class="price">${p.price.toLocaleString()} جنيه</div></div>
            </div>
        `).join('');
        document.querySelectorAll(`#${containerId} .card`).forEach(card => {
            card.addEventListener('click', (e) => {
                if(e.target.closest('.badge-left') || e.target.closest('.badge-right')) return;
                const name = card.getAttribute('data-name');
                const price = parseInt(card.getAttribute('data-price'));
                openCustomizeModal({ name, basePrice: price });
            });
        });
    }

    // === مودال التخصيص ===
    function openCustomizeModal(product) {
        currentCustomProduct = product;
        selectedSize = null; selectedShape = null; selectedConc = null;
        currentStep = 1;
        if (!activeModal) {
            activeModal = document.createElement('div');
            activeModal.className = 'customize-modal';
            activeModal.id = 'customizeModal';
            activeModal.innerHTML = `
                <div class="modal-container">
                    <div class="modal-header"><h3>تخصيص العطر</h3><button class="close-modal" id="closeCustomModal"><i class="fas fa-times"></i></button></div>
                    <div class="product-preview" id="customModalPreview"></div>
                    <div id="customModalStepContent"></div>
                    <button class="back-step" id="customBackBtn" style="display: none;"><i class="fas fa-arrow-right"></i> العودة للخطوة السابقة</button>
                </div>
            `;
            document.body.appendChild(activeModal);
            document.getElementById('closeCustomModal').addEventListener('click', () => activeModal.classList.remove('active'));
            document.getElementById('customBackBtn').addEventListener('click', () => {
                if (currentStep === 2) { currentStep = 1; renderModalStep(); }
                else if (currentStep === 3) { currentStep = 2; renderModalStep(); }
            });
        }
        renderModalStep();
        activeModal.classList.add('active');
    }

    function computeCurrentPrice() {
        if (!currentCustomProduct) return 0;
        let add = (selectedSize ? sizeAdd[selectedSize] : 0) + (selectedShape ? shapeAdd[selectedShape] : 0) + (selectedConc ? concAdd[selectedConc] : 0);
        return currentCustomProduct.basePrice + add;
    }

    function renderModalStep() {
        if (!currentCustomProduct) return;
        const preview = document.getElementById('customModalPreview');
        const stepDiv = document.getElementById('customModalStepContent');
        const backBtn = document.getElementById('customBackBtn');
        const priceNow = computeCurrentPrice();
        preview.innerHTML = `<div style="font-weight:bold;">🧴 ${currentCustomProduct.name}</div><div>السعر الأساسي: ${currentCustomProduct.basePrice.toLocaleString()} جنيه</div><div class="current-price-badge">💰 السعر الحالي: ${priceNow.toLocaleString()} جنيه</div>`;
        
        if (currentStep === 1) {
            stepDiv.innerHTML = `
                <div class="step-title">📏 1- اختر حجم الزجاجة:</div>
                <div class="option-group">
                    <button class="opt-size" data-size="30 مل">30 مل (بدون زيادة)</button>
                    <button class="opt-size" data-size="50 مل">50 مل + ${sizeAdd["50 مل"]} جنيه</button>
                    <button class="opt-size" data-size="100 مل">100 مل + ${sizeAdd["100 مل"]} جنيه</button>
                </div>
            `;
            backBtn.style.display = 'none';
            document.querySelectorAll('.opt-size').forEach(btn => {
                btn.removeEventListener('click', handleSizeClick);
                btn.addEventListener('click', handleSizeClick);
            });
        } else if (currentStep === 2) {
            stepDiv.innerHTML = `
                <div class="step-title">🏺 2- اختر شكل الزجاجة:</div>
                <div class="option-group">
                    <button class="opt-shape" data-shape="زجاجة كلاسيكية (مربعة)">كلاسيكية (بدون)</button>
                    <button class="opt-shape" data-shape="زجاجة عصرية (دائرية)">عصرية + ${shapeAdd["زجاجة عصرية (دائرية)"]} جنيه</button>
                    <button class="opt-shape" data-shape="زجاجة أنيقة (بيضاوية)">أنيقة + ${shapeAdd["زجاجة أنيقة (بيضاوية)"]} جنيه</button>
                </div>
            `;
            backBtn.style.display = 'flex';
            document.querySelectorAll('.opt-shape').forEach(btn => {
                btn.removeEventListener('click', handleShapeClick);
                btn.addEventListener('click', handleShapeClick);
            });
        } else if (currentStep === 3) {
            stepDiv.innerHTML = `
                <div class="step-title">⚖️ 3- نسبة الكحول / التركيز:</div>
                <div class="option-group">
                    <button class="opt-conc" data-conc="70% كحول / 30% عطر">70/30 (بدون)</button>
                    <button class="opt-conc" data-conc="50% كحول / 50% عطر">50/50 + ${concAdd["50% كحول / 50% عطر"]} جنيه</button>
                    <button class="opt-conc" data-conc="40% كحول / 60% عطر">40/60 + ${concAdd["40% كحول / 60% عطر"]} جنيه</button>
                </div>
                <hr><div style="text-align:center; margin-top:10px;">🔔 اضغط على خيار لإضافة المنتج إلى السلة</div>
            `;
            backBtn.style.display = 'flex';
            document.querySelectorAll('.opt-conc').forEach(btn => {
                btn.removeEventListener('click', handleConcClick);
                btn.addEventListener('click', handleConcClick);
            });
        }
    }

    function handleSizeClick(e) {
        selectedSize = e.currentTarget.getAttribute('data-size');
        currentStep = 2;
        renderModalStep();
    }
    function handleShapeClick(e) {
        selectedShape = e.currentTarget.getAttribute('data-shape');
        currentStep = 3;
        renderModalStep();
    }
    function handleConcClick(e) {
        selectedConc = e.currentTarget.getAttribute('data-conc');
        const finalPrice = computeCurrentPrice();
        addToCart(currentCustomProduct.name, selectedSize, selectedShape, selectedConc, finalPrice);
        activeModal.classList.remove('active');
    }

    function addToCart(productName, size, shape, concentration, price) {
        cart.push({ id: Date.now() + Math.random(), productName, size, shape, concentration, price });
        renderCart();
        saveCartToSession();
        openCartSidebar();
    }

    // الطلب الخاص
    document.getElementById('addCustomToCart')?.addEventListener('click', () => {
        const name = document.getElementById('customName').value.trim();
        if (!name) { alert("الرجاء إدخال اسم العطر"); return; }
        const size = document.getElementById('customSize').value.trim() || "غير محدد";
        const shape = document.getElementById('customShape').value.trim() || "غير محدد";
        const conc = document.getElementById('customConc').value.trim() || "غير محدد";
        cart.push({ id: Date.now() + Math.random(), productName: name, size, shape, concentration: conc, price: 0, isCustom: true });
        renderCart();
        saveCartToSession();
        openCartSidebar();
        document.getElementById('customName').value = '';
        document.getElementById('customSize').value = '';
        document.getElementById('customShape').value = '';
        document.getElementById('customConc').value = '';
    });

    function renderCart() {
        const container = document.getElementById('cartItemsList');
        const totalSpan = document.getElementById('cartTotalPrice');
        const countSpan = document.getElementById('cartCount');
        if (cart.length === 0) {
            container.innerHTML = '<div class="empty-cart">🛒 السلة فارغة</div>';
            totalSpan.innerText = '0 جنيه';
            countSpan.innerText = '0';
            return;
        }
        let html = '', total = 0;
        cart.forEach(item => {
            total += item.price;
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash-alt"></i> حذف</button>
                    <div class="item-title">✨ ${item.productName}</div>
                    <div class="item-details">📦 الحجم: ${item.size}</div>
                    <div class="item-details">🍾 الشكل: ${item.shape}</div>
                    <div class="item-details">⚖️ التركيز: ${item.concentration}</div>
                    <div class="item-price">💰 ${item.price === 0 ? 'يحدد لاحقاً' : item.price.toLocaleString() + ' جنيه'}</div>
                </div>
            `;
        });
        container.innerHTML = html;
        totalSpan.innerText = total === 0 ? 'يحدد لاحقاً' : total.toLocaleString() + ' جنيه';
        countSpan.innerText = cart.length;
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseFloat(btn.getAttribute('data-id'));
                cart = cart.filter(i => i.id !== id);
                renderCart();
                saveCartToSession();
            });
        });
    }

    function openCartSidebar() { document.getElementById('cartSidebar').classList.add('open'); document.getElementById('cartOverlay').classList.add('active'); }
    function closeCartSidebar() { document.getElementById('cartSidebar').classList.remove('open'); document.getElementById('cartOverlay').classList.remove('active'); }
    document.getElementById('cartIconBtn').addEventListener('click', openCartSidebar);
    document.getElementById('closeCartBtn').addEventListener('click', closeCartSidebar);
    document.getElementById('cartOverlay').addEventListener('click', closeCartSidebar);

    document.getElementById('checkoutWhatsappBtn').addEventListener('click', () => {
        if (cart.length === 0) { alert("السلة فارغة"); return; }
        let phone = document.getElementById('whatsappNumber').value.trim();
        if (!phone) phone = "201098626918";
        let cleaned = phone.replace(/[^0-9+]/g, '');
        if (!cleaned.startsWith('+')) { if (cleaned.startsWith('0')) cleaned = '20' + cleaned.substring(1); if (!cleaned.startsWith('20')) cleaned = '20' + cleaned; cleaned = '+' + cleaned; }
        let message = `🛍️ *طلب جديد من Misk*%0a%0a`;
        cart.forEach((item, idx) => {
            message += `✨ ${idx+1}- *${item.productName}*%0a   📦 الحجم: ${item.size}%0a   🍾 الشكل: ${item.shape}%0a   ⚖️ التركيز: ${item.concentration}%0a   💰 السعر: ${item.price === 0 ? 'يتم الاتفاق عليه' : item.price.toLocaleString() + ' جنيه'}%0a%0a`;
        });
        const total = cart.reduce((s,i)=> s+i.price,0);
        message += `💰 *الإجمالي الكلي: ${total === 0 ? 'سيتم تحديده' : total.toLocaleString() + ' جنيه'}*%0a`;
        window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank');
    });

    // القائمة المنسدلة
    const burger = document.querySelector(".burger-icon");
    const headerMenu = document.querySelector("header ul");
    burger.addEventListener("click", () => headerMenu.classList.toggle("show"));
    document.addEventListener("click", (e) => { if (!headerMenu.contains(e.target) && !burger.contains(e.target)) headerMenu.classList.remove("show"); });

    // تحميل المنتجات واستعادة السلة المحفوظة
    renderProductGrid('menProducts', menProducts);
    renderProductGrid('womenProducts', womenProducts);
    renderProductGrid('unisexProducts', unisexProducts);
    loadCartFromSession();  // استعادة السلة من sessionStorage