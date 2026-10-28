import { SPACE_GALLERY } from './gallery-data.js';

let activeCategory = 'all';
let searchQuery = '';
let currentModalIndex = -1;
let filteredItems = [...SPACE_GALLERY];

export function initGallery() {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  setupFilterTabs();
  setupSearch();
  setupLightbox();
  renderGallery();
}

function setupFilterTabs() {
  const tabs = document.querySelectorAll('.gallery-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category || 'all';
      filterAndRender();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('gallery-search');
  if (!searchInput) return;

  let timeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterAndRender();
    }, 200);
  });
}

function filterAndRender() {
  filteredItems = SPACE_GALLERY.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery) || 
      item.description.toLowerCase().includes(searchQuery) ||
      item.tag.toLowerCase().includes(searchQuery) ||
      item.year.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  renderGallery();
}

function renderGallery() {
  const container = document.getElementById('gallery-grid');
  const countBadge = document.getElementById('gallery-count-badge');
  const emptyState = document.getElementById('gallery-empty');

  if (!container) return;

  if (countBadge) {
    countBadge.textContent = `${filteredItems.length} Missions & Startups`;
  }

  if (filteredItems.length === 0) {
    container.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  container.style.display = 'grid';
  container.innerHTML = '';

  filteredItems.forEach((item, index) => {
    const card = document.createElement('div');
    const isFeatured = item.id === 'chandrayaan3-lander-moon' || item.id === 'mangalyaan-mars' || item.id === 'gaganyaan-tvd1' || item.id === 'skyroot-vikrams-launch';
    
    card.className = `gallery-card ${isFeatured ? 'featured' : ''}`;
    card.dataset.index = index;

    const imgSrc = item.localAvailable ? `/media/gallery/${item.localFile}` : item.remoteUrl;

    card.innerHTML = `
      <div class="gallery-img-wrap">
        <img 
          src="${imgSrc}" 
          alt="${item.title.replace(/"/g, '&quot;')}" 
          class="gallery-img" 
          loading="lazy" 
          onerror="if (this.src !== '${item.remoteUrl}') { this.src = '${item.remoteUrl}'; }"
        />
        <div class="gallery-overlay">
          <div class="gallery-chips">
            <span class="gallery-year-chip">${item.year}</span>
            <span class="gallery-cat-chip">${item.tag}</span>
          </div>
          <div class="gallery-info">
            <h4 class="gallery-title">${item.title}</h4>
            <p class="gallery-desc">${item.description}</p>
          </div>
          <div class="gallery-expand-btn" title="View Fullscreen & History">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openLightbox(index));
    container.appendChild(card);
  });
}

function setupLightbox() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;

  const closeBtn = document.getElementById('modal-close-btn');
  const prevBtn = document.getElementById('modal-prev-btn');
  const nextBtn = document.getElementById('modal-next-btn');
  const backdrop = modal.querySelector('.modal-backdrop');

  if (closeBtn) closeBtn.onclick = closeLightbox;
  if (backdrop) backdrop.onclick = closeLightbox;
  if (prevBtn) prevBtn.onclick = () => navigateLightbox(-1);
  if (nextBtn) nextBtn.onclick = () => navigateLightbox(1);

  document.addEventListener('keydown', (e) => {
    if (modal.style.display !== 'flex') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });
}

function openLightbox(index) {
  const modal = document.getElementById('gallery-modal');
  if (!modal || index < 0 || index >= filteredItems.length) return;

  currentModalIndex = index;
  updateLightboxContent();
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const modal = document.getElementById('gallery-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  if (filteredItems.length === 0) return;
  currentModalIndex = (currentModalIndex + dir + filteredItems.length) % filteredItems.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const item = filteredItems[currentModalIndex];
  if (!item) return;

  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalYear = document.getElementById('modal-year');
  const modalTag = document.getElementById('modal-tag');
  const modalDesc = document.getElementById('modal-desc');
  const modalSource = document.getElementById('modal-source');
  const modalCounter = document.getElementById('modal-counter');

  const imgSrc = item.localAvailable ? `/media/gallery/${item.localFile}` : item.remoteUrl;

  if (modalImg) {
    modalImg.src = imgSrc;
    modalImg.alt = item.title;
  }
  if (modalTitle) modalTitle.textContent = item.title;
  if (modalYear) modalYear.textContent = item.year;
  if (modalTag) modalTag.textContent = item.tag;
  if (modalDesc) modalDesc.textContent = item.description;
  if (modalCounter) modalCounter.textContent = `${currentModalIndex + 1} of ${filteredItems.length}`;

  if (modalSource) {
    modalSource.href = item.source;
    modalSource.textContent = `Official History / Source ↗`;
  }
}
