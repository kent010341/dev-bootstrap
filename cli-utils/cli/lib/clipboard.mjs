import clipboard from 'clipboardy';

/**
 * Best-effort clipboard write. Headless Linux without xclip/xsel/wl-clipboard
 * (and other environments without a clipboard backend) will throw here -
 * that's reported as a warning instead of failing the whole command.
 */
export async function copyToClipboard(text) {
  try {
    await clipboard.write(text);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}
