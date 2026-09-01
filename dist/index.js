(() => {
    var g = typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : {});
    var patches = [];

    function getAPI() {
        return g.vendetta || g.revenge || g.bunny || {};
    }

    function showToast(msg) {
        try {
            var api = getAPI();
            if (api.ui && api.ui.toasts && typeof api.ui.toasts.showToast === "function") {
                try {
                    api.ui.toasts.showToast(msg);
                } catch (e) {
                    api.ui.toasts.showToast({ content: msg });
                }
            }
        } catch (err) {}
    }

    function onLoad() {
        try {
            var api = getAPI();
            var metro = api.metro || {};
            var patcher = api.patcher || {};
            var logger = api.logger || console;

            if (logger.info) {
                logger.info("KAINZ DSP Plugin loading...");
            }

            showToast("KAINZ DSP: Da Bat!");

            // 1. Fake Nitro / UserStore
            try {
                if (typeof metro.findByStoreName === "function" && typeof patcher.after === "function") {
                    var UserStore = metro.findByStoreName("UserStore");
                    if (UserStore && typeof UserStore.getCurrentUser === "function") {
                        var u1 = patcher.after("getCurrentUser", UserStore, function(args, user) {
                            if (user) {
                                try { user.premiumType = 2; } catch (e) {
                                    try { Object.defineProperty(user, "premiumType", { value: 2, writable: true, configurable: true }); } catch (e2) {}
                                }
                            }
                            return user;
                        });
                        patches.push(u1);

                        var u2 = patcher.after("getUser", UserStore, function(args, user) {
                            if (user) {
                                try {
                                    var currentUser = UserStore.getCurrentUser();
                                    if (currentUser && user.id === currentUser.id) {
                                        user.premiumType = 2;
                                    }
                                } catch (e) {
                                    try { Object.defineProperty(user, "premiumType", { value: 2, writable: true, configurable: true }); } catch (e2) {}
                                }
                            }
                            return user;
                        });
                        patches.push(u2);
                    }
                }
            } catch (err) {}

            // 2. Audio Mic Hook
            try {
                if (typeof metro.findByProps === "function" && typeof patcher.before === "function") {
                    var AudioManager = metro.findByProps("setMicrophoneMute");
                    if (AudioManager && typeof AudioManager.setMicrophoneMute === "function") {
                        var uMic = patcher.before("setMicrophoneMute", AudioManager, function(args) {
                            if (!args[0]) {
                                showToast("Mic dang mo - KAINZ DSP dang hoat dong");
                            }
                        });
                        patches.push(uMic);
                    }
                }
            } catch (err) {}

        } catch (globalErr) {
            showToast("Loi KAINZ DSP: " + globalErr.message);
        }
    }

    function onUnload() {
        try {
            for (var i = 0; i < patches.length; i++) {
                if (typeof patches[i] === "function") {
                    try { patches[i](); } catch (e) {}
                }
            }
            patches = [];
            showToast("KAINZ DSP: Da Tat!");
        } catch (err) {}
    }

    var pluginObj = {
        onLoad: onLoad,
        onUnload: onUnload,
        start: onLoad,
        stop: onUnload
    };
    pluginObj.default = pluginObj;

    return pluginObj;
})();
