// Express.js route
app.get('/dashboard', async (req, res) => {
  try {
    const pacientesDia = await prisma.paciente.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Hoje
        },
      },
    });

    const pacientesMiopia = await prisma.paciente.count({
      where: {
        diagnostico: 'Miopia',
      },
    });

    // Obtenha outros dados...

    res.render('dashboard', {
      pacientesDia: pacientesDia,
      pacientesMiopia: pacientesMiopia,
      // Passe outros dados para o EJS
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar o dashboard');
  }
});

// EJS (dashboard.ejs)
<%- include('layout', { title: 'Dashboard' }) %>

<div class="container">
  <h1>Dashboard</h1>
  <div class="row">
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Pacientes do Dia</h5>
          <p class="card-text"><%= pacientesDia %></p>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Pacientes com Miopia</h5>
          <p class="card-text"><%= pacientesMiopia %></p>
        </div>
      </div>
    </div>
    <!-- Outros painéis -->
  </div>
</div>