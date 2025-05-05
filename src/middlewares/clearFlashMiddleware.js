export function clearFlashMessages(req, res, next) {
  req.flash(''); // Acessa e limpa as mensagens
  next();
}
