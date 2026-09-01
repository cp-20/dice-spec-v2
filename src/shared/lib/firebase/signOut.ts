// oxlint-disable-next-line no-restricted-imports -- signOut をキャンセル可能にする唯一の低水準ラッパー
import { signOut, type Auth } from 'firebase/auth';

export const BEFORE_SIGN_OUT_EVENT = 'dice-spec:before-sign-out';

export const signOutWithGuard = async (auth: Auth): Promise<boolean> => {
  const event = new Event(BEFORE_SIGN_OUT_EVENT, { cancelable: true });
  if (!window.dispatchEvent(event)) return false;

  await signOut(auth);
  return true;
};
