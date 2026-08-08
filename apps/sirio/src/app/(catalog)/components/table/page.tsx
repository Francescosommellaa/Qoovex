import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@qoovex/ui/components/table";

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Pagato",
    totalAmount: "€ 2.500,00",
    paymentMethod: "Bonifico",
  },
  {
    invoice: "INV002",
    paymentStatus: "In attesa",
    totalAmount: "€ 150,00",
    paymentMethod: "Carta di Credito",
  },
  {
    invoice: "INV003",
    paymentStatus: "Non pagato",
    totalAmount: "€ 350,00",
    paymentMethod: "Bonifico",
  },
];

export default function TablePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Table"
        description="Un componente tabella responsivo."
        importPath="import { Table, TableBody, TableCell, ... } from '@qoovex/ui/components/table'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Esempio Base</h2>
          <SpecimenGrid cols={1}>
            <Specimen>
              <Table>
                <TableCaption>Lista delle fatture recenti.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Fattura</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Metodo</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice}>
                      <TableCell className="font-medium">{invoice.invoice}</TableCell>
                      <TableCell>{invoice.paymentStatus}</TableCell>
                      <TableCell>{invoice.paymentMethod}</TableCell>
                      <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
