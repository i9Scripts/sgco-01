import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

const router = Router();
const prisma = new PrismaClient();
// Rota para exibir a fila de espera
router.get('/fila-espera', async (req, res) => {
  try {
    const pacientesNaFila = await prisma.paciente.findMany({
      where: { naFila: true }, // Apenas pacientes na fila
      include: { anamneses: true }, // Inclua as anamneses, se necessário
      orderBy: { createdAt: 'asc' }, // Ordene por data de criação
    });
    // Renderize a view e passe os pacientes
    res.render('fila-espera', {
      pageTitle: 'Fila de Espera',
      pageIcon: 'ri-list-check', // Ícone dinâmico para a página
      pacientes: pacientesNaFila,
      messages: req.flash(''),
    });
  } catch (error) {
    console.error('Erro ao carregar a fila de espera:', error);
    res.status(500).send('Erro ao carregar a fila de espera');
    // verifica o BD
    if (error instanceof prisma.PrismaClientInitializationError) {
      req.flash('error', 'Erro ao conectar ao banco de dados. Verifique a conexão.');
    } else {
      req.flash('error', 'Erro ao exibir formulário. Tente novamente.');
    }
  }
});

// Rota para marcar um paciente como atendido
router.put('/paciente/:idPaciente/atendido', async (req, res) => {
  const { idPaciente } = req.params;
  const dadosAtualizados = req.body;

  try {
    const pacienteAtualizado = await prisma.paciente.update({
      where: {
        idPaciente: parseInt(idPaciente), // Converte o ID para inteiro
      },
      data: {
        naFila: false, // Atualiza o status para "fora da fila"
      },
    });

    console.log('Paciente atualizado:', pacienteAtualizado);
    res.redirect('/fila-espera'); // Redireciona para a página da fila de espera
  } catch (error) {
    console.error('Erro ao marcar como atendido:', error);
    res.status(500).send('Erro ao marcar como atendido.');
  }
});

export default router;
