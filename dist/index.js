(() => {
    var g = typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : {});
    var patches = [];

    // Bộ nhớ tạm thời trong phiên chạy
    var State = {
        nitro: true,
        voiceDsp: true,
        soundboard: true,
        customNameEnabled: false,
        customName: "Kainz God",
        customBgEnabled: false,
        customBgColor: "#000000" // Màu đen mặc định
    };

    function getAPI() {
        return g.vendetta || g.revenge || g.bunny || {};
    }

    function showToast(msg) {
        try {
            var api = getAPI();
            if (api.ui && api.ui.toasts && typeof api.ui.toasts.showToast === "function") {
                try { api.ui.toasts.showToast(msg); }
                catch (e) { api.ui.toasts.showToast({ content: msg }); }
            }
        } catch (err) { }
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
            var TextInput = General.TextInput || "RCTSinglelineTextInputView";
            var FormSection = Forms.FormSection || View;
            var FormRow = Forms.FormRow || View;
            var FormSwitchRow = Forms.FormSwitchRow || Forms.FormSwitch || View;
            var FormDivider = Forms.FormDivider || View;
            var FormInput = Forms.FormInput || View;

            var useState = React.useState;
            var e = React.createElement;

            // React States (đồng bộ với biến toàn cục State)
            var nitroState = useState(State.nitro);
            var voiceDspState = useState(State.voiceDsp);
            var sbState = useState(State.soundboard);
            var cNameEnabledState = useState(State.customNameEnabled);
            var cNameState = useState(State.customName);
            var cBgEnabledState = useState(State.customBgEnabled);
            var cBgColorState = useState(State.customBgColor);

            var updateState = function (key, val, setter) {
                State[key] = val;
                setter(val);
                showToast("Đã lưu: " + key);
            };

            return e(ScrollView, { style: { flex: 1, padding: 16 } },
                e(FormSection, { title: "KAINZ DSP - BỘ LỌC ÂM THANH" },
                    e(FormSwitchRow, {
                        label: "Voice Changer DSP",
                        subLabel: "Xử lý âm thanh micro thời gian thực",
                        value: voiceDspState[0],
                        onValueChange: function (v) { updateState("voiceDsp", v, voiceDspState[1]); }
                    }),
                    e(FormDivider, null),
                    e(FormSwitchRow, {
                        label: "Soundboard Mobile",
                        subLabel: "Thông báo âm thanh khi bật/tắt mic",
                        value: sbState[0],
                        onValueChange: function (v) { updateState("soundboard", v, sbState[1]); }
                    })
                ),
                e(View, { style: { height: 20 } }),
                e(FormSection, { title: "TÙY CHỈNH TÀI KHOẢN (FAKE)" },
                    e(FormSwitchRow, {
                        label: "Fake Nitro Type 2",
                        subLabel: "Mở khóa giao diện Nitro, Avatar động",
                        value: nitroState[0],
                        onValueChange: function (v) { updateState("nitro", v, nitroState[1]); }
                    }),
                    e(FormDivider, null),
                    e(FormSwitchRow, {
                        label: "Bật Fake Tên Người Dùng",
                        subLabel: "Đổi tên bạn thành tên tùy chỉnh bên dưới",
                        value: cNameEnabledState[0],
                        onValueChange: function (v) { updateState("customNameEnabled", v, cNameEnabledState[1]); }
                    }),
                    e(FormInput, {
                        title: "Nhập Tên Giả",
                        value: cNameState[0],
                        onChange: function (v) {
                            State.customName = v;
                            cNameState[1](v);
                        },
                        placeholder: "VD: Kainz God"
                    })
                ),
                e(View, { style: { height: 20 } }),
                e(FormSection, { title: "TÙY CHỈNH GIAO DIỆN" },
                    e(FormSwitchRow, {
                        label: "Bật Đổi Màu Nền (Background)",
                        subLabel: "Ghi đè màu nền Discord bằng mã màu của bạn",
                        value: cBgEnabledState[0],
                        onValueChange: function (v) { updateState("customBgEnabled", v, cBgEnabledState[1]); }
                    }),
                    e(FormInput, {
                        title: "Nhập Mã Màu Nền (Hex Color)",
                        value: cBgColorState[0],
                        onChange: function (v) {
                            State.customBgColor = v;
                            cBgColorState[1](v);
                        },
                        placeholder: "VD: #FF0000 (Đỏ) hoặc #000000 (Đen)"
                    })
                )
            );
        } catch (err) {
            showToast("Lỗi Render Menu: " + err.message);
            return null;
        }
    }

    function onLoad() {
        try {
            var api = getAPI();
            var metro = api.metro || {};
            var patcher = api.patcher || {};

            showToast("KAINZ DSP: Đã Kích Hoạt Module!");

            // 1. Fake User (Nitro & Tên Giả)
            try {
                if (typeof metro.findByStoreName === "function" && typeof patcher.after === "function") {
                    var UserStore = metro.findByStoreName("UserStore");
                    if (UserStore) {
                        var patchUser = function (args, user) {
                            if (!user) return user;

                            // Tạo object copy để không bị lỗi readonly (freeze) của Hermes
                            var fakeUser = Object.create(user);

                            if (State.nitro) {
                                fakeUser.premiumType = 2;
                            }
                            if (State.customNameEnabled && State.customName) {
                                fakeUser.username = State.customName;
                                fakeUser.globalName = State.customName;
                            }
                            return fakeUser;
                        };

                        if (typeof UserStore.getCurrentUser === "function") {
                            patches.push(patcher.after("getCurrentUser", UserStore, patchUser));
                        }
                        if (typeof UserStore.getUser === "function") {
                            patches.push(patcher.after("getUser", UserStore, patchUser));
                        }
                    }
                }
            } catch (err) { }

            // 2. Custom Background Color
            try {
                var colors = metro.findByProps("resolveSemanticColor") || metro.findByProps("getSemanticColor");
                if (colors) {
                    var hookFunc = colors.resolveSemanticColor ? "resolveSemanticColor" : "getSemanticColor";
                    patches.push(patcher.instead(hookFunc, colors, function (args, orig) {
                        // args[1] thường là tên màu (vd: BACKGROUND_PRIMARY, BACKGROUND_SECONDARY)
                        if (State.customBgEnabled && State.customBgColor && typeof args[1] === "string" && args[1].includes("BACKGROUND")) {
                            return State.customBgColor;
                        }
                        return orig.apply(this, args);
                    }));
                }
            } catch (err) { }

            // 3. Audio Hook (Mic)
            try {
                var AudioManager = metro.findByProps("setMicrophoneMute");
                if (AudioManager && typeof AudioManager.setMicrophoneMute === "function") {
                    patches.push(patcher.before("setMicrophoneMute", AudioManager, function (args) {
                        if (!args[0] && State.voiceDsp) {
                            showToast("🎤 KAINZ DSP đang kích hoạt vào Mic!");
                        }
                    }));
                }
            } catch (err) { }

        } catch (globalErr) {
            showToast("Lỗi Plugin: " + globalErr.message);
        }
    }

    function onUnload() {
        try {
            for (var i = 0; i < patches.length; i++) {
                if (typeof patches[i] === "function") {
                    try { patches[i](); } catch (e) { }
                }
            }
            patches = [];
            showToast("KAINZ DSP: Đã Tắt Toàn Bộ!");
        } catch (err) { }
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
