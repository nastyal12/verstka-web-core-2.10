// main.js (module, для npm + bundler)
import Swiper from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';

(function() {
    const MOBILE_BREAK = 480;
    let swiper = null;

    document.addEventListener('DOMContentLoaded', () => {
        const list = document.querySelector('.brands-list');
        const btn = document.querySelector('.toggle-btn');

        console.log('brands init', { list: !!list, btn: !!btn, width: window.innerWidth });

        if (!list) {
            console.error('brands-list не найдена. Проверь класс в разметке.');
            return;
        }

        // Вычислим "свернутую" высоту (2 ряда)
        const rowsToShow = 2;
        const gap = parseFloat(getComputedStyle(list).gap) || parseFloat(getComputedStyle(list).rowGap) || 15;
        const firstItem = list.querySelector('.brand') || list.querySelector('.swiper-slide');
        const itemH = firstItem ? Math.round(firstItem.getBoundingClientRect().height) : 80;
        const collapsedPx = Math.round((itemH + gap) * rowsToShow);
        list.dataset.collapsedHeight = String(collapsedPx);

        // Кнопка — один обработчик
        if (btn) {
            btn.addEventListener('click', () => {
                if (list.classList.contains('open')) {
                    collapse(list, btn);
                } else {
                    expand(list, btn);
                }
            });
        } else {
            console.warn('toggle-btn не найдена — кнопка отсутствует в DOM или класс другой.');
        }

        // Ресайз — инициализация/уничтожение swiper и корректная desktop/mobile логика
        let rt;
        window.addEventListener('resize', () => {
            clearTimeout(rt);
            rt = setTimeout(handleResize, 120);
        });

        // стартовая инициализация
        handleResize();

        function handleResize() {
            const w = window.innerWidth;
            console.log('handleResize', w);
            if (w <= MOBILE_BREAK) {
                // mobile
                if (btn) btn.style.display = 'none';
                // уничтожим desktop-состояние
                list.classList.remove('open');
                list.style.maxHeight = '';
                // инициализируем swiper, если не инициализирован
                if (!swiper) {
                    swiper = new Swiper('.brands-swiper', {
                        modules: [Pagination],
                        slidesPerView: 'auto',
                        spaceBetween: 12,
                        pagination: { el: '.swiper-pagination', clickable: true },
                    });
                    console.log('swiper инициализирован');
                }
            } else {
                // desktop
                if (btn) {
                    btn.style.display = '';
                    btn.textContent = 'Показать все';
                }
                // уничтожаем swiper если был
                if (swiper) {
                    swiper.destroy(true, true);
                    swiper = null;
                    console.log('swiper уничтожен');
                    // очистим возможные инлайн-стили, которые оставил swiper
                    const wrapper = document.querySelector('.brands-swiper .swiper-wrapper');
                    if (wrapper) wrapper.style.transform = '';
                    document.querySelectorAll('.brands-swiper .swiper-slide').forEach(s => s.style.width = '');
                }
                // ставим свернутую высоту
                if (!list.classList.contains('open')) {
                    list.style.maxHeight = list.dataset.collapsedHeight + 'px';
                } else {
                    // если открыт – оставляем открытым
                    list.style.maxHeight = 'none';
                    if (btn) btn.textContent = 'Скрыть';
                }
            }
        }

        function expand(listEl, btnEl) {
            // поставим текущую высоту, чтобы анимация пошла
            listEl.style.maxHeight = listEl.scrollHeight + 'px';
            // пометим как open
            requestAnimationFrame(() => {
                listEl.classList.add('open');
                if (btnEl) btnEl.textContent = 'Скрыть';
                // после окончания анимации уберём numeric max-height, чтобы элемент мог изменять размер
                const onEnd = (ev) => {
                    if (ev.propertyName === 'max-height') {
                        listEl.style.maxHeight = 'none';
                        listEl.removeEventListener('transitionend', onEnd);
                    }
                };
                listEl.addEventListener('transitionend', onEnd);
            });
        }

        function collapse(listEl, btnEl) {
            // если сейчас maxHeight = none, сначала запишем актуальную высоту, чтобы корректно анимировать
            if (getComputedStyle(listEl).maxHeight === 'none' || !getComputedStyle(listEl).maxHeight) {
                listEl.style.maxHeight = listEl.scrollHeight + 'px';
            }
            // форсируем reflow
            // eslint-disable-next-line no-unused-expressions
            listEl.offsetHeight;
            listEl.classList.remove('open');
            listEl.style.maxHeight = (listEl.dataset.collapsedHeight || '240') + 'px';
            if (btnEl) btnEl.textContent = 'Показать все';
        }
    });
})();