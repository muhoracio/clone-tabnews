import useSWR from "swr";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <DatabaseStatus />
      <hr />
      <UpdatedAt />
    </>
  );
}

function DatabaseStatus() {
  const { data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const {
    max_connections = "Carregando...",
    opened_connections = "Carregando...",
    version = "Carregando...",
  } = data?.dependencies?.database ?? {};

  return (
    <div>
      <h2>Banco de Dados:</h2>
      <p>Número máximo de conexões: {max_connections}</p>
      <p>Número de conexões abertas: {opened_connections}</p>
      <p>Versão do banco: {version}</p>
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });

  const updatedAtText =
    isLoading || !data?.updated_at
      ? "Carregando..."
      : new Date(data.updated_at).toLocaleString("pt-BR");

  return <div>Última atualização: {updatedAtText}</div>;
}
