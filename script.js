const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.classList?.contains('allplay__caption')) {
                    const captionEl = document.querySelector('.allplay__caption');
                    captionEl.innerHTML = cleanSubtitles(captionEl.innerHTML);
                }
            });
        }
    }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true
});

function cleanSubtitles(input) {
    return input
        .split('\n')
        .map(line =>
            line
                .replace(/<(?!\/?b\b)[^>]*>/g, '')
                .replace(/&#x[0-9A-Fa-f]+;/g, '')
                .replace(/\\{1,2}h/g, '')
                .replace(/\{=.+\}/g, '')
        )
        .filter(line => !/^\s*m\b/i.test(line))
        .join('\n')
        .trim();
}

function setColorInIframe() {
    const element = document.querySelector('.allplay--video .allplay__progress__buffer');
    if (element) {
        const style = document.createElement('style');
        style.innerHTML = `
      .allplay--video .allplay__progress__buffer {
        color: #00b6ff5e !important;
      }
    `;
        document.head.appendChild(style);


        console.log("Found element, applied custom CSS");
    } else {
        setTimeout(setColorInIframe, 500);
        console.log("Didn't find element, retrying...");
    }
}


function createSubControl() {
    const container = document.querySelector('.selects.ui');
    if (container) {

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'space-between';
        wrapper.style.background = '#23282f';
        wrapper.style.borderRadius = '5px';
        wrapper.style.padding = '8px 12px';
        wrapper.style.color = '#fff';
        wrapper.style.fontFamily = 'Verdana';
        wrapper.style.fontWeight = '700';
        wrapper.style.fontSize = '12px';
        wrapper.style.userSelect = 'none';
        wrapper.style.width = 'fit-content';
        wrapper.style.minWidth = '140px';
        wrapper.style.height = '34px';

        const label = document.createElement('span');
        label.textContent = 'Auto Subtitles';

        const label2 = document.createElement('span');
        label2.textContent = 'Auto Skip';
        label2.style.marginLeft = "10px";

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'autoSubsToggle';
        checkbox.style.appearance = 'none';
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';
        checkbox.style.borderRadius = '10px';
        checkbox.style.background = '#555';
        checkbox.style.position = 'relative';
        checkbox.style.cursor = 'pointer';
        checkbox.style.marginLeft = '5px';
        checkbox.style.transition = 'background 0.3s';

        const checkbox2 = document.createElement('input');
        checkbox2.type = 'checkbox';
        checkbox2.id = 'autoSkipToggle';
        checkbox2.style.appearance = 'none';
        checkbox2.style.width = '20px';
        checkbox2.style.height = '20px';
        checkbox2.style.borderRadius = '10px';
        checkbox2.style.background = '#555';
        checkbox2.style.position = 'relative';
        checkbox2.style.cursor = 'pointer';
        checkbox2.style.marginLeft = '5px';
        checkbox2.style.transition = 'background 0.3s';

        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                checkbox.style.background = '#0aaaf1';
                console.log("Auto subtitles ON");
                shouldEnableSubs = true;
            } else {
                checkbox.style.background = '#555';
                console.log("Auto subtitles OFF");
                shouldEnableSubs = false;
            }
        });

        checkbox2.addEventListener('change', () => {
            if (checkbox2.checked) {
                checkbox2.style.background = '#0aaaf1';
                console.log("Auto skip ON");
                shouldSkipStart = true;
            } else {
                checkbox2.style.background = '#555';
                console.log("Auto skip OFF");
                shouldSkipStart = false;
            }
        });


        wrapper.appendChild(label);
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label2);
        wrapper.appendChild(checkbox2);
        container.appendChild(wrapper);
        checkbox.style.background = '#0aaaf1';
        checkbox.checked = true;

        checkbox2.style.background = '#0aaaf1';
        checkbox2.checked = true;
    }
    isSubsElemAdded = true;
}

function enableSubs() {

    if (shouldEnableSubs) {
        const captionsButton = document.querySelector('button[type="button"][data-allplay="captions"]');


        if (captionsButton && captionsButton.getAttribute("aria-pressed") !== "true") {

            if (!isSubsElemAdded) {
                createSubControl();
            }

            var text = document.
                querySelector("div.allplay__controls__item.allplay__time--current.allplay__time").innerText;

            if (text != "00:00" && !captionsButton.hasAttribute('hidden') && getComputedStyle(captionsButton).display !== 'none') {
                captionsButton.click();
                console.log("clicked");
            }
        }
    }

    if (shouldSkipStart) {
        var skipBtn = document.querySelector('.allplay__skip.allplay__skip--intro');

        if (skipBtn && !skipBtn.hasAttribute('hidden')) {
            skipBtn.click();
        }
    }

    setTimeout(enableSubs, 500);
}


var isSubsElemAdded = false;
var shouldEnableSubs = true;
var shouldSkipStart = true;

console.log('Started script');
setColorInIframe();
enableSubs();
