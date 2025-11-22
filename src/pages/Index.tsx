import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface RegionData {
  region: string;
  percentage: number;
  total: number;
  filled: number;
}

const RUSSIAN_REGIONS = [
  'Москва', 'Санкт-Петербург', 'Московская область', 'Краснодарский край', 
  'Свердловская область', 'Ростовская область', 'Республика Татарстан',
  'Новосибирская область', 'Нижегородская область', 'Челябинская область'
];

const Index = () => {
  const [data, setData] = useState<RegionData[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        
        const parsedData: RegionData[] = jsonData.map((row: any) => ({
          region: row['Регион'] || row['region'] || row['Region'] || 'Не указан',
          total: parseInt(row['Всего'] || row['total'] || row['Total'] || '0'),
          filled: parseInt(row['Заполнено'] || row['filled'] || row['Filled'] || '0'),
          percentage: 0
        }));

        parsedData.forEach(item => {
          item.percentage = item.total > 0 ? Math.round((item.filled / item.total) * 100) : 0;
        });

        setData(parsedData);
        toast({
          title: "Файл загружен",
          description: `Обработано ${parsedData.length} регионов`,
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось прочитать файл. Проверьте формат.",
          variant: "destructive",
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const filteredData = selectedRegion === 'all' 
    ? data 
    : data.filter(d => d.region === selectedRegion);

  const avgPercentage = data.length > 0 
    ? Math.round(data.reduce((acc, d) => acc + d.percentage, 0) / data.length) 
    : 0;

  const totalFilled = data.reduce((acc, d) => acc + d.filled, 0);
  const totalRecords = data.reduce((acc, d) => acc + d.total, 0);

  const getColorByPercentage = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Аналитический дашборд</h1>
            <p className="text-muted-foreground">Процент заполнения по регионам</p>
          </div>
          {data.length > 0 && (
            <Button onClick={exportToPDF} variant="outline" className="gap-2">
              <Icon name="Download" size={18} />
              Экспорт в PDF
            </Button>
          )}
        </div>

        {data.length === 0 ? (
          <Card 
            className={cn(
              "p-12 border-2 border-dashed transition-all duration-200",
              isDragging && "border-primary bg-primary/5 scale-[1.02]"
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 rounded-full bg-primary/10 animate-pulse">
                <Icon name="Upload" size={48} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Загрузите Excel файл</h3>
                <p className="text-muted-foreground mb-4">
                  Перетащите файл сюда или нажмите кнопку ниже
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Формат: столбцы "Регион", "Всего", "Заполнено"
                </p>
              </div>
              <label>
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button className="cursor-pointer" asChild>
                  <span className="gap-2">
                    <Icon name="FileSpreadsheet" size={18} />
                    Выбрать файл
                  </span>
                </Button>
              </label>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon name="BarChart3" size={24} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Средний процент</p>
                    <p className="text-3xl font-bold">{avgPercentage}%</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Icon name="MapPin" size={24} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Регионов</p>
                    <p className="text-3xl font-bold">{data.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <Icon name="CheckCircle2" size={24} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Заполнено</p>
                    <p className="text-3xl font-bold">{totalFilled}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <Icon name="Database" size={24} className="text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Всего записей</p>
                    <p className="text-3xl font-bold">{totalRecords}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex gap-4 items-center">
              <Icon name="Filter" size={20} className="text-muted-foreground" />
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Все регионы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все регионы</SelectItem>
                  {data.map((d) => (
                    <SelectItem key={d.region} value={d.region}>
                      {d.region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRegion !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedRegion('all')}
                  className="gap-2"
                >
                  <Icon name="X" size={16} />
                  Сбросить
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Icon name="Map" size={20} />
                  Карта регионов
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {RUSSIAN_REGIONS.slice(0, 10).map((region) => {
                    const regionData = data.find(d => d.region === region);
                    const percentage = regionData?.percentage || 0;
                    return (
                      <div 
                        key={region}
                        className="p-4 rounded-lg border border-border hover:border-primary transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium truncate">{region}</span>
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            getColorByPercentage(percentage)
                          )} />
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Icon name="TrendingUp" size={20} />
                  Детальная статистика
                </h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredData.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-lg bg-card/50 border border-border hover:bg-card transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getColorByPercentage(item.percentage)
                          )} />
                          <span className="font-medium">{item.region}</span>
                        </div>
                        <Badge variant={item.percentage >= 80 ? "default" : "secondary"}>
                          {item.percentage}%
                        </Badge>
                      </div>
                      <Progress value={item.percentage} className="h-2 mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Заполнено: {item.filled}</span>
                        <span>Всего: {item.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Icon name="PieChart" size={20} />
                Распределение по категориям
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500" />
                    <span className="text-sm">Высокое заполнение (≥80%)</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {data.filter(d => d.percentage >= 80).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((data.filter(d => d.percentage >= 80).length / data.length) * 100)}% от всех регионов
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <span className="text-sm">Среднее заполнение (50-79%)</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {data.filter(d => d.percentage >= 50 && d.percentage < 80).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((data.filter(d => d.percentage >= 50 && d.percentage < 80).length / data.length) * 100)}% от всех регионов
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-sm">Низкое заполнение (&lt;50%)</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {data.filter(d => d.percentage < 50).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((data.filter(d => d.percentage < 50).length / data.length) * 100)}% от всех регионов
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      <style>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          button, .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Index;
