export const formatCurrency = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '-');
