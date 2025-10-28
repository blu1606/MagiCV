import { Button } from '@/components/ui/button';
import { Loader2, Github, Linkedin, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';

type DataSourceStatus = 'connected' | 'disconnected' | 'syncing';

interface DataSourceCardProps {
  source: 'GitHub' | 'LinkedIn' | 'Behance' | 'YouTube';
  status: DataSourceStatus;
  lastSync?: string;
  onSync: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const sourceIcons = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Behance: (props: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.5 4.5h3.5c1.1 0 2 .9 2 2s-.9 2-2 2H6.5v-4zm0 5.5h4c1.1 0 2 .9 2 2s-.9 2-2 2h-4v-4zM4 2v20h8.5c2.5 0 4.5-2 4.5-4.5 0-1.5-.7-2.8-1.8-3.7.8-.8 1.3-2 1.3-3.3C16.5 8 14.5 6 12 6h-1V2H4zm16 8.5c0-2.5 2-4.5 4.5-4.5S24 8 24 10.5V16h-7.5c0 1.4 1.1 2.5 2.5 2.5.8 0 1.5-.4 2-1l1.5 1c-.8 1.2-2.2 2-3.5 2-2.5 0-4.5-2-4.5-4.5v-5.5zm4.5-2c-1.4 0-2.5 1.1-2.5 2.5v.5H24v-.5c0-1.4-1.1-2.5-2.5-2.5z"/>
    </svg>
  ),
  YouTube: Youtube,
};

const getSourceStyles = (source: string, status: DataSourceStatus) => {
  const baseIconStyle = 'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110';
  const baseCardHover = 'group-hover:shadow-lg';
  
  switch (source) {
    case 'GitHub':
      return {
        iconBg: 'bg-github/10 text-github',
        hoverBorder: status === 'connected' ? 'hover:border-github' : '',
        hoverShadow: status === 'connected' ? 'hover:shadow-github/20' : '',
        connectBg: 'bg-github hover:bg-github/80 text-white',
      };
    case 'LinkedIn':
      return {
        iconBg: 'bg-linkedin/10 text-linkedin',
        hoverBorder: status === 'connected' ? 'hover:border-linkedin' : '',
        hoverShadow: status === 'connected' ? 'hover:shadow-linkedin/20' : '',
        connectBg: 'bg-linkedin hover:bg-linkedin/80 text-white',
      };
    case 'Behance':
      return {
        iconBg: 'bg-behance/10 text-behance',
        hoverBorder: status === 'connected' ? 'hover:border-behance' : '',
        hoverShadow: status === 'connected' ? 'hover:shadow-behance/20' : '',
        connectBg: 'bg-behance hover:bg-behance/80 text-white',
      };
    case 'YouTube':
      return {
        iconBg: 'bg-youtube/10 text-youtube',
        hoverBorder: status === 'connected' ? 'hover:border-youtube' : '',
        hoverShadow: status === 'connected' ? 'hover:shadow-youtube/20' : '',
        connectBg: 'bg-youtube hover:bg-youtube/80 text-white',
      };
    default:
      return {
        iconBg: 'bg-primary/10 text-primary',
        hoverBorder: '',
        hoverShadow: '',
        connectBg: 'bg-primary hover:bg-primary/80',
      };
  }
};

const DataSourceCard = ({
  source,
  status,
  lastSync,
  onSync,
  onConnect,
  onDisconnect,
}: DataSourceCardProps) => {
  const Icon = sourceIcons[source];
  const styles = getSourceStyles(source, status);
  
  const isConnected = status === 'connected';
  const isSyncing = status === 'syncing';
  const isDisconnected = status === 'disconnected';

  return (
    <div
      className={cn(
        'group relative rounded-xl p-6 transition-all duration-300',
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'hover:bg-white/8',
        styles.hoverBorder,
        styles.hoverShadow,
        status === 'syncing' && 'border-primary/50'
      )}
    >
      {/* Icon and Status Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(styles.iconBg, 'w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110')}>
          <Icon className="w-6 h-6" />
        </div>
        
        <div className={cn(
          'px-3 py-1 rounded-full text-xs font-medium',
          isConnected && 'bg-primary/10 text-primary',
          isSyncing && 'bg-primary/20 text-primary animate-pulse',
          isDisconnected && 'bg-muted/50 text-muted-foreground'
        )}>
          {status === 'connected' && 'Connected'}
          {status === 'syncing' && 'Syncing...'}
          {status === 'disconnected' && 'Disconnected'}
        </div>
      </div>

      {/* Source Name */}
      <h3 className="text-xl font-semibold text-foreground mb-2">{source}</h3>

      {/* Last Sync */}
      {lastSync && (
        <p className="text-sm text-muted-foreground mb-4">
          Last synced {lastSync}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        {isDisconnected && (
          <Button
            onClick={onConnect}
            className={cn('flex-1', styles.connectBg)}
          >
            Connect
          </Button>
        )}

        {isConnected && (
          <>
            <Button
              onClick={onSync}
              variant="default"
              className="flex-1"
            >
              Sync
            </Button>
            <Button
              onClick={onDisconnect}
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              Disconnect
            </Button>
          </>
        )}

        {isSyncing && (
          <Button disabled className="flex-1">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Syncing...
          </Button>
        )}
      </div>
    </div>
  );
};

export default DataSourceCard;
