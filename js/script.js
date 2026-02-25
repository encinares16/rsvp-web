import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyCjp0DvbPWSO9PJCscO2PZDHmYCOxBfoa8",
      authDomain: "rsvp-app-cafd2.firebaseapp.com",
      projectId: "rsvp-app-cafd2",
      storageBucket: "rsvp-app-cafd2.firebasestorage.app",
      messagingSenderId: "1046629958084",
      appId: "1:1046629958084:web:23772b022b2b3dc8a9a491"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // ── Navbar scroll ──────────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
      const navbar = document.getElementById('navbar');
      navbar.classList.toggle('nav-scrolled', window.scrollY > 20);
    });

    // ── Mobile menu ────────────────────────────────────────────────────────────
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIconOpen = document.getElementById('menuIconOpen');
    const menuIconClose = document.getElementById('menuIconClose');
    let menuOpen = false;

    mobileMenuBtn.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      menuIconOpen.classList.toggle('hidden', menuOpen);
      menuIconClose.classList.toggle('hidden', !menuOpen);
    });

    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
      });
    });

    // ── Guest count ────────────────────────────────────────────────────────────
    let guestCount = 1;
    const guestCountDisplay = document.getElementById('guestCountDisplay');
    const guestCountSection = document.getElementById('guestCountSection');

    document.getElementById('guestMinus').addEventListener('click', () => {
      guestCount = Math.max(1, guestCount - 1);
      guestCountDisplay.textContent = guestCount;
    });

    document.getElementById('guestPlus').addEventListener('click', () => {
      guestCount = Math.min(4, guestCount + 1);
      guestCountDisplay.textContent = guestCount;
    });

    // Show/hide guest count section based on attendance
    document.querySelectorAll('input[name="attending"]').forEach(radio => {
      radio.addEventListener('change', () => {
        guestCountSection.style.display = radio.value === 'yes' ? 'block' : 'none';
      });
    });

    // ── RSVP Submit — open confirmation modal ─────────────────────────────────
    document.getElementById('submitRsvpBtn').addEventListener('click', () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const attendingEl = document.querySelector('input[name="attending"]:checked');
      const errorEl = document.getElementById('rsvp-error');

      if (!name || !email || !attendingEl) {
        errorEl.textContent = 'Please fill in all required fields and indicate your attendance.';
        errorEl.style.display = 'block';
        return;
      }

      errorEl.style.display = 'none';

      // Populate modal fields
      document.getElementById('modal-name').textContent = name;
      const statusEl = document.getElementById('modal-status');
      if (attendingEl.value === 'yes') {
        statusEl.textContent = 'Joyfully Accepts';
        statusEl.className = 'modal-field-value modal-status-yes';
      } else {
        statusEl.textContent = 'Regretfully Declines';
        statusEl.className = 'modal-field-value modal-status-no';
      }

      // Open modal
      document.getElementById('confirmModal').classList.add('open');
    });

    // ── Close modal helpers ────────────────────────────────────────────────────
    function closeModal() {
      document.getElementById('confirmModal').classList.remove('open');
    }

    // Close on backdrop click
    document.getElementById('confirmModal').addEventListener('click', e => {
      if (e.target === e.currentTarget) closeModal();
    });

    // ── localStorage helpers ───────────────────────────────────────────────────
    const LS_DRAFT = 'rsvp_draft';
    const LS_SUBMITTED = 'rsvp_submitted';

    function getDraftData() {
      return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        attending: document.querySelector('input[name="attending"]:checked')?.value || null,
        guestCount,
        note: document.getElementById('note').value.trim(),
      };
    }

    function restoreDraft(draft) {
      if (draft.name)  document.getElementById('name').value  = draft.name;
      if (draft.email) document.getElementById('email').value = draft.email;
      if (draft.phone) document.getElementById('phone').value = draft.phone;
      if (draft.note)  document.getElementById('note').value  = draft.note;
      if (draft.attending) {
        const radio = document.querySelector(`input[name="attending"][value="${draft.attending}"]`);
        if (radio) {
          radio.checked = true;
          guestCountSection.style.display = draft.attending === 'yes' ? 'block' : 'none';
        }
      }
      if (draft.guestCount) {
        guestCount = draft.guestCount;
        guestCountDisplay.textContent = guestCount;
      }
    }

    function showDraftToast(msg) {
      const existing = document.getElementById('rsvp-draft-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'rsvp-draft-toast';
      toast.textContent = msg;
      Object.assign(toast.style, {
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        background: '#2C1F14', color: '#E8C98A',
        fontFamily: "'Jost', sans-serif", fontWeight: '300', fontSize: '0.75rem',
        letterSpacing: '0.1em', padding: '0.75rem 1.5rem',
        border: '1px solid #C9A84C', zIndex: '9999',
        opacity: '0', transition: 'opacity 0.3s',
        whiteSpace: 'nowrap'
      });
      document.body.appendChild(toast);
      requestAnimationFrame(() => { toast.style.opacity = '1'; });
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 3200);
    }

    // ── Success message by attendance ──────────────────────────────────────────
    const MESSAGES = {
      yes: "We have received your RSVP and are so thrilled to celebrate this special day with you. We cannot wait to see you there! 🤗✨💖",
      no:  "We completely understand and will miss you dearly. Thank you for letting us know - you will be in our hearts on our special day. 🤗✨💖"
    };

    function showSuccess(attending) {
      document.getElementById('rsvp-success-msg').textContent = MESSAGES[attending] || MESSAGES.yes;
      document.getElementById('rsvp-form-area').style.display = 'none';
      document.getElementById('rsvp-success').style.display = 'block';
    }

    // ── On page load: restore state ────────────────────────────────────────────
    (function onLoad() {
      const submitted = localStorage.getItem(LS_SUBMITTED);
      if (submitted) {
        // Already submitted — show success, hide form
        showSuccess(submitted);
        return;
      }

      const saved = localStorage.getItem(LS_DRAFT);
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          restoreDraft(draft);
          showDraftToast('Draft restored — finish sending your RSVP when you\'re ready.');
        } catch (e) { localStorage.removeItem(LS_DRAFT); }
      }
    })();

    // ── Resubmit button (inside success state) ─────────────────────────────────
    document.getElementById('rsvp-resubmit-btn').addEventListener('click', () => {
      localStorage.removeItem(LS_SUBMITTED);
      localStorage.removeItem(LS_DRAFT);
      // Reset form fields
      document.getElementById('name').value = '';
      document.getElementById('email').value = '';
      document.getElementById('phone').value = '+63 ';
      document.getElementById('note').value = '';
      document.querySelectorAll('input[name="attending"]').forEach(r => r.checked = false);
      guestCount = 1;
      guestCountDisplay.textContent = '1';
      guestCountSection.style.display = 'none';
      document.getElementById('rsvp-success').style.display = 'none';
      document.getElementById('rsvp-form-area').style.display = 'block';
    });

    // ── Save for Later ─────────────────────────────────────────────────────────
    document.getElementById('saveLaterBtn').addEventListener('click', () => {
      localStorage.setItem(LS_DRAFT, JSON.stringify(getDraftData()));
      closeModal();
      showDraftToast('Draft saved — we\'ll restore it when you return.');
    });

    // ── Send Now — actual Firebase submission ──────────────────────────────────
    document.getElementById('sendNowBtn').addEventListener('click', async () => {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const note = document.getElementById('note').value.trim();
      const attendingEl = document.querySelector('input[name="attending"]:checked');
      const errorEl = document.getElementById('rsvp-error');

      const sendBtn = document.getElementById('sendNowBtn');
      sendBtn.textContent = 'Sending…';
      sendBtn.disabled = true;
      sendBtn.style.opacity = '0.7';

      try {
        await addDoc(collection(db, 'rsvps'), {
          name,
          email,
          phone,
          attending: attendingEl.value,
          guestCount: attendingEl.value === 'yes' ? guestCount : 0,
          note,
          archived: false,
          submittedAt: serverTimestamp()
        });

        // Persist submitted state (store attendance for correct message on reload), clear any draft
        localStorage.setItem(LS_SUBMITTED, attendingEl.value);
        localStorage.removeItem(LS_DRAFT);

        closeModal();
        showSuccess(attendingEl.value);
      } catch (err) {
        console.error('Firebase error:', err);
        closeModal();
        errorEl.textContent = 'Something went wrong. Please try again or contact us directly.';
        errorEl.style.display = 'block';
        sendBtn.textContent = 'Send Now';
        sendBtn.disabled = false;
        sendBtn.style.opacity = '1';
      }
    });

    // ── FAQ Accordion ──────────────────────────────────────────────────────────
    const faqs = [
      { q: 'Color and dress code guests should wear?', a: 'Formal / Black-tie optional. Our wedding palette centers around champagne, soft gold, white, and beige. We would be thrilled to see guests embrace these tones, but any elegant formal attire is welcome.' },
      { q: 'Is there parking available?', a: 'Yes! Parking is available at Gazebo for all guests. ' },
      // { q: 'Are children welcome?', a: 'We adore your little ones, however we have planned an intimate adults-only evening. We hope you will enjoy the opportunity to celebrate with us and get a lovely night out! If nursing infants need to attend, please reach out to us directly.' },
      // { q: 'What about dietary restrictions?', a: 'We will accommodate all dietary needs with love. Please note allergies and preferences in your RSVP message. We will have vegetarian, vegan, gluten-free, and nut-free options available. Our caterer will contact you if additional details are needed.' },
      { q: 'Can I take photos during the ceremony?', a: 'We kindly ask guests to put phones and cameras away so everyone can be fully present. Our talented photographer will capture every moment. After the ceremony, please snap away at the reception!' },
      { q: 'When is the RSVP deadline?', a: 'Please RSVP by March 15, 2026. We would love to have your response as early as possible so we can finalize seating and catering arrangements. Late RSVPs may not be accommodated.' },
    ];

    const faqAccordion = document.getElementById('faq-accordion');
    faqs.forEach((faq, i) => {
      const item = document.createElement('div');
      item.className = 'faq-item';
      item.innerHTML = `
        <button class="faq-question" data-index="${i}">
          <span>${faq.q}</span>
          <svg class="faq-chevron w-4 h-4 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        <div class="faq-answer">${faq.a}</div>
      `;
      faqAccordion.appendChild(item);

      const btn = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const chevron = item.querySelector('.faq-chevron');

      btn.addEventListener('click', () => {
        const isOpen = answer.style.display === 'block';
        answer.style.display = isOpen ? 'none' : 'block';
        chevron.classList.toggle('open', !isOpen);
      });
    });


