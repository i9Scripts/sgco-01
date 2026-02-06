export function clearFlashMessages(req, res, next) {
  // Move todas as mensagens de flash para `res.locals.messages`
  // para que as views (ex: footer/_mensagens) as acessem diretamente.
  // `req.flash()` retorna um objeto com arrays por tipo de mensagem.
  res.locals.messages = req.flash();
  next();
}
