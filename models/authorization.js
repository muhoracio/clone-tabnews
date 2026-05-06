/**
 * Função que verifica se usuário pode (está autorizado) a acessar certo recurso.
 * @param {object} user - Usuário do contexto
 * @param {string} feature - Feature requirida ("ação:objeto:modificador")
 * @param {object} resource - Recurso alvo
 */
function can(user, feature, resource) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

const authorization = {
  can,
};

export default authorization;
