# Портфолио Якова Григорьевича

Я веб-разработчик из Беларуси. Делаю лендинги, веб-приложения и автоматизацию для бизнеса на JavaScript, React и Python.

Сайт: [grigorijg472-ops.github.io/Bond](https://grigorijg472-ops.github.io/Bond)

## Проекты

Все проекты работают в браузере, ничего устанавливать не нужно. На каждой странице кнопка «О проекте» открывает описание: задача, что внутри, стек и ограничения.

| Проект | Что делает | Технологии |
| --- | --- | --- |
| [3D Portfolio](https://grigorijg472-ops.github.io/Bond/projects/3d-portfolio/index.html) | 3D-сцена из частиц и сферы, поворот перетаскиванием, подписи навыков следуют за узлами | Three.js, WebGL, GLSL |
| [AI Chat Bot](https://grigorijg472-ops.github.io/Bond/projects/telegram-bot/index.html) | Демо диалога бота: услуги, расчёт цены, переход к заказу. Ответы заготовленные, без сервера | JavaScript |
| [Habits Tracker](https://grigorijg472-ops.github.io/Bond/projects/habits-tracker/index.html) | Трекер привычек: серии дней, график за 7 дней, тепловая карта за 5 недель | JavaScript, localStorage |
| [Resume Generator](https://grigorijg472-ops.github.io/Bond/projects/resume-generator/index.html) | Редактор резюме с предпросмотром A4, шаблонами и печатью в PDF | JavaScript, CSS print |
| [Interactive Map](https://grigorijg472-ops.github.io/Bond/projects/interactive-map/index.html) | Собственная карта на Canvas: зум, перетаскивание, поиск, фильтры по категориям | Canvas API |
| [Dev Cost Calculator](https://grigorijg472-ops.github.io/Bond/projects/dev-cost-calculator.html) | Считает ориентировочную стоимость и срок разработки сайта | JavaScript |
| [Proposal Generator](https://grigorijg472-ops.github.io/Bond/projects/proposal-generator.html) | Собирает коммерческое предложение: позиции, скидка, срок, печать на A4 | JavaScript, CSS print |

## Структура

```
index.html               главная страница
404.html                 страница «не найдено»
projects/
  shared/                общие стили и скрипт кнопки «О проекте»
  3d-portfolio/
  telegram-bot/
  habits-tracker/
  resume-generator/
  interactive-map/
  dev-cost-calculator.html
  proposal-generator.html
```

Сайт статический: HTML, CSS и JavaScript без сборки. Чтобы открыть его локально, запустите в папке `python -m http.server` и перейдите на `http://localhost:8000`.

## Стек

- Frontend: HTML, CSS, JavaScript, React, Vue, Tailwind
- Backend: Node.js, Express, Python, REST API, PostgreSQL
- Автоматизация: Selenium, BeautifulSoup, Pandas
- Инструменты: Git, Figma, VS Code

## Откат к прошлой версии

Версия мини-проектов до редизайна сохранена в ветке `backup-original-site`. Чтобы вернуть её, создайте Pull Request из `backup-original-site` в `main` или в Settings → Pages выберите эту ветку. Более ранняя версия всего сайта лежит в ветке `backup-original` (коммит `ba8a191`).

## Контакты

- Telegram: [@Bond8848](https://t.me/Bond8848)
- Email: grigorijg472@gmail.com
- GitHub: [grigorijg472-ops](https://github.com/grigorijg472-ops)
