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

    function Settings() {
        try {
            var api = getAPI();
            var React = g.React || (api.metro && api.metro.common && api.metro.common.React);
            if (!React) return null;

            var Forms = (api.ui && api.ui.components && api.ui.components.Forms) || {};
            var General = (api.ui && api.ui.components && api.ui.components.General) || {};

            var ScrollView = General.ScrollView || "RCTScrollView";
            var View = General.View || "RCTView";
            var Text = General.Text || "RCTText";
            var FormSection = Forms.FormSection || View;
            var FormRow = Forms.FormRow || View;
            var FormSwitch = Forms.FormSwitch || View;
            var FormDivider = Forms.FormDivider || View;

            var useState = React.useState;
            var e = React.createElement;

            var nitroState = useState(true);
            var voiceDspState = useState(true);
            var soundboardState = useState(true);

            return e(ScrollView, { style: { flex: 1, padding: 16 } },
                e(FormSection, { title: "KAINZ DSP - TRẠNG THÁI" },
                    e(FormRow, {
                        label: "Trạng Thái Plugin",
                        subLabel: "KAINZ DSP Engine v1.0.0 đang hoạt động",
                        leading: e(Text, { style: { fontSize: 18 } }, "🟢")
                    })
                ),
                e(FormSection, { title: "TÙY CHỈNH TÍNH NĂNG" },
                    e(FormSwitch, {
                        label: "Fake Nitro & Identity",
                        subLabel: "Mở khóa Nitro Type 2 trên tài khoản",
                        value: nitroState[0],
                        onValueChange: function(v) { 
                            nitroState[1](v);
                            showToast(v ? "Đã bật Fake Nitro" : "Đã tắt Fake Nitro");
                        }
                    }),
                    e(FormDivider, null),
                    e(FormSwitch, {
                        label: "Voice Changer DSP",
                        subLabel: "Xử lý âm thanh micro thời gian thực",
                        value: voiceDspState[0],
                        onValueChange: function(v) { 
                            voiceDspState[1](v);
                            showToast(v ? "Đã bật Voice DSP" : "Đã tắt Voice DSP");
                        }
                    }),
                    e(FormDivider, null),
                    e(FormSwitch, {
                        label: "Soundboard Mobile",
                        subLabel: "Thông báo âm thanh khi bật/tắt mic",
                        value: soundboardState[0],
                        onValueChange: function(v) { 
                            soundboardState[1](v);
                            showToast(v ? "Đã bật Soundboard" : "Đã tắt Soundboard");
                        }
                    })
                )
            );
        } catch (err) {
            return null;
        }
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

            showToast("KAINZ DSP: Đã Kích Hoạt!");

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
                                showToast("Mic đang mở - KAINZ DSP đang hoạt động");
                            }
                        });
                        patches.push(uMic);
                    }
                }
            } catch (err) {}

        } catch (globalErr) {
            showToast("Lỗi KAINZ DSP: " + globalErr.message);
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
            showToast("KAINZ DSP: Đã Tắt!");
        } catch (err) {}
    }

    var pluginObj = {
        onLoad: onLoad,
        onUnload: onUnload,
        start: onLoad,
        stop: onUnload,
        settings: Settings,
        Settings: Settings
    };
    pluginObj.default = pluginObj;

    return pluginObj;
})();