// ═══════ GALLERY ═══════
    const galleryData = [
      { src: './assets/image1.jpg', label: 'Our Prenup', span: '' },
      { src: './assets/image2.jpg', label: 'Our Prenup', span: '' },
      { src: './assets/image3.jpg', label: 'Our Prenup', span: '' },
      { src: './assets/image4.jpg', label: 'Our Prenup', span: 'md:col-span-2' },
      { src: './assets/image5.jpg', label: 'Our Prenup', span: '' },
      { src: './assets/image6.jpg', label: 'Our Prenup', span: '' },
      // { src: './assets/image7.jpg', label: '😎 Groom and Bride', span: '' },
      // { src: './assets/image8.jpg', label: '😎 Groom and Bride', span: '' },
      // { src: './assets/image9.jpg', label: 'Our Prenup', span: '' },
      // { src: './assets/image10.jpg', label: 'Our Prenup', span: '' },
      // { src: './assets/image11.jpg', label: 'Our Prenup', span: '' },
      // { src: './assets/image12.jpg', label: 'Our Prenup', span: 'md:col-span-2' },
    ];

    const INITIAL_SHOW = 6;
    const galleryGrid = document.getElementById('gallery-grid');
    const seeMoreWrap = document.getElementById('see-more-wrap');
    const seeMoreBtn = document.getElementById('see-more-btn');

    let lightboxIndex = 0;

    function renderGallery() {
      galleryGrid.innerHTML = '';
      galleryData.forEach((photo, i) => {
        const isHidden = i >= INITIAL_SHOW;
        const div = document.createElement('div');
        div.className = `gallery-item${photo.span ? ' ' + photo.span : ''}${isHidden ? ' hidden-photo' : ''}`;
        div.style.height = '200px';
        div.dataset.index = i;
        div.innerHTML = `
          <img src="${photo.src}" alt="${photo.label}" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg,#EDE5D8,#E8C98A)'; this.parentElement.querySelector('.gallery-label').style.opacity=1;" />
          <div class="gallery-overlay"></div>
          <div class="gallery-label">
            <p class="font-serif text-sm font-light" style="color:#FAF6F0; font-style:italic;">${photo.label}</p>
          </div>`;
        div.addEventListener('click', () => openLightbox(i));
        galleryGrid.appendChild(div);
      });

      // Show "See More" button if there are hidden photos
      if (galleryData.length > INITIAL_SHOW) {
        seeMoreWrap.style.display = 'block';
      }
    }

    seeMoreBtn.addEventListener('click', () => {
      document.querySelectorAll('.gallery-item.hidden-photo').forEach(el => {
        el.classList.remove('hidden-photo');
      });
      seeMoreWrap.style.display = 'none';
    });

    // ═══════ LIGHTBOX ═══════
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbCaption = document.getElementById('lb-caption');
    const lbCounter = document.getElementById('lb-counter');
    const lbClose = document.getElementById('lb-close');
    const lbPrev = document.getElementById('lb-prev');
    const lbNext = document.getElementById('lb-next');

    function getVisibleIndices() {
      return galleryData.map((_, i) => i).filter(i => {
        const el = galleryGrid.querySelector(`[data-index="${i}"]`);
        return el && !el.classList.contains('hidden-photo');
      });
    }

    function openLightbox(index) {
      lightboxIndex = index;
      updateLightbox();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function updateLightbox() {
      const photo = galleryData[lightboxIndex];
      lbImg.src = photo.src;
      lbImg.alt = photo.label;
      lbCaption.textContent = photo.label;
      const visible = getVisibleIndices();
      const pos = visible.indexOf(lightboxIndex);
      lbCounter.textContent = `${pos + 1} / ${visible.length}`;
      lbPrev.style.opacity = pos === 0 ? '0.3' : '1';
      lbNext.style.opacity = pos === visible.length - 1 ? '0.3' : '1';
    }

    function lightboxPrev() {
      const visible = getVisibleIndices();
      const pos = visible.indexOf(lightboxIndex);
      if (pos > 0) { lightboxIndex = visible[pos - 1]; updateLightbox(); }
    }

    function lightboxNext() {
      const visible = getVisibleIndices();
      const pos = visible.indexOf(lightboxIndex);
      if (pos < visible.length - 1) { lightboxIndex = visible[pos + 1]; updateLightbox(); }
    }

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', lightboxPrev);
    lbNext.addEventListener('click', lightboxNext);

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    });

    // Touch swipe support
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) { dx < 0 ? lightboxNext() : lightboxPrev(); }
    });

    renderGallery();

    const phoneInput = document.getElementById("phone");

phoneInput.addEventListener("input", function (e) {
    let value = phoneInput.value.replace(/\D/g, ""); // remove non-digits
    
    // Remove leading 63 if user types it
    if (value.startsWith("63")) {
        value = value.substring(2);
    }

    // Limit to 10 digits
    value = value.substring(0, 10);

    let formatted = "+63 ";

    if (value.length > 0) {
        formatted += value.substring(0, 3);
    }
    if (value.length >= 4) {
        formatted += "-" + value.substring(3, 6);
    }
    if (value.length >= 7) {
        formatted += "-" + value.substring(6, 10);
    }

    phoneInput.value = formatted;
});

// Prevent deleting +63
phoneInput.addEventListener("keydown", function (e) {
    if (phoneInput.selectionStart <= 4 && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault();
    }
});

const emailInput = document.getElementById("email");

  emailInput.addEventListener("blur", function () {
    let value = emailInput.value.trim();

    if (value && !value.includes("@")) {
      emailInput.value = value + "@gmail.com";
    }
  });