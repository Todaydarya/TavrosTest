// ===== ЧАСТЬ 1: Рендеринг секции "Наши работы" =====
document.addEventListener('DOMContentLoaded', () => {
    const worksContainer = document.getElementById('works-container');
    
    if (worksContainer && typeof projectsDB !== 'undefined') {
        projectsDB.forEach(project => {
            const card = document.createElement('div');
            card.className = 'work-card';
            
            card.innerHTML = `
                <div class="work-image">Фото объекта</div>
                <h3>${project.name}</h3>
                <p class="location">📍 ${project.location}</p>
                <p>${project.description}</p>
            `;
            
            worksContainer.appendChild(card);
        });
    }
});

// ===== ЧАСТЬ 2: Модальное окно для просмотра изображений =====
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.querySelector('.modal-close');
    const productCards = document.querySelectorAll('.product-card');

    // Открытие модального окна при клике на карточку
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const img = this.querySelector('.product-image img');
            const title = this.querySelector('h3').textContent;
            
            if (img) {
                modal.style.display = 'block';
                modalImage.src = img.src;
                modalCaption.textContent = title;
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Закрытие по кнопке
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Закрытие по клику на фон
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Функция закрытия
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
});

// ===== ЧАСТЬ 3: Обработка формы и маска телефона =====
document.addEventListener('DOMContentLoaded', function () {
    const form       = document.getElementById('contactForm');
    const submitBtn  = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');
    const phoneInput = document.getElementById('phoneInput');

    if (!form) return;

    // ===== МАСКА ТЕЛЕФОНА =====
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let digits = e.target.value.replace(/\D/g, '');

            if (digits.startsWith('7') || digits.startsWith('8')) {
                digits = digits.substring(1);
            }

            digits = digits.substring(0, 10);

            let formatted = '+7';
            if (digits.length > 0) formatted += ' (' + digits.substring(0, 3);
            if (digits.length >= 3) formatted += ') ' + digits.substring(3, 6);
            if (digits.length >= 6) formatted += '-' + digits.substring(6, 8);
            if (digits.length >= 8) formatted += '-' + digits.substring(8, 10);

            e.target.value = formatted;
        });

        phoneInput.addEventListener('keypress', function (e) {
            if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
                e.preventDefault();
            }
        });
    }

    // ===== ОТПРАВКА ФОРМЫ =====
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const name  = document.getElementById('userName').value.trim();
        const phone = document.getElementById('phoneInput').value.trim();
        const email = document.getElementById('userEmail').value.trim();

        if (name.length < 2) {
            showStatus('Введите имя (минимум 2 символа)', 'error');
            return;
        }

        const phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length !== 11) {
            showStatus('Введите корректный номер телефона', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';
        hideStatus();

        const formData = new FormData();
        formData.append('user_name', name);
        formData.append('user_phone', phone);
        formData.append('user_email', email);

        // Проверка перед отправкой
        fetch('send.php', { method: 'HEAD' })
            .then(() => {
                // Файл существует, продолжаем
                return fetch('send.php', {
                    method: 'POST',
                    body: formData
                });
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP ошибка: ' + response.status);
                }
                return response.json();
            })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showStatus('Спасибо, ' + name + '! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
                form.reset();
            } else {
                showStatus(data.message || 'Ошибка отправки', 'error');
            }
        })
        .catch(error => {
            console.error('Полная ошибка:', error);
            console.error('Тип ошибки:', error.name);
            console.error('Сообщение:', error.message);
            
            let errorMessage = 'Ошибка соединения. ';
            
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                errorMessage = 'Не удалось подключиться к серверу. Убедитесь, что:\n' +
                            '1. Вы запустили сайт через PHP-сервер (не Live Server)\n' +
                            '2. Файл send.php находится в той же папке\n' +
                            '3. Адрес: http://localhost:8000 (не file://)';
            }
            
            showStatus(errorMessage, 'error');
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить';
        });
    });

    function showStatus(message, type) {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
    }

    function hideStatus() {
        formStatus.className = 'form-status';
        formStatus.textContent = '';
    }
});