function capitalizarPrimeiraLetra(campo) {
    // Pega o valor do campo e divide em palavras
    const palavras = campo.value.split(' ');
    
    // Transforma cada palavra: primeira letra em maiúscula e o resto em minúscula
    for (let i = 0; i < palavras.length; i++) {
        palavras[i] = palavras[i].charAt(0).toUpperCase() + palavras[i].slice(1).toLowerCase();
    }
 
    // Junta as palavras de volta com um espaço
    campo.value = palavras.join(' ');
}
