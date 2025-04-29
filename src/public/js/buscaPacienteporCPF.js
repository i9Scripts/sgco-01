document.getElementById('cpf').addEventListener('input', function (e) {
  const cpf = e.target.value.replace(/\\D/g, '');
  if (cpf.length === 14) {
    (function () {
      fetch('/pacientes/search/cpf?cpf=' + cpf)
        .then((response) => response.json())
        .then((paciente) => {
          if (paciente && paciente.idPaciente) {
            document.getElementById('nome').value = paciente.nome;
            document.getElementById('dataNasc').value = paciente.dataNasc.split('T')[0].split('-').reverse().join('/');
            document.getElementById('idade').value = paciente.idade;
            document.getElementById('celular').value = paciente.celular;
            document.getElementById('cep').value = paciente.cep || '';
            document.getElementById('endereco').value = paciente.endereco;
            document.getElementById('numero').value = paciente.numero;
            document.getElementById('complemento').value = paciente.complemento || '';
            document.getElementById('bairro').value = paciente.bairro;
            document.getElementById('cidade').value = paciente.cidade;
            document.getElementById('profissao').value = paciente.profissao;
            document.getElementById('responsavel').value = paciente.responsavel || '';

            document.getElementById('formMethod').value = 'PUT';
            document.querySelector('form').action = '/pacientes/' + paciente.idPaciente;
            document.querySelector('button[type="submit"]').textContent = 'Atualizar Paciente';
          } else {
            document.getElementById('formMethod').value = 'POST';
            document.querySelector('form').action = '/pacientes';
            document.querySelector('button[type="submit"]').textContent = 'Adicionar Paciente';
          }
        });
    })();
  }
});
