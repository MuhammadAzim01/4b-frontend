export const openPrintWindow = (htmlContent) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow pop-ups to print this document.');
        return;
    }
    printWindow.document.write(htmlContent);
    printWindow.document.close();
};

export const fetchAllPages = async (fetchFunction, baseUrl) => {
    let page = 1;
    let allResults = [];
    let hasMore = true;

    while (hasMore) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        const url = `${baseUrl}${separator}page=${page}&page_size=1000`;
        const response = await fetchFunction(url);
        const data = response.data;
        allResults = allResults.concat(data.results || []);
        hasMore = !!data.next;
        page += 1;
    }

    return allResults;
};
