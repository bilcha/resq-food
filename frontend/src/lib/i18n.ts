import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Translation resources
const resources = {
  uk: {
    common: {
      navigation: {
        home: "Головна",
        listings: "Оголошення",
        about: "Про нас",
        contact: "Контакти",
        login: "Увійти",
        logout: "Вийти",
        dashboard: "Панель керування",
        register_business: "Зареєструвати бізнес"
      },
      common: {
        browse_listings: "Переглянути оголошення",
        register: "Зареєструватися",
        ready_to_start: "Готові почати?",
        how_it_works: "Як це працює",
        quick_links: "Швидкі посилання",
        for_businesses: "Для бізнесу",
        support: "Підтримка",
        help_center: "Центр допомоги",
        contact_support: "Зв'язатися з підтримкою"
      },
      home: {
        title: "ResQ Food — Разом проти марнування продуктів та забруднення планети",
        meta_description: "Отримуйте смачну їжу зі знижкою від місцевих бізнесів та долучайтеся до боротьби з марнуванням їжі.",
        hero_title: "Не марнуй їжу — рятуй планету",
        hero_subtitle: "Отримуй смачну їжу за вигідною ціною та підтримуй локальні бізнеси.",
        features_subtitle: "Як легко зменшити харчові відходи та заощадити",
        step1_title: "Заклади публікують",
        step1_description: "Місцеві заклади пропонують свої харчові надлишки за вигідними цінами.",
        step2_title: "Шукай і бронюй",
        step2_description: "Знаходь доступні пропозиції поблизу та бронюй свій пакунок-сюрприз",
        step3_title: "Забирай і насолоджуйся",
        step3_description: "Забирай замовлення та насолоджуйся, знаючи, що робиш добру справу",
        cta_subtitle: "Долучайся до тисяч користувачів та бізнесів, які вже змінюють світ — разом проти марнування харчових продуктів!"
      },
      about: {
        title: "Про нас - ResQ Food",
        meta_description: "ResQ Food — проєкт, що об’єднує бізнес і споживачів задля зменшення харчових відходів. Дізнайтеся більше!",
        page_title: "Про ResQ Food",
        page_subtitle: "Наша місія зі зменшення харчових відходів та допомоги навколишньому середовищу",
        intro: "ResQ Food — це соціально-екологічна платформа, яка з'єднує заклади з надлишками їжі зі споживачами, які шукають доступні, якісні страви. Ми надихаємося успішними глобальними ініціативами, такими як Too Good To Go та OLIO, але адаптованими спеціально для українського ринку.",
        mission_title: "Наша місія",
        mission_description: "Щороку мільйони тонн їжі йдуть у відходи, в той час як багато людей стикаються з нестачею продуктів. Ми віримо, що технології можуть допомогти подолати цю проблему, зробивши надлишки їжі доступнішими для всіх, водночас допомагаючи місцевим бізнесам зменшити витрати роблячи внесок у навколишнє середовище.",
        help_title: "Як ми допомагаємо"
      },
      contact: {
        title: "Контакти - ResQ Food",
        meta_description: "Зв'яжіться з командою ResQ Food. Ми тут, щоб допомогти з будь-якими питаннями про нашу платформу.",
        page_title: "Зв'яжіться з нами",
        page_subtitle: "Ми б хотіли почути від вас. Зв'яжіться з нашою командою.",
        get_in_touch: "Зв'язатися",
        email: "Електронна пошта",
        support: "Підтримка",
        business_partnerships: "Бізнес-партнерство",
        faq_title: "Часті запитання",
        faq_q1: "Як працює ResQ Food?",
        faq_a1: "Заклади розміщують оголошення про надлишки продукції за знижкою, а споживачі можуть знаходити та купувати цю продукцію, щоб економити зменшуючи відходи.",
        faq_q2: "Чи безпечно їсти надлишки їжі?",
        faq_a2: "Так! Вся їжа, розміщена на нашій платформі, безпечна для споживання та відповідає стандартам якості. Це просто надлишки, які інакше пішли б у відходи.",
        faq_q3: "Як заклади можуть приєднатися?",
        faq_a3: "Заклади можуть зареєструватися на нашій платформі та почати розміщувати свої оголошення про надлишки продукції одразу після підтвердження реєстрації."
      },
      admin: {
        title: "Адміністративна панель - ResQ Food",
        page_title: "Адміністративна панель",
        coming_soon: "Адміністративні елементи керування та аналітика скоро з'являться."
      },
      business_dashboard: {
        title: "Панель управління бізнесом - ResQ Food",
        page_title: "Панель управління бізнесом",
        coming_soon: "Панель управління бізнесом скоро з'явиться."
      },
      not_found: {
        title: "Сторінку не знайдено - ResQ Food",
        page_title: "Сторінку не знайдено",
        description: "Сторінка, яку ви шукаєте, не існує.",
        go_home: "Повернутися на головну"
      },
      footer: {
        description: "Зменшуємо марнування харчових продуктів, з'єднуючи заклади з надлишками продукції зі споживачами.",
        copyright: "© 2025 ResQ Food. Всі права захищені."
      },
      listings: {
        title: "Оголошення - ResQ Food",
        meta_description: "Переглядайте доступні оголошення про їжу від місцевих закладів за знижкою.",
        page_title: "Доступні оголошення про їжу",
        page_subtitle: "Знайдіть пропозиції про розпродаж надлишків від місцевих закладів та допоможіть зменшити харчові відходи",
        view_label: "Вигляд:",
        grid_view: "Таблиця",
        map_view: "Мапа",
        loading: "Завантаження оголошень...",
        listings_found: "знайдено оголошень",
        listing_found: "знайдено оголошення",
        error_loading: "Помилка завантаження оголошень",
        error_message: "Щось пішло не так під час отримання оголошень.",
        try_again: "Спробувати знову",
        no_listings: "Оголошень не знайдено",
        no_listings_message: "Наразі немає доступних оголошень, що відповідають вашим фільтрам.",
        clear_filters: "Очистити фільтри",
        selected_listing: "Обране оголошення",
        view_details: "Переглянути деталі"
      },
      login: {
        title: "Вхід - ResQ Food",
        meta_description: "Увійдіть до свого бізнес-акаунту ResQ Food.",
        page_title: "Вхід до акаунту",
        page_subtitle: "Тільки для власників бізнесу",
        email_label: "Електронна адреса",
        password_label: "Пароль",
        email_placeholder: "ваш-бізнес@example.com",
        password_placeholder: "Пароль",
        sign_in_button: "Увійти",
        signing_in: "Вхід...",
        no_account: "Немає акаунту?",
        register_link: "Зареєструвати свій бізнес",
        validation: {
          email_required: "Електронна адреса обов'язкова",
          email_invalid: "Неправильна електронна адреса",
          password_required: "Пароль обов'язковий"
        },
        errors: {
          general: "Помилка входу. Спробуйте ще раз.",
          user_not_found: "Обліковий запис з цією електронною адресою не знайдено. Перевірте адресу або зареєструйте новий акаунт.",
          wrong_password: "Неправильний пароль. Спробуйте ще раз.",
          invalid_email: "Неправильна електронна адреса.",
          user_disabled: "Цей обліковий запис було заблоковано. Зверніться до підтримки.",
          too_many_requests: "Забагато невдалих спроб входу. Спробуйте пізніше."
        }
      },
      register: {
        title: "Реєстрація бізнесу - ResQ Food",
        meta_description: "Зареєструйте свій бізнес в ResQ Food, щоб почати розміщувати оголошення про надлишки продуктів.",
        page_title: "Зареєструйте свій бізнес",
        page_subtitle: "Приєднайтеся до боротьби з марнуванням харчових продуктів",
        email_label: "Електронна адреса",
        password_label: "Пароль",
        confirm_password_label: "Підтвердіть пароль",
        business_name_label: "Назва бізнесу",
        phone_label: "Номер телефону",
        address_label: "Адреса бізнесу",
        description_label: "Опис бізнесу",
        email_placeholder: "ваш-бізнес@example.com",
        password_placeholder: "Пароль",
        confirm_password_placeholder: "Підтвердіть пароль",
        business_name_placeholder: "Назва вашого бізнесу",
        phone_placeholder: "+380XXXXXXXXX",
        address_placeholder: "вул. Хрещатик 1, Київ, 01001",
        description_placeholder: "Розкажіть про свій бізнес та типи продуктів, які ви пропонуєте...",
        register_button: "Зареєструвати бізнес",
        registering: "Реєстрація...",
        have_account: "Вже маєте акаунт?",
        sign_in_link: "Увійти тут",
        required_field: " *",
        validation: {
          email_required: "Електронна адреса обов'язкова",
          email_invalid: "Неправильна електронна адреса",
          password_required: "Пароль обов'язковий",
          password_min_length: "Пароль має містити принаймні 6 символів",
          confirm_password_required: "Підтвердіть свій пароль",
          passwords_no_match: "Паролі не збігаються",
          business_name_required: "Назва бізнесу обов'язкова",
          business_name_min_length: "Назва бізнесу має містити принаймні 2 символи",
          phone_invalid: "Введіть правильний номер телефону",
          address_required: "Адреса бізнесу обов'язкова"
        },
        errors: {
          general: "Помилка реєстрації. Спробуйте ще раз.",
          email_in_use: "Ця електронна адреса вже зареєстрована. Використайте іншу адресу або спробуйте увійти.",
          weak_password: "Пароль занадто слабкий. Оберіть більш надійний пароль.",
          invalid_email: "Неправильна електронна адреса."
        }
      },
      listing_detail: {
        back_to_listings: "Повернутися до списку оголошень",
        error_loading: "Помилка завантаження оголошення",
        listing_not_found: "Оголошення не знайдено",
        try_again: "Спробувати знову",
        invalid_date: "Неправильна дата",
        available: "доступно",
        free: "БЕЗКОШТОВНО",
        paid: "Платно",
        no_image_available: "Зображення недоступне",
        description: "Опис",
        business_information: "Інформація про бізнес",
        unknown_business: "Невідомий бізнес",
        address_not_available: "Адреса недоступна",
        stars: "зірок",
        google_rating: "Рейтинг Google",
        view_on_google_maps: "Переглянути в Google Картах",
        location: "Місцезнаходження",
        availability: "Доступність",
        available_until_label: "Доступно",
        until: "До",
        available_from: "Доступно з",
        quantity: "Кількість",
        item_available: "товар доступний",
        items_available: "товарів доступно",
        interested: "Зацікавлені?",
        contact_business_message: "Зв'яжіться з бізнесом безпосередньо, щоб зарезервувати цей товар.",
        get_directions: "Прокласти маршрут",
        contact_business: "Зв'язатися з бізнесом",
        note_label: "Примітка:",
        note_message: "Будь ласка, зв'яжіться з бізнесом, щоб підтвердити наявність та домовитися про час візиту перед відвідуванням.",
        business_details: "Деталі бізнесу",
        contact: "Контакт",
        hours: "Години роботи",
        rating: "Рейтинг",
        listing_details: "Деталі оголошення",
        listed: "Розміщено",
        updated: "Оновлено",
        category: "Категорія",
        type: "Тип",
        view_details: "Переглянути деталі"
      },
      components: {
        ui: {   
          offline_data_status: {
            title: "Статус offline даних",
            refresh_data: "Оновити дані",
            sync_now: "Синхронізувати зараз",
            retry_images: "Повторити синхронізацію зображень",
            loading: "Завантаження...",
            syncing: "Синхронізація...",
            local_storage: "Локальне сховище",
            businesses: "Бізнеси",
            listings: "Оголошення",
            pending_changes: "Очікують синхронізації",
            images: "Зображення",
            uploaded: "завантажено",
            pending: "в очікуванні",
            status: "Статус",
            preloading_data: "Завантаження даних...",
            offline_mode: "Автономний режим",
            all_synced: "Все синхронізовано",
            pending_sync: "очікують синхронізації",
            images_failed: "зображень не вдалося завантажити",
            retry_automatically: "буде повторено автоматично",
            last_sync: "Попередня синхронізація",
            no_offline_data_online: "Offline дані недоступні. Натисніть «Оновити дані», щоб завантажити для offline використання.",
            no_offline_data_offline: "Offline дані недоступні. Підключіться до Інтернету, щоб завантажити дані для offline використання."
          },
          data_preload_indicator: {
            preloading: "Попереднє завантаження даних",
            progress: "прогрес",
            completed: "завершено"
          },
          online_status: {
            online: "Online",
            offline: "Offline",
            reconnected: "Підключено знову"
          }
        },
        auth: {
          loading: "Завантаження..."
        },
        business: {
          profile_form: {
            title: "Профіль бізнесу",
            subtitle: "Оновіть інформацію про ваш бізнес та місцезнаходження.",
            business_name: "Назва бізнесу",
            email_address: "Електронна адреса",
            email_readonly: "Електронну адресу неможливо змінити, оскільки це ідентифікатор вашого облікового запису.",
            phone_number: "Номер телефону",
            business_location: "Місцезнаходження бізнесу",
            use_map_instead: "Використовувати мапу для вибору адреси",
            enter_manually: "Ввести адресу вручну",
            enter_complete_address: "Введіть повну адресу вашого бізнесу вручну.",
            loading_map: "Завантаження мапи...",
            selected_location: "Вибране місцезнаходження:",
            business_description: "Опис бізнесу",
            describe_business: "Опишіть ваш бізнес, особливості та те, що робить вас унікальними.",
            save_changes: "Зберегти зміни",
            saving: "Збереження...",
            no_changes: "Немає змін для збереження",
            cancel: "Скасувати",
            success_message: "Профіль бізнесу успішно оновлено!",
            error_message: "Не вдалося оновити профіль бізнесу. Спробуйте ще раз.",
            search_or_click_map: "Введіть свою адресу або виберіть локацію на мапі",
            placeholders: {
              business_name: "Введіть назву вашого бізнесу",
              phone: "Наприклад: +380XXXXXXXXX",
              address: "Введіть адресу вашого бізнесу",
              description: "Розкажіть клієнтам про ваш бізнес..."
            },
            validation: {
              name_required: "Назва бізнесу обов'язкова",
              name_max_length: "Назва бізнесу має бути менше 255 символів",
              phone_invalid: "Введіть дійсний номер телефону"
            }
          }
        },
        listings: {
          management: {
            title: "Управління оголошеннями",
            subtitle: "Створюйте та керуйте оголошеннями про надлишки продуктів для {{businessName}}",
            create_new: "Створити нове оголошення",
            create_new_listing: "Створити нове оголошення",
            create_listing: "Створити оголошення",
            edit_listing: "Редагувати оголошення",
            update_listing: "Оновити оголошення",
            create_first_listing: "Створіть своє перше оголошення",
            no_listings: "Поки що немає оголошень",
            create_first: "Створіть своє перше оголошення, щоб почати продавати надлишки їжі.",
            loading: "Завантаження оголошень...",
            error_loading: "Помилка завантаження оголошень",
            unknown_error: "Невідома помилка",
            try_again: "Спробувати знову",
            syncing: "Синхронізація",
            delete_confirm: "Ви впевнені, що хочете видалити це оголошення? Цю дію неможливо скасувати.",
            category: "Категорія",
            price: "Ціна",
            quantity: "Кількість",
            available_until: "Доступно до",
            actions: "Дії",
            edit: "Редагувати",
            delete: "Видалити",
            status: {
              active: "Активне",
              expired: "Прострочене",
              sold_out: "Розпродано",
              pending_approval: "Очікує схвалення",
              scheduled: "Заплановане"
            }
          },
          form: {
            title: "Назва",
            description: "Опис",
            category: "Категорія",
            price: "Ціна",
            is_free: "Це безкоштовно",
            image: "Зображення",
            image_preview: "Попередній перегляд зображення",
            available_from: "Доступно з",
            available_until: "Доступно до",
            quantity: "Кількість",
            upload_image: "Завантажити зображення",
            uploading: "Завантаження...",
            remove_image: "Видалити зображення",
            offline: "Offline",
            cancel: "Скасувати",
            select_category: "Оберіть категорію",
            image_upload_failed: "Не вдалося завантажити зображення",
            image_size_error: "Зображення має бути менше 5МБ",
            image_type_error: "Будь ласка, оберіть дійсний файл зображення",
            image_info: "Максимальний розмір файлу: 5МБ. Підтримувані формати: JPG, PNG, WebP",
            offline_mode: "Offline режим: Зображення будуть завантажені після відновлення з'єднання",
            placeholders: {
              title: "Наприклад: Свіжі круасани",
              description: "Опишіть їжу, стан та будь-які додаткові інструкції...",
              price: "0.00"
            },
            validation: {
              title_required: "Назва обов'язкова",
              description_required: "Опис обов'язковий",
              category_required: "Категорія обов'язкова",
              price_required: "Ціна має бути більше 0 для платних оголошень",
              date_from_required: "Дата початку доступності обов'язкова",
              date_until_required: "Дата закінчення доступності обов'язкова",
              date_invalid: "Дата закінчення має бути після дати початку",
              quantity_required: "Кількість має бути принаймні 1"
            }
          },
          card: {
            unknown_business: "Невідомий бізнес",
            available_until: "Доступно"
          },
          filters: {
            search_placeholder: "Пошук оголошень...",
            filters_label: "Фільтри",
            category: "Категорія",
            category_all: "Всі категорії",
            min_price: "Мін. ціна",
            max_price: "Макс. ціна",
            type: "Тип",
            price_all: "Всі ціни",
            price_free: "Безкоштовно",
            price_paid: "Платно",
            reset: "Скинути",
            apply_filters: "Застосувати фільтри",
            clear_filters: "Очистити фільтри"
          },
          map: {
            load_error: "Не вдалося завантажити мапу",
            unable_to_load: "Неможливо завантажити мапу",
            loading: "Завантаження мапи...",
            legend: {
              free_items: "Безкоштовні товари",
              paid_items: "Платні товари"
            }
          }
        }
      }
    }
  },
  en: {
    common: {
      navigation: {
        home: "Home",
        listings: "Listings",
        about: "About",
        contact: "Contact",
        login: "Login",
        logout: "Logout",
        dashboard: "Dashboard",
        register_business: "Register Business"
      },
      common: {
        browse_listings: "Browse Listings",
        register: "Register",
        ready_to_start: "Ready to Start?",
        how_it_works: "How It Works",
        quick_links: "Quick Links",
        for_businesses: "For Businesses",
        support: "Support",
        help_center: "Help Center",
        contact_support: "Contact Support"
      },
      home: {
        title: "ResQ Food - Reduce Food Waste",
        meta_description: "Connect with businesses to get surplus food at discounted prices while helping reduce food waste.",
        hero_title: "Rescue Food, Save Planet",
        hero_subtitle: "Connect with local businesses to get surplus food at discounted prices while helping reduce food waste.",
        features_subtitle: "Simple steps to reduce food waste and save money",
        step1_title: "Businesses List",
        step1_description: "Local businesses list their surplus food at discounted prices",
        step2_title: "Browse & Reserve",
        step2_description: "Find nearby listings and reserve your surprise food packages",
        step3_title: "Collect & Enjoy",
        step3_description: "Pick up your food and enjoy while helping the environment",
        cta_subtitle: "Join thousands of people and businesses fighting food waste together."
      },
      about: {
        title: "About - ResQ Food",
        meta_description: "Learn about ResQ Food's mission to reduce food waste and connect businesses with consumers.",
        page_title: "About ResQ Food",
        page_subtitle: "Our mission to reduce food waste and help the environment",
        intro: "ResQ Food is a social-ecological platform that connects businesses with surplus food to consumers looking for affordable, quality meals. We're inspired by successful global initiatives like Too Good To Go and OLIO, but tailored specifically for the Ukrainian market.",
        mission_title: "Our Mission",
        mission_description: "Every year, millions of tons of food are wasted while many people struggle with food insecurity. We believe technology can bridge this gap by making surplus food accessible to everyone while helping businesses reduce waste and recover costs.",
        help_title: "How We Help"
      },
      contact: {
        title: "Contact - ResQ Food",
        meta_description: "Get in touch with the ResQ Food team. We're here to help with any questions about our platform.",
        page_title: "Contact Us",
        page_subtitle: "We'd love to hear from you. Get in touch with our team.",
        get_in_touch: "Get in Touch",
        email: "Email",
        support: "Support",
        business_partnerships: "Business Partnerships",
        faq_title: "Frequently Asked Questions",
        faq_q1: "How does ResQ Food work?",
        faq_a1: "Businesses list their surplus food at discounted prices, and consumers can browse and purchase these items to reduce waste.",
        faq_q2: "Is it safe to eat surplus food?",
        faq_a2: "Yes! All food listed on our platform is safe to eat and meets quality standards. It's simply surplus that would otherwise go to waste.",
        faq_q3: "How can businesses join?",
        faq_a3: "Businesses can register on our platform and start listing their surplus food immediately after approval."
      },
      admin: {
        title: "Admin Dashboard - ResQ Food",
        page_title: "Admin Dashboard",
        coming_soon: "Administrative controls and analytics coming soon."
      },
      business_dashboard: {
        title: "Business Dashboard - ResQ Food",
        page_title: "Business Dashboard",
        coming_soon: "Business dashboard coming soon."
      },
      not_found: {
        title: "Page Not Found - ResQ Food",
        page_title: "Page Not Found",
        description: "The page you're looking for doesn't exist.",
        go_home: "Go Home"
      },
      footer: {
        description: "Reducing food waste by connecting businesses with surplus food to consumers.",
        copyright: "© 2025 ResQ Food. All rights reserved."
      },
      listings: {
        title: "Food Listings - ResQ Food",
        meta_description: "Browse available food listings from local businesses at discounted prices.",
        page_title: "Available Food Listings",
        page_subtitle: "Discover surplus food from local businesses at discounted prices and help reduce food waste",
        view_label: "View:",
        grid_view: "Grid",
        map_view: "Map",
        loading: "Loading listings...",
        listings_found: "listings found",
        listing_found: "listing found",
        error_loading: "Error loading listings",
        error_message: "Something went wrong while fetching listings.",
        try_again: "Try Again",
        no_listings: "No listings found",
        no_listings_message: "There are currently no available listings matching your filters.",
        clear_filters: "Clear Filters",
        selected_listing: "Selected Listing",
        view_details: "View Details"
      },
      login: {
        title: "Login - ResQ Food",
        meta_description: "Login to your ResQ Food business account.",
        page_title: "Sign in to your account",
        page_subtitle: "For business owners only",
        email_label: "Email address",
        password_label: "Password",
        email_placeholder: "your-business@example.com",
        password_placeholder: "Password",
        sign_in_button: "Sign in",
        signing_in: "Signing in...",
        no_account: "Don't have an account?",
        register_link: "Register your business",
        validation: {
          email_required: "Email is required",
          email_invalid: "Email is invalid",
          password_required: "Password is required"
        },
        errors: {
          general: "Login failed. Please try again.",
          user_not_found: "No account found with this email. Please check your email or register a new account.",
          wrong_password: "Incorrect password. Please try again.",
          invalid_email: "Invalid email address.",
          user_disabled: "This account has been disabled. Please contact support.",
          too_many_requests: "Too many failed login attempts. Please try again later."
        }
      },
      register: {
        title: "Register Business - ResQ Food",
        meta_description: "Register your business with ResQ Food to start listing surplus food.",
        page_title: "Register your business",
        page_subtitle: "Join the fight against food waste",
        email_label: "Email address",
        password_label: "Password",
        confirm_password_label: "Confirm Password",
        business_name_label: "Business Name",
        phone_label: "Phone Number",
        address_label: "Business Address",
        description_label: "Business Description",
        email_placeholder: "your-business@example.com",
        password_placeholder: "Password",
        confirm_password_placeholder: "Confirm Password",
        business_name_placeholder: "Your Business Name",
        phone_placeholder: "+1234567890",
        address_placeholder: "123 Main St, City, State, ZIP",
        description_placeholder: "Tell us about your business and the types of food you offer...",
        register_button: "Register Business",
        registering: "Registering...",
        have_account: "Already have an account?",
        sign_in_link: "Sign in here",
        required_field: " *",
        validation: {
          email_required: "Email is required",
          email_invalid: "Email is invalid",
          password_required: "Password is required",
          password_min_length: "Password must be at least 6 characters",
          confirm_password_required: "Please confirm your password",
          passwords_no_match: "Passwords do not match",
          business_name_required: "Business name is required",
          business_name_min_length: "Business name must be at least 2 characters",
          phone_invalid: "Please enter a valid phone number",
          address_required: "Business address is required"
        },
        errors: {
          general: "Registration failed. Please try again.",
          email_in_use: "This email is already registered. Please use a different email or try logging in.",
          weak_password: "Password is too weak. Please choose a stronger password.",
          invalid_email: "Invalid email address."
        }
      },
      listing_detail: {
        back_to_listings: "Back to Listings",
        error_loading: "Error loading listing",
        listing_not_found: "Listing not found",
        try_again: "Try Again",
        invalid_date: "Invalid date",
        available: "available",
        free: "FREE",
        paid: "Paid",
        no_image_available: "No image available",
        description: "Description",
        business_information: "Business Information",
        unknown_business: "Unknown Business",
        address_not_available: "Address not available",
        stars: "stars",
        google_rating: "Google rating",
        view_on_google_maps: "View on Google Maps",
        location: "Location",
        availability: "Availability",
        available_until_label: "Available",
        until: "Until",
        available_from: "Available from",
        quantity: "Quantity",
        item_available: "item available",
        items_available: "items available",
        interested: "Interested?",
        contact_business_message: "Contact the business directly to reserve this item.",
        get_directions: "Get Directions",
        contact_business: "Contact Business",
        note_label: "Note:",
        note_message: "Please contact the business to confirm availability and arrange pickup times before visiting.",
        business_details: "Business Details",
        contact: "Contact",
        hours: "Hours",
        rating: "Rating",
        listing_details: "Listing Details",
        listed: "Listed",
        updated: "Updated",
        category: "Category",
        type: "Type",
        view_details: "View Details"
      },
      components: {
        ui: {
          offline_data_status: {
            title: "Offline Data Status",
            refresh_data: "Refresh Data",
            sync_now: "Sync Now",
            retry_images: "Retry Images",
            loading: "Loading...",
            syncing: "Syncing...",
            local_storage: "Local Storage",
            businesses: "Businesses",
            listings: "Listings",
            pending_changes: "Pending changes",
            images: "Images",
            uploaded: "uploaded",
            pending: "pending",
            status: "Status",
            preloading_data: "Preloading data...",
            offline_mode: "Offline mode",
            all_synced: "All synced",
            pending_sync: "pending sync",
            images_failed: "image(s) failed upload",
            retry_automatically: "will retry automatically",
            last_sync: "Last sync",
            no_offline_data_online: "No offline data available. Click \"Refresh Data\" to download for offline use.",
            no_offline_data_offline: "No offline data available. Connect to the internet to download data for offline use."
          },
          data_preload_indicator: {
            preloading: "Preloading data",
            progress: "progress",
            completed: "completed"
          },
          online_status: {
            online: "Online",
            offline: "Offline", 
            reconnected: "Reconnected"
          }
        },
        auth: {
          loading: "Loading..."
        },
        business: {
          profile_form: {
            title: "Business Profile",
            subtitle: "Update your business information and location.",
            business_name: "Business Name",
            email_address: "Email Address",
            email_readonly: "Email cannot be changed as it's your account identifier.",
            phone_number: "Phone Number",
            business_location: "Business Location",
            use_map_instead: "Use Map Instead",
            enter_manually: "Enter Address Manually",
            enter_complete_address: "Enter your complete business address manually.",
            loading_map: "Loading map...",
            selected_location: "Selected Location:",
            business_description: "Business Description",
            describe_business: "Describe your business, specialties, and what makes you unique.",
            save_changes: "Save Changes",
            saving: "Saving...",
            no_changes: "No changes to save",
            cancel: "Cancel",
            success_message: "Business profile updated successfully!",
            error_message: "Failed to update business profile. Please try again.",
            search_or_click_map: "Search for your address or click on the map to select a location.",
            placeholders: {
              business_name: "Enter your business name",
              phone: "e.g. +1234567890",
              address: "Enter your business address",
              description: "Tell customers about your business..."
            },
            validation: {
              name_required: "Business name is required",
              name_max_length: "Business name must be less than 255 characters",
              phone_invalid: "Please enter a valid phone number"
            }
          }
        },
        listings: {
          management: {
            title: "Listing Management",
            subtitle: "Create and manage your food listings for {{businessName}}",
            create_new: "Create New Listing",
            create_new_listing: "Create New Listing",
            create_listing: "Create Listing",
            edit_listing: "Edit Listing",
            update_listing: "Update Listing",
            create_first_listing: "Create Your First Listing",
            no_listings: "No listings yet",
            create_first: "Create your first listing to start selling surplus food.",
            loading: "Loading listings...",
            error_loading: "Error loading listings",
            unknown_error: "Unknown error",
            try_again: "Try Again",
            syncing: "Syncing",
            delete_confirm: "Are you sure you want to delete this listing? This action cannot be undone.",
            category: "Category",
            price: "Price",
            quantity: "Quantity",
            available_until: "Available until",
            actions: "Actions",
            edit: "Edit",
            delete: "Delete",
            status: {
              active: "Active",
              expired: "Expired",
              sold_out: "Sold Out",
              pending_approval: "Pending Approval",
              scheduled: "Scheduled"
            }
          },
          form: {
            title: "Title",
            description: "Description",
            category: "Category",
            price: "Price",
            is_free: "This is free",
            image: "Image",
            image_preview: "Listing preview",
            available_from: "Available from",
            available_until: "Available until",
            quantity: "Quantity",
            upload_image: "Upload Image",
            uploading: "Uploading...",
            remove_image: "Remove Image",
            offline: "Offline",
            cancel: "Cancel",
            select_category: "Select a category",
            image_upload_failed: "Failed to upload image",
            image_size_error: "Image must be less than 5MB",
            image_type_error: "Please select a valid image file",
            image_info: "Maximum file size: 5MB. Supported formats: JPG, PNG, WebP",
            offline_mode: "Offline mode: Images will be uploaded when connection is restored",
            placeholders: {
              title: "e.g. Fresh croissants",
              description: "Describe the food, condition, and any special instructions...",
              price: "0.00"
            },
            validation: {
              title_required: "Title is required",
              description_required: "Description is required",
              category_required: "Category is required",
              price_required: "Price must be greater than 0 for paid listings",
              date_from_required: "Available from date is required",
              date_until_required: "Available until date is required",
              date_invalid: "End date must be after start date",
              quantity_required: "Quantity must be at least 1"
            }
          },
          card: {
            unknown_business: "Unknown Business",
            available_until: "Available"
          },
          filters: {
            search_placeholder: "Search listings...",
            filters_label: "Filters",
            category: "Category",
            category_all: "All Categories",
            min_price: "Min Price",
            max_price: "Max Price",
            type: "Type",
            price_all: "All Prices",
            price_free: "Free",
            price_paid: "Paid",
            reset: "Reset",
            apply_filters: "Apply Filters",
            clear_filters: "Clear Filters"
          },
          map: {
            load_error: "Failed to load map",
            unable_to_load: "Unable to load map",
            loading: "Loading map...",
            legend: {
              free_items: "Free Items",
              paid_items: "Paid Items"
            }
          }
        }
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'uk', // Default language is Ukrainian
    fallbackLng: 'uk',
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // Save language selection to localStorage
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n 