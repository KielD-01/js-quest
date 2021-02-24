// Quest Platform
const qGen = {
    values: {
        step: 0,
        hasFood: false,
        hasWater: false,
        equipment: {
            weapon: {
                rod: false,
                knife: false,
                axe: false,
                sword: false,
            },
            armor: {
                vest: false,
                mailPlate: false,
                chainPlate: false,
                chainMailPlate: false,
                dragonArmor: false
            }
        },
        supplies: {
            food: 0,
            water: 0
        }
    },
    defaults: {
        urls: {
            options: '/src/json/options.json'
        },
        image: '/src/images/placeholder.webp',
        sfx: {
            menu: '/src/sfx/options.mp3',
            menuSelect: '/src/sfx/option_select.wav',
            win: '/src/sfx/win.mp3',
        },
        templates: {
            option: {
                text: null,
                html: '<p class="story__line__path_selector" data-step="{step}" data-value="{value}">{text}</p>'
            }
        },
        elements: {
            storyImage: document.getElementById('story__image'),
            storyTitle: document.getElementById('story__title'),
            storyOptions: document.getElementById('story__options'),
        },
        start: {
            image: '/src/images/forest.png',
            html: "Вы - Охотник на нечисть.<br>" +
                "Ваш путь лежит через лес.<br>" +
                "Перед Вами 3 пути на выбор:",
            options: [
                {text: 'Свернуть налево', option: 'left'},
                {text: 'Продолжать идти прямо', option: 'straight'},
                {text: 'Свернуть направо', option: 'right'},
            ]
        },
        options: null

    },
    f: {
        resetSteps() {
            window._q_gen.values.step = 0;
        },
        increaseStep() {
            window._q_gen.values.step++;
        },
        setStoryImage(image) {
            window._q_gen
                .defaults
                .elements
                .storyImage
                .setAttribute(
                    'style',
                    `background-image : url('${image}');` +
                    `background-size : cover !important;`
                )
        },
        setStoryTitle(title) {
            window._q_gen
                .defaults
                .elements
                .storyTitle
                .innerHTML = title;
        },
        setStoryOptionsListeners() {
            let storyOptionsElements = document.getElementsByClassName('story__line__path_selector');

            for (let index = 0; index < storyOptionsElements.length; index++) {
                let element = storyOptionsElements[index];
                element.addEventListener('click', function () {
                    window._q_gen.f.playSoundOnHover('menuSelect');
                    window._q_gen.f.updateDataByElement(element);
                });

                element.addEventListener('mouseover', function () {
                    window._q_gen.f.playSoundOnHover('menu');
                });

            }
        },
        setStoryOptions(options) {
            let htmlBlock = [],
                template = window._q_gen.defaults.templates.option.html;

            for (let index = 0; index < options.length; index++) {
                let option = options[index];
                htmlBlock.push(
                    template
                        .replace('{step}', window._q_gen.values.step)
                        .replace('{text}', option.text ?? option.html)
                        .replace('{value}', option.option)
                );
            }

            window
                ._q_gen
                .defaults
                .elements
                .storyOptions
                .innerHTML = htmlBlock.join('');

            window._q_gen.f.setStoryOptionsListeners();
        },
        playSoundOnHover(sound) {
            let audio = new Audio(window._q_gen.defaults.sfx[sound]);
            audio.play()
                .then(() => {
                    audio.muted = false;
                });
        },
        updateDataByElement(element) {
            let step = element.getAttribute('data-step'),
                option = element.getAttribute('data-value');

            let story = window._q_gen.defaults.options[option][step],
                restart = story['restart'] ?? false;

            if (restart) {
                window._q_gen.f.resetSteps();
                window._q_gen.init();

                return;
            }

            window._q_gen.f.increaseStep();
            window._q_gen.f.setStoryImage(story.image ?? window._q_gen.defaults.image);
            window._q_gen.f.setStoryTitle(story.html);
            window._q_gen.f.setStoryOptions(story.options);
        },
        getOptions() {
            fetch(window._q_gen.defaults.urls.options)
                .then(async r => {
                    if (r.ok) {
                        window._q_gen.defaults.options = await r.json();

                        console.log('Options has been loaded', window._q_gen.defaults.options);
                    }
                })
        }
    },
    init() {
        let start = window._q_gen.defaults.start;

        // To be able to play audio, we need to interact with the DOM
        window._q_gen.defaults.elements.storyImage.click();

        window._q_gen.f.getOptions();
        window._q_gen.f.setStoryImage(start.image ?? window._q_gen.defaults.image);
        window._q_gen.f.setStoryTitle(start.html);
        window._q_gen.f.setStoryOptions(start.options);
    }
};

// Global access assign
window._q_gen = qGen;

if (!window._q_gen.hasOwnProperty('init')) {
    throw new Error('Failed to initialize Q Gen');
}

window._q_gen.init();