import { Prisma } from '@prisma/client';
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();
// prisma centralizado
// Rota para exibir a fila de espera
router.get('/fila-espera', async (req, res) => {
  try {
    // A variável pacientesNaFila já está disponível globalmente graças ao middleware
    res.render('fila-espera', {
      pageTitle: 'Fila de Espera',
      pageIcon: 'ri-list-check', // Ícone dinâmico para a página
      pacientes: res.locals.pacientesNaFila || [], // Usa a variável local
      messages: req.flash(''),
    });
  } catch (error) {
    console.error('Erro ao carregar a fila de espera:', error);
    res.status(500).send('Erro ao carregar a fila de espera');
    // verifica o BD
    if (error instanceof Prisma.PrismaClientInitializationError) {
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
