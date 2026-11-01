# Портфолио Якова Григорьевича

Я веб-разработчик из Беларуси. Делаю лендинги, веб-приложения и автоматизацию для бизнеса на JavaScript, React и Python.

Сайт: [grigorijg472-ops.github.io/Bond](https://grigorijg472-ops.github.io/Bond)

## Проекты

Все проекты работают в браузере, ничего устанавливать не нужно. На каждой странице кнопка «О проекте» открывает описание: задача, что внутри, стек и ограничения.

### Для бизнеса

| Проект | Что делает | Технологии |
| --- | --- | --- |
| [Онлайн-запись «Бритва & Ко»](https://grigorijg472-ops.github.io/Bond/projects/booking/index.html) | Запись в барбершоп: услуги, мастер, дата и свободное время, маска телефона, файл в календарь, уведомление владельцу в Telegram | JavaScript, localStorage |
| [Интернет-магазин «Зерно»](https://grigorijg472-ops.github.io/Bond/projects/shop/index.html) | Магазин кофе: каталог с поиском и фильтрами, карточка товара, корзина, промокоды, оформление заказа | JavaScript, SVG, localStorage |
| [CRM «Дубрава»](https://grigorijg472-ops.github.io/Bond/projects/crm/index.html) | Панель заявок: метрики и графики, воронка, канбан с перетаскиванием, таблица, карточка клиента | JavaScript, SVG, Drag and Drop |
| [Лендинг с квизом «Ровно»](https://grigorijg472-ops.github.io/Bond/projects/quiz-landing/index.html) | Лендинг ремонта: слайдер «до/после», тарифы, квиз из 5 шагов с расчётом сметы и заявкой | JavaScript, CSS |
| [AI Chat Bot](https://grigorijg472-ops.github.io/Bond/projects/telegram-bot/index.html) | Демо диалога бота: услуги, расчёт цены, переход к заказу. Ответы заготовленные, без сервера | JavaScript |
| [Dev Cost Calculator](https://grigorijg472-ops.github.io/Bond/projects/dev-cost-calculator.html) | Считает ориентировочную стоимость и срок разработки сайта | JavaScript |

### 3D и графика

| Проект | Что делает | Технологии |
| --- | --- | --- |
| [3D Portfolio](https://grigorijg472-ops.github.io/Bond/projects/3d-portfolio/index.html) | 3D-сцена из частиц и сферы, поворот перетаскиванием, подписи навыков следуют за узлами | Three.js, WebGL, GLSL |
| [3D-аквариум](https://grigorijg472-ops.github.io/Bond/projects/aquarium/index.html) | Живой аквариум: рыбы со своим поведением, кормление, день и ночь, пузырьки | Three.js, WebGL |

## Структура

```
index.html               главная страница
404.html                 страница «не найдено»
assets/previews/         превью проектов для главной
projects/
  shared/                общие стили и скрипт кнопки «О проекте»
  booking/               онлайн-запись
  shop/                  интернет-магазин
  crm/                   CRM-панель
  quiz-landing/          лендинг с квизом
  telegram-bot/
  3d-portfolio/
  aquarium/
  dev-cost-calculator.html
```

Сайт статический: HTML, CSS и JavaScript без сборки. Чтобы открыть его локально, запустите в папке `python -m http.server` и перейдите на `http://localhost:8000`.

## Стек

- Frontend: HTML, CSS, JavaScript, React, Vue, Tailwind
- Backend: Node.js, Express, Python, REST API, PostgreSQL
- Автоматизация: Selenium, BeautifulSoup, Pandas
- Инструменты: Git, Figma, VS Code

## Откат к прошлой версии

Версия сайта до этого редизайна сохранена в ветке `backup-before-redesign`. Чтобы вернуть её, создайте Pull Request из `backup-before-redesign` в `main` или в Settings → Pages выберите эту ветку. Более старые версии лежат в ветках `backup-original-site` и `backup-original`.

## Контакты

- Telegram: [@Bond8848](https://t.me/Bond8848)
- Email: grigorijg472@gmail.com
- GitHub: [grigorijg472-ops](https://github.com/grigorijg472-ops)
