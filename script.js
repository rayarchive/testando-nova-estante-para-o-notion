/* =======================================================
   LÓGICA DA ESTANTE — normalmente não precisa mexer aqui.
   Para adicionar/remover livros, edite o arquivo livros.js
======================================================= */

// Escala: quantos pixels equivale 1 cm. Aumente para livros maiores.
const PIXELS_PER_CM = 5;

// Escala: quantas vezes maior que a lombada real o preview de zoom fica.
const PREVIEW_SCALE = 8;

// Ordena alfabeticamente e por volume, ignorando entradas incompletas
const livros = MEUS_LIVROS
    .filter(b => b && b.series && b.url)
    .slice()
    .sort((a, b) => {
        const sa = a.series.toLowerCase();
        const sb = b.series.toLowerCase();
        if (sa < sb) return -1;
        if (sa > sb) return 1;
        return (a.vol || 0) - (b.vol || 0);
    });

function renderShelf() {
    const rows = document.querySelectorAll('.shelf-row');
    rows.forEach(r => r.innerHTML = '');

    // Largura real da prateleira (mantém a responsividade no Notion)
    const rowWidth = rows[0].offsetWidth - 2;

    let currentRow = 0;
    let currentWidthUsed = 0;

    livros.forEach(book => {
        const heightPx = (book.h_cm || 19) * PIXELS_PER_CM;
        const widthPx = (book.w_cm || 1.5) * PIXELS_PER_CM;

        // Se não couber na prateleira atual, pula para a próxima
        if (currentWidthUsed + widthPx > rowWidth) {
            currentRow++;
            currentWidthUsed = 0;
        }

        if (!rows[currentRow]) return;

        let bookEl;
        if (book.link) {
            bookEl = document.createElement('a');
            bookEl.className = 'book-link';
            bookEl.href = book.link.startsWith('http') ? book.link : 'https://' + book.link;
            bookEl.target = '_blank';
            bookEl.rel = 'noopener';
        } else {
            bookEl = document.createElement('div');
            bookEl.className = 'book';
        }

        bookEl.style.backgroundImage = `url('${book.url.replace(/\s/g, '%20')}')`;
        bookEl.style.height = `${heightPx}px`;
        bookEl.style.width = `${widthPx}px`;

        const displayVol = book.vol > 0 ? ` #${book.vol}` : '';
        const title = `${book.series}${displayVol}`;
        bookEl.setAttribute('data-title', title);

        attachZoom(bookEl, book, title, widthPx, heightPx);

        rows[currentRow].appendChild(bookEl);
        currentWidthUsed += widthPx + 1; // +1 da margem
    });
}

// --- ZOOM AO PASSAR O MOUSE ---
const preview = document.getElementById('zoom-preview');
const previewImg = document.getElementById('zoom-img');

function movePreview(e) {
    const box = preview.getBoundingClientRect();
    let x = e.clientX + 20;
    let y = e.clientY - box.height / 2;

    // Não deixa o preview sair da tela
    if (x + box.width > window.innerWidth - 8) x = e.clientX - box.width - 20;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    if (y + box.height > window.innerHeight - 8) y = window.innerHeight - box.height - 8;

    preview.style.left = `${x}px`;
    preview.style.top = `${y}px`;
}

function attachZoom(el, book, title, widthPx, heightPx) {
    el.addEventListener('mouseenter', (e) => {
        previewImg.src = book.url.replace(/\s/g, '%20');
        previewImg.alt = '';

        previewImg.style.width = `${widthPx * PREVIEW_SCALE}px`;
        previewImg.style.height = `${heightPx * PREVIEW_SCALE}px`;

        preview.classList.add('visible');
        movePreview(e);
    });

    el.addEventListener('mousemove', movePreview);

    el.addEventListener('mouseleave', () => {
        preview.classList.remove('visible');
    });
}

window.addEventListener('resize', renderShelf);
window.addEventListener('load', renderShelf);
renderShelf();
