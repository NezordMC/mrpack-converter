import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCcw } from 'lucide-react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + registration);
    },
    onRegisterError(error: Error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 p-4 rounded-xl border bg-card shadow-2xl max-w-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              {needRefresh ? <RefreshCcw className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm">
                {needRefresh ? 'Update Available' : 'Ready to work offline'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {needRefresh
                  ? 'New content is available. Refresh to update.'
                  : 'App has been cached for offline use.'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            {needRefresh && (
              <Button size="sm" onClick={() => updateServiceWorker(true)} className="w-full">
                Refresh
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={close} className="w-full">
              Close
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
