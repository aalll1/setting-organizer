export function archiveStateItem(item, { operationId = '', archivedAt = '' } = {}) {
    return {
        ...item,
        isActive: false,
        isArchived: true,
        archivedAt,
        archiveOperationId: operationId,
    };
}

export function isArchivedStateItem(item) {
    return Boolean(item?.isArchived) || item?.isActive === false;
}
