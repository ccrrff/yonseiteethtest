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

    // 3. Mega Menu (desktop)
    function initMegaMenu() {
        const mega = $('#mega-menu');
        if (!mega) return;

        const navItems = $$('.nav-item');
        const cats = $$('.mega-cat', mega);
        const panels = $$('.mega-panel', mega);
        const closeBtn = $('.mega-close', mega);

        function openMega() {
            mega.classList.add('open');
            mega.setAttribute('aria-hidden', 'false');
        }

        function closeMega() {
            mega.classList.remove('open');
            mega.setAttribute('aria-hidden', 'true');
            cats.forEach(c => c.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
        }

        function activateCat(catId) {
            cats.forEach(c => c.classList.toggle('active', c.dataset.cat === catId));
            panels.forEach(p => p.classList.toggle('active', p.dataset.panel === catId));
        }

        navItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const menuId = item.dataset.menu;
                if (menuId) {
                    openMega();
                    activateCat(menuId);
                }
            });
        });

        cats.forEach(cat => {
            cat.addEventListener('mouseenter', () => activateCat(cat.dataset.cat));
        });

        mega.addEventListener('mouseleave', closeMega);
        if (closeBtn) closeBtn.addEventListener('click', closeMega);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMega();
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
            document.body.classList.toggle('no-scroll', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            mobileMenu.setAttribute('aria-hidden', !isOpen);
        }

        function closeMenu() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.classList.remove('no-scroll');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
        }

        hamburger.addEventListener('click', toggleMenu);
        $$('.mobile-link', mobileMenu).forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
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

    // 7. Bento Grid Hover
    function initBentoHover() {
        const cards = $$('.bento-card');
        if (!cards.length) return;

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => card.classList.add('card-hover'));
            card.addEventListener('mouseleave', () => card.classList.remove('card-hover'));
        });
    }

    // 8. FAB Cluster (hover on desktop, tap on mobile)
    function initFAB() {
        const cluster = $('#fab-cluster');
        if (!cluster) return;

        const mainBtn = cluster.querySelector('.fab-main');
        if (!mainBtn) return;

        // Touch fallback for devices without hover
        const hasHover = window.matchMedia('(hover: hover)').matches;
        if (!hasHover) {
            mainBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                cluster.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!cluster.contains(e.target)) cluster.classList.remove('open');
            });
        }
    }

    // 8b. Header CTA dropdown (tap fallback for mobile)
    function initHeaderCTA() {
        const wrap = $('.header-cta-wrap');
        if (!wrap) return;

        const hasHover = window.matchMedia('(hover: hover)').matches;
        if (!hasHover) {
            const ctaBtn = wrap.querySelector('.header-cta');
            if (!ctaBtn) return;

            ctaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                wrap.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!wrap.contains(e.target)) wrap.classList.remove('open');
            });
        }
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

    // 10. Anchor Scroll
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
        initBentoHover();
        initFAB();
        initHeaderCTA();
        initForm();
        initAnchors();
    });
})();
