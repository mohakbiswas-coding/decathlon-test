export const normalize = (text: string): string =>
    text.replace(/\s+/g, " ").trim().toLowerCase();

export const escapeRegex = (text: string): string =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
