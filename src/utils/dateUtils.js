export function calcularIdadeFromDate(dateInput) {
  if (!dateInput) return null;

  let d = dateInput;
  if (typeof d === 'string') {
    // dd/mm/yyyy
    if (d.includes('/')) {
      const [day, month, year] = d.split('/');
      d = new Date(Number(year), Number(month) - 1, Number(day));
    } else {
      // yyyy-mm-dd or ISO
      d = new Date(d);
    }
  }

  if (!(d instanceof Date) || isNaN(d.getTime())) return null;

  const hoje = new Date();
  let idade = hoje.getFullYear() - d.getFullYear();
  if (hoje.getMonth() < d.getMonth() || (hoje.getMonth() === d.getMonth() && hoje.getDate() < d.getDate())) {
    idade--;
  }
  return idade >= 0 ? idade : null;
}
