export const formatCurrency = (value: string) => {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  const amount = (parseInt(numeric) / 100).toFixed(2);
  return amount.replace('.', ',');
};

export const formatDate = (value: string) => {
  const numeric = value.replace(/\D/g, '');
  if (!numeric) return '';
  let formatted = numeric;
  if (numeric.length > 2) {
    formatted = `${numeric.slice(0, 2)}/${numeric.slice(2)}`;
  }
  if (numeric.length > 4) {
    formatted = `${numeric.slice(0, 2)}/${numeric.slice(2, 4)}/${numeric.slice(4, 8)}`;
  }
  return formatted;
};

export const parseDateToBR = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export const parseBRDateToISO = (brDate: string) => {
  if (!brDate) return null;
  return brDate.split('/').reverse().join('-');
};
