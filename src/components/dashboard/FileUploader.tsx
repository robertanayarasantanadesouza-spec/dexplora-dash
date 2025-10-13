import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet } from "lucide-react";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUploader = ({ onFileSelect, isLoading }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="border-dashed border-2 hover:border-primary transition-colors">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-primary/10 p-6 mb-4">
          <FileSpreadsheet className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Carregar Planilha Financeira
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
          Selecione o arquivo Excel com os dados das liberações de veículos
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button onClick={handleClick} disabled={isLoading} size="lg">
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Processando..." : "Selecionar Arquivo"}
        </Button>
      </CardContent>
    </Card>
  );
};
