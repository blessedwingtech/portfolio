/**
 * Galerie Dynamique – PressTonik
 * Intégrée au template SnapFolio
 */

document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('gallery-container');
  const paginationUl = document.getElementById('pagination-ul');
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const loadingIndicator = document.getElementById('loading-indicator');

  const ITEMS_PER_PAGE = 12;
  let allImages = [];
  let filteredImages = [];
  let currentPage = 1;
  let isFetching = false;

  const API_URL = 'https://press.bittonik.com/api/gallery';

  async function fetchImages() {
    if (isFetching) return;
    isFetching = true;
    loadingIndicator.style.display = 'block';
    container.innerHTML = '';

    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();
      allImages = data || [];
      filteredImages = [...allImages];
      currentPage = 1;
      renderGallery();
    } catch (err) {
      console.error('Erreur chargement galerie:', err);
      container.innerHTML = `
        <div class="col-12 text-center no-images-message">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <p>Impossible de charger les images. Veuillez réessayer plus tard.</p>
        </div>
      `;
    } finally {
      loadingIndicator.style.display = 'none';
      isFetching = false;
    }
  }

  function renderGallery() {
    applySearch();

    const totalItems = filteredImages.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = Math.min(start + ITEMS_PER_PAGE, totalItems);
    const pageItems = filteredImages.slice(start, end);

    container.innerHTML = '';

    if (pageItems.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center no-images-message">
          <i class="bi bi-images"></i>
          <p>Aucune image ne correspond à votre recherche.</p>
        </div>
      `;
    } else {
      pageItems.forEach(img => {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 gallery-item';
        col.innerHTML = `
          <div class="portfolio-wrap">
            <img src="${img.url}" class="img-fluid" alt="${img.title || 'Image'}">
            <div class="portfolio-info">
              <h4>${img.title || 'Sans titre'}</h4>
              <p>${img.description || ''}</p>
              <div class="portfolio-links">
                <a href="${img.url}" data-gallery="galleryLightbox" class="glightbox" title="${img.title || ''}">
                  <i class="bi bi-plus-lg"></i>
                </a>
              </div>
            </div>
          </div>
        `;
        container.appendChild(col);
      });
    }

    renderPagination(totalPages);

    // Réinitialiser Glightbox (utilise la variable globale)
    if (typeof GLightbox !== 'undefined') {
       const lightbox = GLightbox({
          selector: '.glightbox',
          touchNavigation: true,
          loop: true,
          autoplayVideos: true
      });
    }
  }

  function renderPagination(totalPages) {
    paginationUl.innerHTML = '';
    if (totalPages <= 1) {
      paginationUl.innerHTML = `<li class="page-item disabled"><span class="page-link">1</span></li>`;
      return;
    }

    // Précédent
    const prev = document.createElement('li');
    prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prev.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>`;
    paginationUl.appendChild(prev);

    // Pages
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    if (endPage - startPage < 4) {
      if (startPage === 1) endPage = Math.min(totalPages, startPage + 4);
      else if (endPage === totalPages) startPage = Math.max(1, endPage - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
      paginationUl.appendChild(li);
    }

    // Suivant
    const next = document.createElement('li');
    next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    next.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>`;
    paginationUl.appendChild(next);

    paginationUl.querySelectorAll('a.page-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = parseInt(this.dataset.page);
        if (!isNaN(page) && page >= 1 && page <= totalPages && page !== currentPage) {
          currentPage = page;
          renderGallery();
          document.getElementById('gallery-section').scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  function applySearch() {
    const query = searchInput.value.trim().toLowerCase();
    filteredImages = query === ''
      ? [...allImages]
      : allImages.filter(img => {
          const title = (img.title || '').toLowerCase();
          const desc = (img.description || '').toLowerCase();
          return title.includes(query) || desc.includes(query);
        });
    if (currentPage > Math.ceil(filteredImages.length / ITEMS_PER_PAGE)) {
      currentPage = 1;
    }
  }

  let searchTimeout;
  searchInput.addEventListener('input', function() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentPage = 1;
      renderGallery();
    }, 300);
  });

  clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    currentPage = 1;
    renderGallery();
    searchInput.focus();
  });

  // Initialisation AOS (si pas déjà fait)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true
    });
  }

  fetchImages();
});