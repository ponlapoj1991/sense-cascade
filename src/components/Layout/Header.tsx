import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Download, 
  Share2, 
  RefreshCw,
  BarChart3,
  User
} from "lucide-react";

interface HeaderProps {
  lastUpdated?: Date;
  totalRecords?: number;
}

export function Header({ lastUpdated = new Date(), totalRecords = 0 }: HeaderProps) {
  const formatLastUpdated = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="bg-gradient-hero shadow-card border-0 mb-8">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          {/* Left side - Brand and title */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white">
                Social Listening Dashboard
              </h1>
              <p className="text-white/80 text-lg">
                Real Smart Analytics
              </p>
            </div>
          </div>

          {/* Right side - Status and actions */}
          <div className="flex items-center gap-4">
            {/* Status indicators */}
            <div className="flex items-center gap-3 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <span>Updated: {formatLastUpdated(lastUpdated)}</span>
              </div>
              
              {totalRecords > 0 && (
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {totalRecords.toLocaleString()} records
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 border-white/30"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 border-white/30"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 border-white/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>

              {/* User profile */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 border-white/30 px-3"
              >
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}