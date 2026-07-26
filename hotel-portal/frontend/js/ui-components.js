/* ui-components.js */


document.addEventListener('DOMContentLoaded', () => {
    
    // 🖤 Professional Dark Footer Automatic Injection Engine
    function injectUIComponents() {
        
        // 🎨 Footer Specific CSS Core Styles Matrix
        const footerStyles = `
            <style>
                :root {
                    --gold-theme: #d4af37;
                    --footer-bg: #0a0a0a;
                    --text-muted: #aeaeae;
                }

                .pro-footer {
                    background: var(--footer-bg) !important;
                    color: var(--text-muted) !important;
                    padding: 80px 5% 30px !important;
                    font-family: 'DM Sans', sans-serif !important;
                    font-size: 0.9rem !important;
                    border-top: 1px solid rgba(212, 175, 55, 0.1) !important;
                    clear: both;
                    position: relative;
                    z-index: 99;
                }

                .footer-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 40px;
                    max-width: 1200px;
                    margin: 0 auto 60px;
                }

                .footer-col .footer-brand-logo {
                    font-family: 'Playfair Display', serif;
                    font-size: 2rem;
                    color: var(--gold-theme);
                    text-decoration: none;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    margin-bottom: 15px;
                    display: inline-block;
                }

                .footer-col h3 {
                    font-family: 'Playfair Display', serif !important;
                    color: #ffffff !important;
                    font-size: 1.3rem !important;
                    margin-bottom: 25px !important;
                    position: relative !important;
                    font-weight: 600 !important;
                }

                .footer-col h3::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 35px;
                    height: 2px;
                    background: var(--gold-theme);
                }

                .footer-col p {
                    line-height: 1.8 !important;
                    color: var(--text-muted) !important;
                }

                .footer-links {
                    list-style: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }

                .footer-links li {
                    margin-bottom: 12px !important;
                }

                .footer-links a {
                    color: var(--text-muted) !important;
                    text-decoration: none !important;
                    transition: all 0.3s ease !important;
                    display: inline-block !important;
                }

                .footer-links a:hover {
                    color: var(--gold-theme) !important;
                    transform: translateX(5px) !important;
                }

                .contact-info {
                    list-style: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                }

                .contact-info li {
                    margin-bottom: 15px !important;
                    display: flex !important;
                    align-items: flex-start !important;
                    gap: 12px !important;
                    line-height: 1.6 !important;
                }

                .contact-info i {
                    color: var(--gold-theme) !important;
                    margin-top: 4px !important;
                }

                .footer-socials {
                    display: flex !important;
                    gap: 15px !important;
                    margin-top: 20px !important;
                }

                .footer-socials a {
                    width: 38px !important;
                    height: 38px !important;
                    border-radius: 50% !important;
                    background: rgba(255,255,255,0.03) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    color: #ffffff !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    transition: all 0.3s ease !important;
                    text-decoration: none !important;
                }

                .footer-socials a:hover {
                    background: var(--gold-theme) !important;
                    color: #000000 !important;
                    transform: translateY(-3px) !important;
                }

                .footer-bottom {
                    border-top: 1px solid rgba(255,255,255,0.06) !important;
                    padding-top: 30px !important;
                    text-align: center !important;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    flex-wrap: wrap !important;
                    gap: 15px !important;
                    font-size: 0.85rem !important;
                }

                .footer-bottom p {
                    color: #777777 !important;
                    margin: 0 !important;
                }

                .footer-bottom-links {
                    display: flex !important;
                    gap: 20px !important;
                }

                .footer-bottom-links a {
                    color: #777777 !important;
                    text-decoration: none !important;
                    transition: color 0.3s ease !important;
                }

                .footer-bottom-links a:hover {
                    color: var(--gold-theme) !important;
                }
            </style>
        `;

        // 🏗️ Premium Layout Global Markup Matrix
        const footerHtml = `
            <footer class="pro-footer">
                <div class="footer-grid">
                    <div class="footer-col">
                        <a href="index.html" class="footer-brand-logo">Grand Palace</a>
                        <p>Redefining ultra-luxury hotel hospitality management since 2022. Providing unmatched elite accommodation with integrated cloud framework processing infrastructure.</p>
                        <div class="footer-socials">
                            <a href="#"><i class="fa-brands fa-whatsapp"></i></a>
                            <a href="#"><i class="fa-brands fa-facebook-f"></i></a>
                            <a href="#"><i class="fa-brands fa-instagram"></i></a>
                            <a href="#"><i class="fa-brands fa-linkedin-in"></i></a>
                        </div>
                    </div>
                    <div class="footer-col">
                        <h3>Quick Navigation</h3>
                        <ul class="footer-links">
                            <li><a href="index.html">Home Properties</a></li>
                            <li><a href="browse-rooms.html">Luxury Suites</a></li>
                            <li><a href="room-service.html">Gourmet Dining</a></li>
                            <li><a href="about.html">Our Heritage</a></li>
                            <li><a href="contact.html">Support Concierge</a></li>
                        </ul>
                    </div>
                    <div class="footer-col">
                        <h3>Contact Concierge</h3>
                        <ul class="contact-info">
                            <li><i class="fa-solid fa-location-dot"></i>Street-123 Grand Palace Road, Karachi, Pakistan</li>
                            <li><i class="fa-solid fa-phone"></i>0311-23344456</li>
                            <li><i class="fa-solid fa-envelope"></i>info@grandpalace.com</li>
                        </ul>
                    </div>
                </div>
                <div class="footer-bottom">
                    <p>&copy; 2026 Grand Palace Hotel. All rights engineering reserved.</p>
                    <div class="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms & Conditions</a>
                        <a href="#">Cookies Setup</a>
                    </div>
                </div>
            </footer>
        `;

        // Style and Structure injection layer
        document.head.insertAdjacentHTML('beforeend', footerStyles);
        document.body.insertAdjacentHTML('beforeend', footerHtml);
    }

    // 🔄 Smooth CSS Translate Slider Control Matrix
    window.initializeCarousel = function(carouselId) {
        const carousel = document.getElementById(carouselId);
        if (!carousel) return;

        const carouselInner = carousel.querySelector('.carousel-inner');
        const carouselItems = carousel.querySelectorAll('.carousel-item');
        const prevBtn = carousel.querySelector('.carousel-control.prev');
        const nextBtn = carousel.querySelector('.carousel-control.next');
        let currentIndex = 0;
        let autoSlideTimer;

        function updateCarousel() {
            if (carouselInner) {
                carouselInner.style.transform = `translateX(${-currentIndex * 100}%)`;
            }
        }

        function nextSlide() {
            currentIndex = (currentIndex === carouselItems.length - 1) ? 0 : currentIndex + 1;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex === 0) ? carouselItems.length - 1 : currentIndex - 1;
            updateCarousel();
        }

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoSlide();
            });

            nextBtn.addEventListener('click', () => {
                nextSlide();
                resetAutoSlide();
            });
        }

        function startAutoSlide() {
            autoSlideTimer = setInterval(nextSlide, 5000);
        }

        function resetAutoSlide() {
            clearInterval(autoSlideTimer);
            startAutoSlide();
        }

        startAutoSlide();
    };

    // Initialize Component Scripts
    injectUIComponents();

    if (document.getElementById('mainCarousel')) {
        initializeCarousel('mainCarousel');
    }
});


