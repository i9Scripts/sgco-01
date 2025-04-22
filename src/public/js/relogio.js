function clock() {
  var monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  var dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  var today = new Date();

  // Atualiza a data por extenso
  document.getElementById('Date').innerHTML =
    dayNames[today.getDay()] +
    ', ' +
    today.getDate() +
    ' de ' +
    monthNames[today.getMonth()] +
    ' de ' +
    today.getFullYear();

  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();

  var day = h < 11 ? 'AM' : 'PM';
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;

  // Atualiza a hora, minutos e segundos
  document.getElementById('hours').innerHTML = h;
  document.getElementById('min').innerHTML = m;
  document.getElementById('sec').innerHTML = s;
}

// Atualiza a cada segundo
var inter = setInterval(clock, 1000);
