//Formatar data
export function formatarData(data) {
  if (!(data instanceof Date) || isNaN(data.getTime())) {
    return null; // Retorna null se não for uma data válida
  }

  const dia = String(data.getDate()).padStart(2, '0');
  // getMonth() retorna 0-11, então somamos 1
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}
// Calcular idade
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
