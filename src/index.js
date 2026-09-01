import { findByStoreName, findByProps } from "@vendetta/metro";
import { after, before } from "@vendetta/patcher";
import { showToast } from "@vendetta/ui/toasts";
import { logger } from "@vendetta";

const UserStore = findByStoreName("UserStore");
const AudioManager = findByProps("setMicrophoneMute");

let patches = [];

export const onLoad = () => {
    logger.info("KAINZ DSP Plugin loading...");
    showToast("KAINZ DSP Plugin Da Bat!");

    if (UserStore) {
        const unpatchGetCurrentUser = after("getCurrentUser", UserStore, (args, user) => {
            if (user) {
                user.premiumType = 2;
            }
            return user;
        });
        patches.push(unpatchGetCurrentUser);

        const unpatchGetUser = after("getUser", UserStore, (args, user) => {
            if (user) {
                const currentUser = UserStore.getCurrentUser();
                if (currentUser && user.id === currentUser.id) {
                    user.premiumType = 2;
                }
            }
            return user;
        });
        patches.push(unpatchGetUser);
    } else {
        logger.warn("KAINZ DSP: UserStore khong tim thay");
    }

    if (AudioManager) {
        const unpatchMic = before("setMicrophoneMute", AudioManager, (args) => {
            const isMuted = args[0];
            if (!isMuted) {
                showToast("Mic dang mo - KAINZ DSP dang hoat dong");
            }
        });
        patches.push(unpatchMic);
    } else {
        logger.warn("KAINZ DSP: AudioManager khong tim thay");
    }
};

export const onUnload = () => {
    for (const unpatch of patches) {
        unpatch();
    }
    patches = [];
    showToast("KAINZ DSP Plugin Da Tat!");
};
