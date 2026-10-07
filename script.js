        /* ---- Mobile menu ---- */
        (function () {
            var toggle = document.getElementById('nav-toggle');
            var links = document.getElementById('nav-links');
            function setOpen(open) {
                links.classList.toggle('is-open', open);
                toggle.setAttribute('aria-expanded', String(open));
                toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
                toggle.firstElementChild.className = open ? 'fas fa-xmark' : 'fas fa-bars';
            }
            toggle.addEventListener('click', function () { setOpen(!links.classList.contains('is-open')); });
            links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
        })();

                /* ---- Click to copy ---- */
        (function () {
            function copyText(text) {
                if (navigator.clipboard && window.isSecureContext) {
                    return navigator.clipboard.writeText(text);
                }
                return new Promise(function (resolve, reject) {
                    var ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.select();
                    try { document.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
                    document.body.removeChild(ta);
                });
            }

            function wire(btnId, textId, value) {
                var btn = document.getElementById(btnId);
                var label = document.getElementById(textId);
                var original = label.textContent;
                var timer;
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    copyText(value).then(function () {
                        label.textContent = 'Copied!';
                        btn.classList.add('is-copied');
                        clearTimeout(timer);
                        timer = setTimeout(function () {
                            label.textContent = original;
                            btn.classList.remove('is-copied');
                        }, 2000);
                    }).catch(function (err) { console.error('Copy failed: ', err); });
                });
            }

            wire('copy-email-btn', 'email-text', 'abdullahizaq321@gmail.com');
            wire('copy-phone-btn', 'phone-text', '+92 332 5785998');
        })();