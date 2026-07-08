export function updateArrayItem(items, id, updater) {
    return items.map((item) => (item.id === id ? updater({ ...item }) : item));
}

export function removeArrayItem(items, id) {
    return items.filter((item) => item.id !== id);
}

export function parseKeywordList(value) {
    return value
        .split(/[,，\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
}

export function formatKeywordList(value) {
    return Array.isArray(value) ? value.join('，') : '';
}
