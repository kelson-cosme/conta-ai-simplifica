import { Upload, BarChart3, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">ContábilFácil</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Upload className="h-4 w-4 mr-2" />
              Upload Notas
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-4 w-4 mr-2" />
              Ajuda IA
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;