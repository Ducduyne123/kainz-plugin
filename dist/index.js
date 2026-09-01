var vendettaPlugin = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    default: () => src_default,
    onLoad: () => onLoad,
    onUnload: () => onUnload,
    start: () => start,
    stop: () => stop
  });
  var g = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
  function getVendetta() {
    return g.vendetta || g.revenge || g.bunny || {};
  }
  var patches = [];
  function notifyUser(msg) {
    try {
      const v = getVendetta();
      if (v.ui && v.ui.toasts && typeof v.ui.toasts.showToast === "function") {
        try {
          v.ui.toasts.showToast(msg);
        } catch {
          v.ui.toasts.showToast({ content: msg });
        }
      }
    } catch {
    }
  }
  function onLoad() {
    try {
      const v = getVendetta();
      const metro = v.metro || {};
      const patcher = v.patcher || {};
      const logger = v.logger || console;
      if (logger.info) {
        logger.info("KAINZ DSP Plugin loading...");
      }
      notifyUser("KAINZ DSP: \u0110\xE3 K\xEDch Ho\u1EA1t!");
      try {
        const findByStoreName = metro.findByStoreName;
        const UserStore = typeof findByStoreName === "function" ? findByStoreName("UserStore") : null;
        if (UserStore && typeof UserStore.getCurrentUser === "function" && typeof patcher.after === "function") {
          const unpatch1 = patcher.after("getCurrentUser", UserStore, (args, user) => {
            if (user) {
              try {
                user.premiumType = 2;
              } catch {
                try {
                  Object.defineProperty(user, "premiumType", {
                    value: 2,
                    writable: true,
                    configurable: true
                  });
                } catch {
                }
              }
            }
            return user;
          });
          patches.push(unpatch1);
          const unpatch2 = patcher.after("getUser", UserStore, (args, user) => {
            if (user) {
              try {
                const currentUser = UserStore.getCurrentUser();
                if (currentUser && user.id === currentUser.id) {
                  user.premiumType = 2;
                }
              } catch {
                try {
                  Object.defineProperty(user, "premiumType", {
                    value: 2,
                    writable: true,
                    configurable: true
                  });
                } catch {
                }
              }
            }
            return user;
          });
          patches.push(unpatch2);
        }
      } catch (e) {
      }
      try {
        const findByProps = metro.findByProps;
        const AudioManager = typeof findByProps === "function" ? findByProps("setMicrophoneMute") : null;
        if (AudioManager && typeof AudioManager.setMicrophoneMute === "function" && typeof patcher.before === "function") {
          const unpatchMic = patcher.before("setMicrophoneMute", AudioManager, (args) => {
            const isMuted = args[0];
            if (!isMuted) {
              notifyUser("Mic \u0111ang m\u1EDF - KAINZ DSP \u0111ang ho\u1EA1t \u0111\u1ED9ng");
            }
          });
          patches.push(unpatchMic);
        }
      } catch (e) {
      }
    } catch (err) {
      notifyUser("L\u1ED7i b\u1EADt KAINZ DSP: " + err.message);
    }
  }
  function onUnload() {
    try {
      for (const unpatch of patches) {
        if (typeof unpatch === "function") {
          try {
            unpatch();
          } catch {
          }
        }
      }
      patches = [];
      notifyUser("KAINZ DSP: \u0110\xE3 T\u1EAFt Plugin!");
    } catch {
    }
  }
  var start = onLoad;
  var stop = onUnload;
  var src_default = {
    onLoad,
    onUnload,
    start,
    stop
  };
  return __toCommonJS(src_exports);
})();
vendettaPlugin.default = vendettaPlugin;
vendettaPlugin;
