import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Home, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

type Registro = {
  id: string;
  time: number;
  data: string;
};

type SortField = "data" | "time";
type SortOrder = "asc" | "desc";

const Historico = () => {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [filteredRegistros, setFilteredRegistros] = useState<Registro[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [sortField, setSortField] = useState<SortField>("data");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    fetchRegistros();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [registros, dataInicio, dataFim, sortField, sortOrder]);

  const fetchRegistros = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/registros");

      if (!response.ok) throw new Error("Erro ao buscar registros");

      const data = await response.json();
      setRegistros(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistros = filteredRegistros.slice(startIndex, endIndex);

  const applyFiltersAndSort = () => {
    let filtered = [...registros];

    // Apply date filter
    if (dataInicio || dataFim) {
      filtered = filtered.filter((registro) => {
        const dataRegistro = new Date(registro.data);
        const inicio = dataInicio ? new Date(dataInicio) : null;
        const fim = dataFim ? new Date(dataFim) : null;

        if (inicio && fim) {
          return dataRegistro >= inicio && dataRegistro <= fim;
        } else if (inicio) {
          return dataRegistro >= inicio;
        } else if (fim) {
          return dataRegistro <= fim;
        }
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === "data") {
        comparison = new Date(a.data).getTime() - new Date(b.data).getTime();
      } else {
        comparison = a.time - b.time;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredRegistros(filtered);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const handleDelete = async (id: string) => {
    setLoadingDelete(true);
    try {
      const response = await fetch(`http://localhost:3000/registros/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao deletar registro");

      toast({
        title: "Registro deletado!",
        description: "O registro foi removido com sucesso.",
      });

      // Update local state
      setRegistros(registros.filter((registro) => registro.id !== id));

      setLoadingDelete(false);
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o registro.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-primary">
                Histórico de Registros
              </CardTitle>
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Voltar
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Data Início
                </label>
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Data Fim
                </label>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando registros...
              </div>
            ) : filteredRegistros.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum registro encontrado.
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary">
                      <TableHead className="text-foreground">
                        <Button
                          variant="ghost"
                          onClick={() => toggleSort("data")}
                          className="h-auto p-0 hover:text-primary font-semibold flex items-center"
                        >
                          Data e Hora
                          {getSortIcon("data")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-foreground">
                        <Button
                          variant="ghost"
                          onClick={() => toggleSort("time")}
                          className="h-auto p-0 hover:text-primary font-semibold flex items-center"
                        >
                          Tempo (ms)
                          {getSortIcon("time")}
                        </Button>
                      </TableHead>
                      <TableHead className="text-foreground text-right">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRegistros.map((registro) => (
                      <TableRow key={registro.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {format(
                            new Date(registro.data),
                            "dd/MM/yyyy 'às' HH:mm:ss",
                            { locale: ptBR }
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                            {registro.time} ms
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(registro.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                            disabled={loadingDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="mt-4 text-sm text-muted-foreground text-center">
              Total de registros: {filteredRegistros.length}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex align-center justify-center mx-auto">
        <div className="flex items-center gap-2 mb-4 ">
          <label className="text-sm font-medium">Itens por página:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // reset para a primeira página
            }}
            className="border rounded px-2 py-1 bg-secondary sm:text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Anterior
          </Button>

          <span>
            Página {currentPage} de {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Historico;
