(function() {
    'use strict';

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => [...c.querySelectorAll(s)];

    // 1. Scroll Reveal (IntersectionObserver)
    function initScrollReveal() {
        const items = $$('[data-animate]');
        if (!items.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const delay = el.dataset.delay;
                if (delay) {
                    setTimeout(() => el.classList.add('visible'), parseFloat(delay) * 1000);
                } else {
                    el.classList.add('visible');
                }
                observer.unobserve(el);
            });
        }, { threshold: 0.15 });

        items.forEach(item => observer.observe(item));
    }

    // 2. Header scroll state
    function initHeader() {
        const header = $('#main-header');
        if (!header) return;

        let ticking = false;
        const update = () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
            ticking = false;
        };

        update();
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        }, { passive: true });
    }

    // 3. Nav Dropdown (desktop hover)
    function initMegaMenu() {
        const navItems = $$('.nav-item');
        if (!navItems.length) return;

        let closeTimeout = null;

        function closeAll() {
            navItems.forEach(item => item.classList.remove('dropdown-open'));
        }

        const hoverMql = window.matchMedia('(hover: hover) and (pointer: fine)');

        function attachHoverListeners() {
            navItems.forEach(item => {
                const dropdown = item.querySelector('.nav-dropdown');
                if (!dropdown) return;

                function onEnter() {
                    if (!hoverMql.matches) return;
                    if (closeTimeout) { clearTimeout(closeTimeout); closeTimeout = null; }
                    navItems.forEach(other => { if (other !== item) other.classList.remove('dropdown-open'); });
                    item.classList.add('dropdown-open');
                }

                function onLeave() {
                    if (!hoverMql.matches) return;
                    closeTimeout = setTimeout(closeAll, 250);
                }

                item.addEventListener('mouseenter', onEnter);
                item.addEventListener('mouseleave', onLeave);
            });
        }

        attachHoverListeners();

        function positionDropdown(navItem, dropdown) {
            const rect = navItem.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 4) + 'px';
            dropdown.style.left = (rect.left + rect.width / 2 - dropdown.offsetWidth / 2) + 'px';
            // 화면 밖으로 나가지 않도록 보정
            const ddRect = dropdown.getBoundingClientRect();
            if (ddRect.left < 8) dropdown.style.left = '8px';
            if (ddRect.right > window.innerWidth - 8) dropdown.style.left = (window.innerWidth - dropdown.offsetWidth - 8) + 'px';
        }

        navItems.forEach(item => {
            const dropdown = item.querySelector('.nav-dropdown');
            if (!dropdown) return;

            // Click/touch toggle — always active so touch devices always work
            item.querySelector(':scope > a').addEventListener('click', (e) => {
                // On true hover+fine-pointer devices, let the link navigate normally
                if (hoverMql.matches) return;
                e.preventDefault();
                const isOpen = item.classList.contains('dropdown-open');
                closeAll();
                if (!isOpen) {
                    item.classList.add('dropdown-open');
                    positionDropdown(item, dropdown);
                }
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) closeAll();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeAll();
        });
    }

    // 4. Mobile Menu
    function initMobileMenu() {
        const hamburger = $('#hamburger');
        const mobileMenu = $('#mobile-menu');
        if (!hamburger || !mobileMenu) return;

        function toggleMenu() {
            const isOpen = hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('open', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);
            document.body.classList.toggle('no-scroll', isOpen);
        }

        function closeMenu() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll');
        }

        hamburger.addEventListener('click', toggleMenu);

        // Mobile nav accordion
        $$('.mobile-nav-toggle', mobileMenu).forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.closest('.mobile-nav-group');
                const isOpen = group.classList.contains('open');
                $$('.mobile-nav-group', mobileMenu).forEach(g => g.classList.remove('open'));
                if (!isOpen) group.classList.add('open');
            });
        });

        // Close menu on sub-link click
        $$('.mobile-nav-sub a', mobileMenu).forEach(link => {
            link.addEventListener('click', () => closeMenu());
        });

        $$('.mobile-link', mobileMenu).forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('tel:')) {
                    closeMenu();
                    return;
                }
                if (href && href !== '#') {
                    e.preventDefault();
                    closeMenu();
                    const target = $(href);
                    if (target) {
                        requestAnimationFrame(() => {
                            const header = $('#main-header');
                            const offset = header ? header.getBoundingClientRect().bottom + 16 : 0;
                            window.scrollTo({
                                top: target.getBoundingClientRect().top + window.scrollY - offset,
                                behavior: 'smooth'
                            });
                        });
                    }
                } else {
                    closeMenu();
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('open') &&
                !mobileMenu.contains(e.target) &&
                !hamburger.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // 5. FAQ Accordion
    function initFAQ() {
        const questions = $$('.faq-question');
        if (!questions.length) return;

        questions.forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.closest('.faq-item');
                if (!item) return;
                const answer = item.querySelector('.faq-answer');
                const inner = item.querySelector('.faq-answer-inner');
                const isActive = item.classList.contains('active');

                // Close all others
                $$('.faq-item.active').forEach(other => {
                    if (other === item) return;
                    other.classList.remove('active');
                    const otherAnswer = other.querySelector('.faq-answer');
                    const otherBtn = other.querySelector('.faq-question');
                    if (otherAnswer) otherAnswer.style.maxHeight = '0';
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                });

                // Toggle current
                if (isActive) {
                    item.classList.remove('active');
                    if (answer) answer.style.maxHeight = '0';
                    btn.setAttribute('aria-expanded', 'false');
                } else {
                    item.classList.add('active');
                    if (answer && inner) answer.style.maxHeight = inner.scrollHeight + 'px';
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // 6. Counter Animation (GSAP)
    function initCounters() {
        const nums = $$('.trust-num[data-target]');
        if (!nums.length || typeof gsap === 'undefined') return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.dataset.target);
                const isDecimal = el.hasAttribute('data-decimal');
                const obj = { val: 0 };

                gsap.to(obj, {
                    val: target,
                    duration: 1,
                    ease: 'power2.out',
                    snap: { val: isDecimal ? 0.1 : 1 },
                    onUpdate() {
                        el.textContent = isDecimal
                            ? obj.val.toFixed(1)
                            : Math.round(obj.val).toLocaleString();
                    }
                });

                observer.unobserve(el);
            });
        }, { threshold: 0.5 });

        nums.forEach(n => observer.observe(n));
    }

    // 7. Doctor Credentials Accordion (mobile only)
    function initDoctorAccordion() {
        const groups = $$('.cred-group');
        if (!groups.length) return;

        const mql = window.matchMedia('(max-width: 768px)');

        function setup(isMobile) {
            groups.forEach((group, i) => {
                const title = group.querySelector('.cred-title');
                if (!title) return;

                // Remove old listener by cloning
                const newTitle = title.cloneNode(true);
                title.parentNode.replaceChild(newTitle, title);

                if (isMobile) {
                    // Open first group by default
                    if (i === 0) group.classList.add('cred-open');
                    else group.classList.remove('cred-open');

                    newTitle.addEventListener('click', () => {
                        const isOpen = group.classList.contains('cred-open');
                        // Close all
                        groups.forEach(g => g.classList.remove('cred-open'));
                        // Toggle current
                        if (!isOpen) group.classList.add('cred-open');
                    });
                } else {
                    group.classList.remove('cred-open');
                }
            });
        }

        setup(mql.matches);
        mql.addEventListener('change', (e) => setup(e.matches));
    }

    // 7b. Bento Grid Hover
    function initBentoHover() {
        const cards = $$('.bento-card');
        if (!cards.length) return;

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('card-hover'));
            card.addEventListener('mouseleave', () => card.classList.remove('card-hover'));
        });
    }

    // 8. Floating Contact Widget (hover on desktop, tap on mobile)
    function initFAB() {
        const widget = $('#floating-contact');
        if (!widget) return;

        const trigger = widget.querySelector('.floating-trigger');
        if (!trigger) return;

        const hasHover = window.matchMedia('(hover: hover)').matches;
        if (!hasHover) {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                widget.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!widget.contains(e.target)) widget.classList.remove('open');
            });
        }
    }

    // 8b. Header CTA dropdown
    function initHeaderCTA() {
        const wrap = $('.header-cta-wrap');
        if (!wrap) return;

        const ctaBtn = wrap.querySelector('.header-cta');
        const dropdown = wrap.querySelector('.header-cta-dropdown');
        if (!ctaBtn || !dropdown) return;

        function positionDropdown() {
            const rect = ctaBtn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 4) + 'px';
            dropdown.style.left = (rect.left + rect.width / 2 - dropdown.offsetWidth / 2 - 180) + 'px';
        }

        const hasHover = window.matchMedia('(hover: hover)').matches;

        if (hasHover) {
            wrap.addEventListener('mouseenter', () => {
                positionDropdown();
                wrap.classList.add('open');
            });
            wrap.addEventListener('mouseleave', () => {
                wrap.classList.remove('open');
            });
            dropdown.addEventListener('mouseenter', () => {
                wrap.classList.add('open');
            });
            dropdown.addEventListener('mouseleave', () => {
                wrap.classList.remove('open');
            });
        } else {
            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                positionDropdown();
                wrap.classList.toggle('open');
            });
        }

        document.addEventListener('click', (e) => {
            if (!wrap.contains(e.target) && !dropdown.contains(e.target)) wrap.classList.remove('open');
        });
    }

    // 9. Consultation Form
    function initForm() {
        const form = $('#consultation-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = $('#cf-name');
            const phone = $('#cf-phone');
            const agree = $('#cf-agree');
            const submitBtn = form.querySelector('.btn-submit');

            if (!submitBtn || submitBtn.classList.contains('loading')) return;

            // Reset previous errors
            $$('.form-error', form).forEach(el => el.remove());

            let hasError = false;

            function showError(input, msg) {
                hasError = true;
                const err = document.createElement('span');
                err.className = 'form-error';
                err.textContent = msg;
                const parent = input.closest('.form-group') || input.closest('.form-checkbox');
                if (parent) parent.appendChild(err);
            }

            if (name && !name.value.trim()) showError(name, '이름을 입력해주세요.');
            if (phone && !phone.value.trim()) showError(phone, '연락처를 입력해주세요.');
            if (agree && !agree.checked) showError(agree, '개인정보 수집에 동의해주세요.');

            if (hasError) return;

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.classList.add('success');

                setTimeout(() => {
                    submitBtn.classList.remove('success');
                    submitBtn.disabled = false;
                    form.reset();
                }, 2000);
            }, 1500);
        });
    }

    // 11. Hero Slider (GSAP) with indicators
    function initHeroSlider() {
        const slides = $$('.hero-slider picture.slide-item');
        if (slides.length < 2 || typeof gsap === 'undefined') return;

        const indicatorWrap = $('#hero-indicators');
        let currentIndex = 0;
        let autoplayTimer = null;

        gsap.set(slides, { opacity: 0, zIndex: 0 });
        gsap.set(slides[0], { opacity: 1, zIndex: 1 });

        // Build indicators
        if (indicatorWrap) {
            slides.forEach((_, i) => {
                const btn = document.createElement('button');
                btn.className = 'hero-indicator' + (i === 0 ? ' active' : '');
                btn.setAttribute('aria-label', 'Slide ' + (i + 1));
                const fill = document.createElement('span');
                fill.className = 'hero-indicator-fill';
                btn.appendChild(fill);
                btn.addEventListener('click', () => goToSlide(i));
                indicatorWrap.appendChild(btn);
            });
        }

        const indicators = $$('.hero-indicator', indicatorWrap);

        function updateIndicators(index) {
            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === index);
                // Reset fill animation
                const fill = ind.querySelector('.hero-indicator-fill');
                if (fill) {
                    fill.style.animation = 'none';
                    fill.offsetHeight; // trigger reflow
                    fill.style.animation = '';
                }
            });
        }

        function goToSlide(nextIndex) {
            if (nextIndex === currentIndex) return;
            clearInterval(autoplayTimer);

            gsap.set(slides[nextIndex], { zIndex: 1 });
            gsap.to(slides[nextIndex], { opacity: 1, duration: 1.5, ease: 'power2.inOut' });
            gsap.set(slides[currentIndex], { zIndex: 0 });
            gsap.to(slides[currentIndex], { opacity: 0, duration: 1.5, ease: 'power2.inOut' });

            currentIndex = nextIndex;
            updateIndicators(currentIndex);
            startAutoplay();
        }

        function nextSlide() {
            goToSlide((currentIndex + 1) % slides.length);
        }

        function startAutoplay() {
            clearInterval(autoplayTimer);
            autoplayTimer = setInterval(nextSlide, 4000);
        }

        updateIndicators(0);
        startAutoplay();
    }

    // 12. Anchor Scroll
    function initAnchors() {
        $$('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                const target = $(href);
                if (!target) return;

                e.preventDefault();
                const header = $('#main-header');
                const offset = header ? header.getBoundingClientRect().bottom + 16 : 0;

                window.scrollTo({
                    top: target.getBoundingClientRect().top + window.scrollY - offset,
                    behavior: 'smooth'
                });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initScrollReveal();
        initHeader();
        initMegaMenu();
        initMobileMenu();
        initFAQ();
        initCounters();
        initDoctorAccordion();
        initBentoHover();
        initFAB();
        initHeaderCTA();
        initForm();
        initHeroSlider();
        initAnchors();
    });
})();
